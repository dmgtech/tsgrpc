export type ChannelArgs = {
    readonly host?: string;
    readonly port?: number;
    readonly secure?: boolean;
  };

  export type RequestArgs = {
    readonly method: string;
  }
  
  export type UnaryRequestArgs = RequestArgs & {
    readonly message: Uint8Array;
  };
  
  export type Response = {
    message: Uint8Array;
  };
  
  export type GrpcLongCall = {
    readonly cancel: () => void;
    readonly response: AsyncIterable<Response>;
  };
  
  export type GrpcDriver = {
    readonly unaryCall: (
      args: UnaryRequestArgs & ChannelArgs
    ) => Promise<Response>;
    readonly serverStreamingCall: (
      args: UnaryRequestArgs & ChannelArgs
    ) => GrpcLongCall;
  };
  