const callStates = new Map<string, CallState>();

type NativeError = {
  kind: 'native';
  message: string;
  type: string;
  inner?: NativeError;
};

type GrpcError = {
  kind: 'grpc';
  code: number;
  status: string;
  message: string;
};

export type CallEvent =
  | {
      type: 'receive';
      callId: string;
      messageBase64: string;
    }
  | {
      type: 'fail';
      callId: string;
      error: NativeError | GrpcError;
    }
  | {
      type: 'end';
      callId: string;
    };

type CallResolve = (
  value: CallEvent | PromiseLike<CallEvent | null> | null
) => void;
type CallState = {
  readonly queue: CallEvent[];
  readonly waiter: CallResolve[];
};

export function onCallEvent(callId: string, event: CallEvent) {
  const state = callStates.get(callId);
  if (!state) {
    if (event.type !== 'end')
      console.warn(callId, 'ignoring event for unknown call id ', event);
    return;
  }
  if (state.waiter.length > 0) {
    for (;;) {
      const waiter = state.waiter.shift();
      if (!waiter) break;
      waiter(event);
    }
    checkComplete(event);
    return;
  }
  state.queue.push(event);
}

export function waitForCallEvent(callId: string, resolve: CallResolve) {
  const state = callStates.get(callId);
  if (!state) {
    resolve(null);
    return;
  }
  if (state.queue.length > 0) {
    const next = state.queue.shift()!;
    checkComplete(next);
    resolve(next);
    return;
  }
  state.waiter.push(resolve);
}

export function createCall(callId: string) {
  callStates.set(callId, { queue: [], waiter: [] });
}

function checkComplete(event: CallEvent) {
  if (event.type === 'end' || event.type === 'fail') {
    callStates.delete(event.callId);
  }
}

export function abandonCall(callId: string) {
  callStates.delete(callId);
}
