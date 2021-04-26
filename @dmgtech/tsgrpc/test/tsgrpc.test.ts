import { use, unaryCall } from "../src/tsgrpc";
import { ChannelArgs, GrpcDriver, UnaryRequestArgs, Response } from "../src/tsgrpc-types";

const mockDriver: GrpcDriver = {
  async unaryCall(args: UnaryRequestArgs & ChannelArgs): Promise<Response> {
      return {message: new Uint8Array(0)}
  },
  serverStreamingCall(
    args: UnaryRequestArgs & ChannelArgs
  ): { cancel: () => void; response: AsyncIterable<Response> } {
      return {
          cancel() {},
          response: (async function*(): AsyncIterable<Response> {
              
          })()
      }
  },
};

describe("unaryCall", () => {
    it('fails as expected', () => {
        fail("on purpose");
    })
});
