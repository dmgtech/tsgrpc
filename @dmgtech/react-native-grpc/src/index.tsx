import * as ReactNative from 'react-native';
import type { EmitterSubscription } from 'react-native';
import * as Native from './grpc-native';
import {
  CallEvent,
  createCall,
  onCallEvent,
  waitForCallEvent,
  abandonCall,
} from './callState';
export { Native };

type ChannelArgs = {
  host: string;
  port: number;
  secure?: boolean;
};

type UnaryRequestArgs = {
  method: string;
  messageBase64: string;
};

type NativeEvent =
  | {
      type: 'pong';
      number: number;
    }
  | CallEvent;

let grpcEmitter: ReactNative.NativeEventEmitter;
let _listener: EmitterSubscription;
const pingResolves = new Map<
  number,
  (value: void | PromiseLike<void>) => void
>();

function subscribe() {
  if (grpcEmitter === undefined) {
    grpcEmitter = new ReactNative.NativeEventEmitter(
      ReactNative.NativeModules.Grpc
    );
    grpcEmitter.removeAllListeners('grpc-call-event');
    _listener = grpcEmitter.addListener(
      'grpc-call-event',
      (event: NativeEvent) => {
        switch (event.type) {
          case 'pong': {
            const resolve = pingResolves.get(event.number);
            if (resolve) resolve();
            return;
          }
          default: {
            const { callId } = event;
            onCallEvent(callId, event);
            return;
          }
        }
      }
    );
  }
}

export function shutdown() {
  _listener.remove();
}

let pingId = 1;

export async function ping(): Promise<void> {
  subscribe();
  const id = pingId++;
  const promise = new Promise<void>((resolve) => {
    pingResolves.set(id, resolve);
  });
  await Native.Grpc.ping(id);
  await promise;
}

function nextCallEvent(callId: string): Promise<CallEvent | null> {
  return new Promise((resolve) => {
    waitForCallEvent(callId, resolve);
  });
}

export async function unaryCall(
  args: UnaryRequestArgs & ChannelArgs
): Promise<string> {
  subscribe();
  const callId = await Native.Grpc.createCall({
    host: args.host,
    port: args.port,
    method: args.method,
    serverStream: false,
    messageBase64: args.messageBase64,
    secure: args.secure,
  });
  try {
    createCall(callId);
    // once we get here, we've got the call id, with which future events will be associated
    for (;;) {
      const callEvent = await nextCallEvent(callId);
      if (!callEvent) break;
      if (callEvent.type === 'receive') {
        return callEvent.messageBase64;
      }
      if (callEvent.type === 'fail') {
        throw new Error(callEvent.error.message);
      }
    }
    throw new Error('call ended with no response');
  } finally {
    abandonCall(callId);
  }
}

export async function* serverStreamingCall(
  args: UnaryRequestArgs & ChannelArgs
): AsyncIterator<string> {
  subscribe();
  const callId = await Native.Grpc.createCall({
    host: args.host,
    port: args.port,
    method: args.method,
    serverStream: true,
    messageBase64: args.messageBase64,
    secure: args.secure,
  });
  try {
    createCall(callId);
    for (;;) {
      const callEvent = await nextCallEvent(callId);
      if (!callEvent) break;
      if (callEvent.type === 'receive') {
        yield callEvent.messageBase64;
      } else if (callEvent.type === 'fail') {
        throw new Error(callEvent.error.message);
      } else if (callEvent.type === 'end') {
        break;
      }
    }
  } finally {
    abandonCall(callId);
  }
}
