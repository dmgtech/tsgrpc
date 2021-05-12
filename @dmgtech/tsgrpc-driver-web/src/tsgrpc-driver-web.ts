import { GrpcDriver, UnaryRequestArgs, Response, ChannelArgs } from "@dmgtech/tsgrpc";
import {createPubSub} from "@dmgtech/pubsub"
import * as grpcWeb from "grpc-web";
import { RequestArgs } from "@dmgtech/tsgrpc/src/tsgrpc-types";

export class Channel {
    client_: grpcWeb.AbstractClientBase;
    hostname_: string;
    credentials_: null | { [index: string]: string; };
    options_: null | { [index: string]: string; };

    constructor (hostname: string, credentials?: null | { [index: string]: string; }, options?: null | { [index: string]: string; }) {
        if (!options)
            options = {};
        if (!credentials)
            credentials = {};
        options['format'] = 'text';

        this.client_ = new grpcWeb.GrpcWebClientBase(options);
        this.hostname_ = hostname;
        this.credentials_ = credentials;
        this.options_ = options;
    }

    unaryCall(methodName: string, method: grpcWeb.MethodDescriptor<Uint8Array, Uint8Array>, request: Uint8Array, metadata: grpcWeb.Metadata | null): Promise<Uint8Array> {
        return new Promise((resolve, reject) => {
            this.client_.rpcCall(
                `${this.hostname_}/${methodName}`,
                request,
                metadata || {},
                method,
                (err, response) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(response);
                    }
                }
            )
        })
    }

    serverStreamingCall(methodName: string, method: grpcWeb.MethodDescriptor<Uint8Array, Uint8Array>, request: Uint8Array, metadata: grpcWeb.Metadata | null): grpcWeb.ClientReadableStream<Uint8Array> {
        return this.client_.serverStreaming(
            `/${methodName}`,
            request,
            metadata || {},
            method
        );
    }
}

const channels = new Map<string, Channel>();

function getChannel(channelArgs: ChannelArgs) {
    const { host, port, secure } = channelArgs;
    // the following check is due to the fact that there is no way to specify a protocol
    // unless a host is also specified (i.e. there is no url to signify "same host, but make sure it is https")
    if (secure && !host)
        throw new Error("if secure is specified, host must also be specified");
    const protocol = secure === undefined ? "" : secure ? "https:": "http:";
    const endpoint = (port && host) ? `${host}:${port}` : host;
    const uri = endpoint ? /\/\//.test(endpoint) ? endpoint : `${protocol}//${endpoint}` : "";
    const channelKey = `${uri}`;
    const existing = channels.get(channelKey);
    if (!existing) {
        const created = new Channel(uri, null, {withCredentials: "true"})
        channels.set(channelKey, created);
        return created;
    }
    return existing;
}

const noconstructor: new () => any = class { constructor() { throw new Error("Attempt to use 'noconstructor'"); }};

const identity = (x: Uint8Array) => x;

const genericMethod = new grpcWeb.AbstractClientBase.MethodInfo<Uint8Array, Uint8Array>(
    noconstructor,
    identity,
    identity
);

type Configuration = Partial<ChannelArgs> & {basePath?: string}

type ConfigurableDriver<Configuration> = {
    configure(defaults: Configuration): GrpcDriver;
};

const Driver: GrpcDriver & ConfigurableDriver<Configuration> = {
    configure(defaults) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { basePath, ...channelDefaults } = defaults;
        const { configure, ...base } = Driver;
        function addDefaults<T extends (ChannelArgs & RequestArgs)>(args: T): T {
            const method = basePath ? `${basePath}${args.method}` : args.method;
            return {
                ...channelDefaults,
                ...args,
                method,
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
        const client = getChannel(args);
        const result = await client.unaryCall(args.method, genericMethod as any, args.message, null);
        return { message: result };
    },
    serverStreamingCall(args: UnaryRequestArgs & ChannelArgs): {cancel: () => void, response: AsyncIterable<Response>} {
        const client = getChannel(args);
        const grpcWebStream = client.serverStreamingCall(args.method, genericMethod as any, args.message, null);
        const stream = callStream(grpcWebStream);
        return {
            cancel: () => grpcWebStream.cancel(),
            response: (async function*(stream: AsyncGenerator<CallEvent<Uint8Array>, any, unknown>) {
                for await (const event of stream) {
                    if (event.event === "data") {
                        yield {message: event.data};
                    }
                    else if (event.event === "error") {
                        throw new Error(event.error.message);
                    }
                }
            })(stream),
        }
    },
}

export default Driver;



type CallEvent<TResponse>
    = {event: "error", error: grpcWeb.Error}
    | {event: "data", data: TResponse}
    | {event: "status", status: grpcWeb.Status}


function callStream<TResponse>(call: grpcWeb.ClientReadableStream<TResponse>): AsyncGenerator<CallEvent<TResponse>> {
    const {subscribe, publish, end} = createPubSub<CallEvent<TResponse>>();
    call.on("error", (error) => publish({event: "error", error}))
    call.on("data", (data) => publish({event: "data", data}))
    call.on("status", (status) => publish({event: "status", status}))
    call.on("end", () => end());
    return subscribe();
}
