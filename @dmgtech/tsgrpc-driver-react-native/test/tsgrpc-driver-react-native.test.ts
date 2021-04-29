import { UnaryRequestArgs } from "@dmgtech/tsgrpc"
import Base64 from "js-base64";
import GrpcReactNative from "../src/tsgrpc-driver-react-native";

jest.mock('@dmgtech/react-native-grpc', () => ({
    async unaryCall(args: any): Promise<string> {
        const {method, messageBase64} = args;
        switch (method) {
            case 'Mangle': {
                const message = Base64.toUint8Array(messageBase64);
                const str = new TextDecoder().decode(message);
                const mangled = str.replace(/ain/g, "ace");
                return Base64.fromUint8Array(new TextEncoder().encode(mangled))
            }
            case 'EchoAddr': {
                const {host, port, secure} = args;
                return Base64.fromUint8Array(new TextEncoder().encode(`${host}:${port}:${secure}`));
            }
            default: {
                throw new Error('UNIMPLEMENTED:');
            }
        }
    }
}))

describe("unaryCall", () => {
    it('calling it works', async () => {
        const message = new TextEncoder().encode("The rain in spain");
        const method = "Mangle";
        const response = await GrpcReactNative.unaryCall({method, message});
        const str = new TextDecoder().decode(response.message);
        expect(str).toBe("The race in space");
    })

    it('defaults', async () => {
        const message = new TextEncoder().encode("Hi");
        const method = "EchoAddr";
        const response = await GrpcReactNative.unaryCall({method, message});
        const str = new TextDecoder().decode(response.message);
        expect(str).toBe("127.0.0.1:443:true");
    })
});

describe("configure", () => {
    it('sets defaults', async () => {
        const configured = GrpcReactNative.configure({host: 'foo.com', port: 12345, secure: false});
        const message = new TextEncoder().encode("Hi");
        const method = "EchoAddr";
        const response = await configured.unaryCall({method, message});
        const str = new TextDecoder().decode(response.message);
        expect(str).toBe("foo.com:12345:false");
    })

    it('sets default port to secure', async () => {
        const configured = GrpcReactNative.configure({host: 'foo.com', secure: false});
        const message = new TextEncoder().encode("Hi");
        const method = "EchoAddr";
        const response = await configured.unaryCall({method, message});
        const str = new TextDecoder().decode(response.message);
        expect(str).toBe("foo.com:80:false");
    })
})
