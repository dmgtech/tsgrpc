import { UnaryRequestArgs } from "@dmgtech/tsgrpc"
import GrpcWeb from "../src/tsgrpc-driver-web";
import Url from 'url-parse';

jest.mock('grpc-web', () => {
    abstract class AbstractClientBase {
        static MethodInfo = class MethodInfo<TReq, TResp> {
            c: any;
            enc: any;
            dec: any
            constructor(c: any, enc: any, dec: any) {
                this.c = c;
                this.enc = enc;
                this.dec = dec;
            }
        }
    }
    class GrpcWebClientBase extends AbstractClientBase {
        options;
        constructor(options: {[index: string]: string}) {
            super();
            this.options = options;
        }
        rpcCall(method: any, request: any, metadata: any, methodDef: any, callback: any) {
            const url = new Url(method);
            switch (url.pathname) {
                case '/myns.MyService/Mangle': {
                    const str = decode(request);
                    const mangled = str.replace(/ain/g, "ace");
                    return callback(null, encode(mangled));
                }
                case '/myns.MyService/EchoAddr': {
                    return callback(null, encode(url.href));
                }
                default: {
                    return callback(new Error(`UNIMPLEMENTED: (${method})`));
                }
            }
        }
    }
    return {
        GrpcWebClientBase,
        AbstractClientBase,
    };
})

const encode = (v: string) => new TextEncoder().encode(v);
const decode = (b: Uint8Array) => new TextDecoder().decode(b);

describe("unaryCall", () => {
    it('calling it works', async () => {
        const message = encode("The rain in spain");
        const method = "myns.MyService/Mangle";
        const response = await GrpcWeb.unaryCall({method, message});
        const str = decode(response.message);
        expect(str).toBe("The race in space");
    })

    it('defaults', async () => {
        const message = new TextEncoder().encode("Hi");
        const method = "myns.MyService/EchoAddr";
        const response = await GrpcWeb.unaryCall({method, message});
        const str = new TextDecoder().decode(response.message);
        expect(str).toBe("/myns.MyService/EchoAddr");
    })
});

describe("configure", () => {
    it('sets defaults', async () => {
        const configured = GrpcWeb.configure({host: 'foo.com', port: 12345, secure: false});
        const message = new TextEncoder().encode("Hi");
        const method = "myns.MyService/EchoAddr";
        const response = await configured.unaryCall({method, message});
        const str = new TextDecoder().decode(response.message);
        expect(str).toBe("http://foo.com:12345/myns.MyService/EchoAddr");
    })

    it('sets default secure', async () => {
        const configured = GrpcWeb.configure({host: 'foo.com', secure: true});
        const message = new TextEncoder().encode("Hi");
        const method = "myns.MyService/EchoAddr";
        const response = await configured.unaryCall({method, message});
        const str = new TextDecoder().decode(response.message);
        expect(str).toBe("https://foo.com/myns.MyService/EchoAddr");
    })
})
