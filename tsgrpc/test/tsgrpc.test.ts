import { create, unaryCall } from "../src/tsgrpc";
import { ChannelArgs, GrpcDriver, UnaryRequestArgs, Response, GrpcLongCall } from "../src/tsgrpc-types";
import { GrpcUnaryMethod, GrpcService } from "../../tsgrpc-protobuf-codec/src/services";

const mockdriver: GrpcDriver = {
    unaryCall(args) {
        return new Promise<Response>((resolve, reject) => {
            const request = args.message
            resolve({message: request});
        })
    },
    serverStreamingCall(args): GrpcLongCall {
        return {
            cancel: () => {},
            response: (async function*() {

            })()
        }
    },
}

const mockservice: GrpcService = {
    name: "mock.service",
}

const mockmethod: GrpcUnaryMethod<string, string> = {
    service: mockservice,
    name: "MockMethod",
    encode: (v) => new TextEncoder().encode(v),
    decode: (b) => new TextDecoder().decode(b),
    reducer: undefined,
    clientStreaming: false,
}

async function delay(ms: number) {
    return new Promise<void>(resolve => {
        setTimeout(() => {resolve()}, ms);
    })
}

describe("unaryCall", () => {
    it('fails when no driver selected', async () => {
        await expect(unaryCall(mockmethod, "Angus Macgyver")).rejects.toThrow(/select grpc driver/)
        const grpc = create();
        await expect(grpc.unaryCall(mockmethod, "Angus Macgyver")).rejects.toThrow(/select grpc driver/)
    })

    it('succeeds when driver is present', async () => {
        const grpc = create();
        grpc.use(mockdriver);
        const result = await grpc.unaryCall(mockmethod, "Angus Macgyver");
        expect(result).toBe("Angus Macgyver");
    })
});
