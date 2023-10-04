import type { Services } from '@dmgtech/tsgrpc-protobuf-codec';
import type { ChannelArgs, GrpcDriver, UnaryRequestArgs, Response } from './tsgrpc-types';

export { Services, ChannelArgs, GrpcDriver, UnaryRequestArgs, Response }

const throwNoDriver = (() => {
  throw new Error('must select grpc driver');
}) as any;

const defaultContext = create();

export const use = defaultContext.use.bind(defaultContext);
export const unaryCall = defaultContext.unaryCall.bind(defaultContext);


type GrpcContext = {
  use(d: GrpcDriver): void;
  unaryCall<TRequest, TResponse>(
    method: Services.GrpcUnaryMethod<TRequest, TResponse>,
    args: TRequest
  ): Promise<TResponse>;
}

export function create(): GrpcContext {
  let driver: GrpcDriver = {
    unaryCall: throwNoDriver,
    serverStreamingCall: throwNoDriver,
  };
          
  return {
    use(d: GrpcDriver) {
      driver = d;
    },
    
    async unaryCall<TRequest, TResponse>(
      method: Services.GrpcUnaryMethod<TRequest, TResponse>,
      args: TRequest
    ): Promise<TResponse> {
      const callArgs = {
        method: `${method.service.name}/${method.name}`,
        message: method.encode(args),
      };
      const result = await driver.unaryCall(callArgs);
      const decoded = method.decode(result.message);
      return decoded;
    },
    
  }
}