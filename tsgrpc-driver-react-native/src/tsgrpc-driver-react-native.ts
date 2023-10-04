import * as RnGrpc from '@dmgtech/react-native-grpc';
import type {
  ChannelArgs,
  GrpcDriver,
  UnaryRequestArgs,
  Response,
} from '@dmgtech/tsgrpc';
import { Base64 } from 'js-base64';

type ConfigurableDriver = {
  configure(defaults: Partial<ChannelArgs>): GrpcDriver;
};

const GrpcReactNative: GrpcDriver & ConfigurableDriver = {
  configure(defaults) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { configure, ...base } = GrpcReactNative;
    function addDefaults<T extends ChannelArgs>(args: T): T {
      return {
        ...defaults,
        ...args,
      };
    }
    return {
      unaryCall(args) {
        return base.unaryCall(addDefaults(args));
      },
      serverStreamingCall(args) {
        return base.serverStreamingCall(addDefaults(args));
      },
    };
  },
  async unaryCall(args: UnaryRequestArgs & ChannelArgs): Promise<Response> {
    const { message, ...rest } = args;
    const messageBase64 = Base64.fromUint8Array(message);
    const host = args.host || '127.0.0.1';
    const secure = args.secure === undefined ? true : args.secure;
    const port = args.port || (secure === false ? 80 : 443);
    const result = await RnGrpc.unaryCall({
      ...rest,
      host,
      port,
      secure,
      messageBase64,
    });
    return { message: Base64.toUint8Array(result) };
  },
  serverStreamingCall(
    args: UnaryRequestArgs & ChannelArgs
  ): { cancel: () => void; response: AsyncIterable<Response> } {
    console.log(args);
    /*
    const client = getChannel(args);
    const grpcWebStream = client.serverStreamingCall(
      args.method,
      genericMethod as any,
      args.message,
      null
    );
    const stream = callStream(grpcWebStream);
    return {
      cancel: () => grpcWebStream.cancel(),
      response: (async function* (
        stream: AsyncGenerator<CallEvent<Uint8Array>, any, unknown>
      ) {
        for await (const event of stream) {
          if (event.event === 'data') {
            yield { message: event.data };
          } else if (event.event === 'error') {
            throw new Error(event.error.message);
          }
        }
      })(stream),
    };
    */
    return {
      cancel: () => {},
      response: (async function* () {})(),
    };
  },
};

export default GrpcReactNative;
