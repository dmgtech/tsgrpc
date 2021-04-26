import type { Services } from '@dmgtech/tsgrpc-protobuf-codec';
import type { ChannelArgs, GrpcDriver, UnaryRequestArgs, Response } from './tsgrpc-types';

export { Services, ChannelArgs, GrpcDriver, UnaryRequestArgs, Response }

const throwNoDriver = (() => {
  throw new Error('must select grpc driver');
}) as any;

export let Grpc: GrpcDriver = {
  unaryCall: throwNoDriver,
  serverStreamingCall: throwNoDriver,
};

export function use(d: GrpcDriver) {
  Grpc = d;
}

export async function unaryCall<TRequest, TResponse>(
  method: Services.GrpcUnaryMethod<TRequest, TResponse>,
  args: TRequest
): Promise<TResponse> {
  const callArgs = {
    method: `${method.service.name}/${method.name}`,
    message: method.encode(args),
  };
  const result = await Grpc.unaryCall(callArgs);
  const decoded = method.decode(result.message);
  return decoded;
}
