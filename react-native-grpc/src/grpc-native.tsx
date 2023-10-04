type CreateCall = {
  host: string;
  port: number;
  method: string; // the full method, e.g. my.package.Service/MethodName
  messageBase64?: string; // client streaming is inferred to be off if specified and on otherwise
  serverStream: boolean;
  secure?: boolean;
};

type Send = {
  callId: string;
  messageBase64: string;
};

export type GrpcType = ReactNative.EventSubscriptionVendor & {
  // trigger an event for checking round trip communication with native side
  ping(number: number): Promise<string>;
  // check that the backend is there
  check(): Promise<string>;
  // Starts a new call and returns the call id
  createCall(args: CreateCall): Promise<string>;
  send(args: Send): Promise<boolean>;
};

import * as ReactNative from 'react-native';
// This seems to be necessary to avoid some kind of freeze (probably a deadlock)
// whenever importing this file from a react-native application module.
// As long as access to ReactNative.NativeModules is deferred, this works
// but this probably means that accessing any of the exported functions inside the main module area will continue to deadlock
// and there doesn't seem to be anything that can be done about it
export const Grpc = new Proxy(
  {},
  {
    get(_target, name, _receiver) {
      if (name === '$$typeof' || name === 'prototype') return undefined;
      if (name === 'actual') return ReactNative.NativeModules.Grpc;
      const rval = Reflect.get(
        ReactNative.NativeModules.Grpc,
        name,
        ReactNative.NativeModules.Grpc
      );
      return rval;
    },
  }
) as GrpcType;
