/**
 * @fileoverview wsgrpc-generated client stub for ex.ample.importable from importable/importMe.proto
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!

/* eslint-disable */
/* @ts-nocheck */

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

    export namespace EnumForImport {
        type ProtoName = "ex.ample.importable.Imported.EnumForImport"

        export type No = typeof No | "No" | 0
        export type Yes = typeof Yes | "Yes" | 1

        export const No = H.enumValue<ProtoName>(0, "No");
        export const Yes = H.enumValue<ProtoName>(1, "Yes");

        const map = new Map<string|number, H.EnumValue<ProtoName>>([
            ["no", No],
            [0, No],
            ["yes", Yes],
            [1, Yes],
        ]);

        type LiteralNumber = 0 | 1
        type LiteralString = "No" | "Yes"
        export type Literal = LiteralNumber | LiteralString
        export type Value = H.EnumValue<ProtoName> | Literal;

        export const from = H.makeEnumConstructor<ProtoName, LiteralNumber, LiteralString>(map);
        export const toNumber = H.makeToNumber(from);
        export const toString = H.makeToString(from);
        export const write = H.makeEnumWriter(toNumber);
    }
    export type EnumForImport = H.EnumValue<"ex.ample.importable.Imported.EnumForImport">
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
}

