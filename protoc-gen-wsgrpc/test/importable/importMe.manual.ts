/**
 * @fileoverview wsgrpc-generated client stub for ex.ample.importable from importable/importMe.proto
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!

/* eslint-disable */

import * as grpcWeb from "grpc-web";
import {WriteField as W, KeyConverters as KC, Helpers as H, Reader, FieldTypes as F} from "protobuf-codec-ts"

export namespace Imported {
    type ProtoName = "ex.ample.importable.Imported";

    export type Strict = {
        // string value = 1;
        readonly value: string,
    }

    export type Loose = {
        // string value = 1;
        readonly value?: string,
    }

    export type Value = Strict | Loose;

    /**
     * Write all non-default fields
     * @param {NestedWritable} writable - Target writable
     * @param {Value} value - instance of message
     */
    export const writeContents: H.WriteMessage<Value> = (w, msg) => {
        W.string(w, msg.value, 1);
    }

    /**
     * Write all non-default fields into a length-prefixed block
     * @param {NestedWritable} writable - Target writable
     * @param {Value} value - instance of message
     */
    export const writeValue = H.makeDelimitedWriter(writeContents);

    /**
     * Write all non-default fields into a length-prefixed block with a tag
     * @param {NestedWritable} writable - Target writable
     * @param {Value} value - instance of message
     * @param {number} field - number of field
     * @returns {boolean} - true if it wrote anything
     */
    export const write = H.makeFieldWriter(writeValue);

    /**
     * Convert a message instance to its encoded form
     * @param {Value} value - instance of message
     * @returns {Uint8Array} - the encoded form of the message
     */
    export const encode = H.makeEncoder<Loose | Strict>(writeContents);

    export const fields: F.MessageFieldDef[] = [
        [1, "value", F.string],
    ]

    export const readValue = F.makeMessageValueReader<Strict>(fields);

    export const decode = (bytes: Uint8Array) => readValue(Reader.fromBytes(bytes));

    export const empty: () => Strict = H.once(() => readValue(H.empty()));
}

export namespace Args {
    type ProtoName = "ex.ample.importable.Args";

    export type Strict = {
        // string value = 1;
        readonly value: string,
    }

    export type Loose = {
        // string value = 1;
        readonly value?: string,
    }

    export type Value = Strict | Loose;

    /**
     * Write all non-default fields
     * @param {NestedWritable} writable - Target writable
     * @param {Value} value - instance of message
     */
    export const writeContents: H.WriteMessage<Value> = (w, msg) => {
        W.string(w, msg.value, 1);
    }

    /**
     * Write all non-default fields into a length-prefixed block
     * @param {NestedWritable} writable - Target writable
     * @param {Value} value - instance of message
     */
    export const writeValue = H.makeDelimitedWriter(writeContents);

    /**
     * Write all non-default fields into a length-prefixed block with a tag
     * @param {NestedWritable} writable - Target writable
     * @param {Value} value - instance of message
     * @param {number} field - number of field
     * @returns {boolean} - true if it wrote anything
     */
    export const write = H.makeFieldWriter(writeValue);

    /**
     * Convert a message instance to its encoded form
     * @param {Value} value - instance of message
     * @returns {Uint8Array} - the encoded form of the message
     */
    export const encode = H.makeEncoder<Loose | Strict>(writeContents);

    export const fields: F.MessageFieldDef[] = [
        [1, "value", F.string],
    ]

    export const readValue = F.makeMessageValueReader<Strict>(fields);

    export const decode = (bytes: Uint8Array) => readValue(Reader.fromBytes(bytes));

    export const empty = H.once(() => readValue(H.empty()));
}

export class ServiceTwoClient {
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

    methodInfoExampleClientStreamingRpc = new grpcWeb.AbstractClientBase.MethodInfo(
        () => Args.empty(),
        (request: Args.Value) => {
            return Args.encode(request);
        },
        Args.decode
    );

    exampleClientStreamingRpc(request: Args.Value, metadata: grpcWeb.Metadata | null): Promise<Args.Strict>;
    exampleClientStreamingRpc(request: Args.Value, metadata: grpcWeb.Metadata | null, callback: (err: grpcWeb.Error, response: Args.Strict) => void): grpcWeb.ClientReadableStream<Args.Strict>;
    exampleClientStreamingRpc(request: Args.Value, metadata: grpcWeb.Metadata | null, callback?: (err: grpcWeb.Error, response: Args.Strict) => void) {
        if (callback !== undefined) {
            return this.client_.rpcCall(
                this.hostname_ + '/ex.ample.importable.ServiceTwo/ExampleClientStreamingRpc',
                request,
                metadata || {},
                this.methodInfoExampleClientStreamingRpc,
                callback
            );
        }
        return this.client_.unaryCall(
            this.hostname_ + '/ex.ample.importable.ServiceTwo/ExampleClientStreamingRpc',
            request,
            metadata || {},
            this.methodInfoExampleClientStreamingRpc
        );
    }
}

