/**
 * @fileoverview wsgrpc-generated client stub for ex.ample from example.proto
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!

/* eslint-disable */
/* @ts-nocheck */

import * as grpcWeb from "grpc-web";
import {WriteField as W, KeyConverters as KC, Helpers as H, Reader, FieldTypes as F} from "protobuf-codec-ts"
import * as importableImportMeProto from "./importable/importMe.manual";
import * as Surrogates from "./surrogates";

export namespace EnumType {
    type ProtoName = "ex.ample.EnumType"

    export type None = typeof None | "None" | 0
    export type One = typeof One | "One" | 1
    export type Two = typeof Two | "Two" | 2

    export const None = H.enumValue<ProtoName>(0, "None");
    export const One = H.enumValue<ProtoName>(1, "One");
    export const Two = H.enumValue<ProtoName>(2, "Two");

    const map = new Map<string|number, H.EnumValue<ProtoName>>([
        ["none", None],
        [0, None],
        ["one", One],
        [1, One],
        ["two", Two],
        [2, Two],
    ]);

    type LiteralNumber = 0 | 1 | 2
    type LiteralString = "None" | "One" | "Two"
    export type Literal = LiteralNumber | LiteralString
    export type Value = H.EnumValue<ProtoName> | Literal;

    export const from = H.makeEnumConstructor<ProtoName, LiteralNumber, LiteralString>(map);
    export const toNumber = H.makeToNumber(from);
    export const toString = H.makeToString(from);
    export const write = H.makeEnumWriter(toNumber);
    export const {defVal, read, wireType, readValue} = F.enumeration(() => ({from}));
}
export type EnumType = H.EnumValue<"ex.ample.EnumType">

export namespace Inner {
    type ProtoName = "ex.ample.Inner";

    export type Strict = {
        // sfixed32 int_fixed = 13;
        readonly intFixed: number,
        // sfixed64 long_fixed = 14;
        readonly longFixed: string,
        // sint32 zigzag_int = 15;
        readonly zigzagInt: number,
        // sint64 zigzag_long = 16;
        readonly zigzagLong: string,
        // Outer.Nested nested = 17;
        readonly nested: Outer.Nested.Strict | undefined,
        // Outer.NestEnumeration nestedEnum = 18;
        readonly nestedEnum: Outer.NestEnumeration,
    }

    export type Loose = {
        // sfixed32 int_fixed = 13;
        readonly intFixed?: number,
        // sfixed64 long_fixed = 14;
        readonly longFixed?: (string | number),
        // sint32 zigzag_int = 15;
        readonly zigzagInt?: number,
        // sint64 zigzag_long = 16;
        readonly zigzagLong?: (string | number),
        // Outer.Nested nested = 17;
        readonly nested?: Outer.Nested.Value,
        // Outer.NestEnumeration nestedEnum = 18;
        readonly nestedEnum?: Outer.NestEnumeration.Value,
    }

    export type Value = Strict | Loose;

    /**
     * Write all non-default fields
     * @param {NestedWritable} writable - Target writable
     * @param {Value} value - instance of message
     */
    export const writeContents: H.WriteMessage<Value> = (w, msg) => {
        W.sfixed32(w, msg.intFixed, 13);
        W.sfixed64decimal(w, msg.longFixed, 14);
        W.sint32(w, msg.zigzagInt, 15);
        W.sint64decimal(w, msg.zigzagLong, 16);
        Outer.Nested.write(w, msg.nested, 17);
        Outer.NestEnumeration.write(w, msg.nestedEnum, 18);
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
        [13, "intFixed", F.sfixed32],
        [14, "longFixed", F.sfixed64decimal],
        [15, "zigzagInt", F.sint32],
        [16, "zigzagLong", F.sint64decimal],
        [17, "nested", () => Outer.Nested],
        [18, "nestedEnum", () => Outer.NestEnumeration],
    ]

    export const readMessageValue = F.makeMessageValueReader<Strict>(fields);

    export const {readValue, defVal, read, wireType} = F.message(() => ({readMessageValue}));

    export const decode = (bytes: Uint8Array) => readValue(Reader.fromBytes(bytes));

    export const toStrict: (value: Value) => Strict = undefined as any;
}

export namespace Outer {
    type ProtoName = "ex.ample.Outer";

    type UnionStrict = { unionCase: "" }
        // Inner inner_option = 25;
        | { unionCase: "innerOption", innerOption: Inner.Strict | undefined }
        // string string_option = 26;
        | { unionCase: "stringOption", stringOption: string }
        // importable.Args imported_option = 30;
        | { unionCase: "importedOption", importedOption: ReturnType<typeof Surrogates.Args.readValue> }

    export type Strict = {
        // double double_val = 1;
        readonly doubleVal: number,
        // float float_val = 2;
        readonly floatVal: number,
        // int64 long_val = 3;
        readonly longVal: string,
        // uint64 ulong_val = 4;
        readonly ulongVal: string,
        // int32 int_val = 5;
        readonly intVal: number,
        // fixed64 ulong_fixed = 6;
        readonly ulongFixed: string,
        // fixed32 uint_fixed = 7;
        readonly uintFixed: number,
        // bool bool_val = 8;
        readonly boolVal: boolean,
        // string string_val = 9;
        readonly stringVal: string,
        // bytes bytes_val = 10;
        readonly bytesVal: ArrayBuffer,
        // uint32 uint_val = 11;
        readonly uintVal: number,
        // EnumType enum_val = 12;
        readonly enumVal: EnumType,
        // Inner inner = 17;
        readonly inner: Inner.Strict | undefined,
        // repeated double doubles = 18;
        readonly doubles: number[],
        // repeated Inner inners = 19;
        readonly inners: Inner.Strict[],
        // map<string, string> map = 20;
        readonly map: { [key: string]: string },
        // map<string, Inner> map_inner = 21;
        readonly mapInner: { [key: string]: Inner.Strict },
        // map<int64, int32> map_ints = 22;
        readonly mapInts: { [key: string]: number },
        // map<bool, string> map_bool = 23;
        readonly mapBool: { [key in "true" | "false"]?: string },
        // Outer recursive = 24;
        readonly recursive: Outer.Strict | undefined,
        // Nested nested = 27;
        readonly nested: Nested.Strict | undefined,
        // importable.Imported imported = 28;
        readonly imported: importableImportMeProto.Imported.Strict | undefined,
        // importable.Imported.EnumForImport enum_imported = 29;
        readonly enumImported: importableImportMeProto.Imported.EnumForImport,
        // fixed64 ulong_fixed_hex = 31;
        readonly ulongFixedHex: string,
    } & UnionStrict

    type UnionLoose = {}
        // Inner inner_option = 25;
        | { innerOption: Inner.Value | undefined }
        // string string_option = 26;
        | { stringOption: string | undefined }
        // importable.Args imported_option = 30;
        | { importedOption: Parameters<typeof Surrogates.Args.writeValue>[1] | undefined }

    export type Loose = {
        // double double_val = 1;
        readonly doubleVal?: number,
        // float float_val = 2;
        readonly floatVal?: number,
        // int64 long_val = 3;
        readonly longVal?: (string | number),
        // uint64 ulong_val = 4;
        readonly ulongVal?: (string | number),
        // int32 int_val = 5;
        readonly intVal?: number,
        // fixed64 ulong_fixed = 6;
        readonly ulongFixed?: (string | number),
        // fixed32 uint_fixed = 7;
        readonly uintFixed?: number,
        // bool bool_val = 8;
        readonly boolVal?: boolean,
        // string string_val = 9;
        readonly stringVal?: string,
        // bytes bytes_val = 10;
        readonly bytesVal?: ArrayBuffer,
        // uint32 uint_val = 11;
        readonly uintVal?: number,
        // EnumType enum_val = 12;
        readonly enumVal?: EnumType.Value,
        // Inner inner = 17;
        readonly inner?: Inner.Value,
        // repeated double doubles = 18;
        readonly doubles?: number[],
        // repeated Inner inners = 19;
        readonly inners?: Inner.Value[],
        // map<string, string> map = 20;
        readonly map?: Map<string, string> | { [key: string]: string },
        // map<string, Inner> map_inner = 21;
        readonly mapInner?: Map<string, Inner.Value> | { [key: string]: Inner.Value },
        // map<int64, int32> map_ints = 22;
        readonly mapInts?: Map<(string | number), number> | { [key: string]: number },
        // map<bool, string> map_bool = 23;
        readonly mapBool?: Map<boolean, string> | { [key in "true" | "false"]?: string },
        // Outer recursive = 24;
        readonly recursive?: Outer.Value,
        // Nested nested = 27;
        readonly nested?: Nested.Value,
        // importable.Imported imported = 28;
        readonly imported?: importableImportMeProto.Imported.Value,
        // importable.Imported.EnumForImport enum_imported = 29;
        readonly enumImported?: importableImportMeProto.Imported.EnumForImport.Value,
        // fixed64 ulong_fixed_hex = 31;
        readonly ulongFixedHex?: (string | number),
    } & UnionLoose

    export type Value = Strict | Loose;

    /**
     * Write all non-default fields
     * @param {NestedWritable} writable - Target writable
     * @param {Value} value - instance of message
     */
    export const writeContents: H.WriteMessage<Value> = (w, msg) => {
        W.double(w, msg.doubleVal, 1);
        W.float(w, msg.floatVal, 2);
        W.int64decimal(w, msg.longVal, 3);
        W.uint64decimal(w, msg.ulongVal, 4);
        W.int32(w, msg.intVal, 5);
        W.fixed64decimal(w, msg.ulongFixed, 6);
        W.fixed32(w, msg.uintFixed, 7);
        W.bool(w, msg.boolVal, 8);
        W.string(w, msg.stringVal, 9);
        W.bytes(w, msg.bytesVal, 10);
        W.uint32(w, msg.uintVal, 11);
        EnumType.write(w, msg.enumVal, 12);
        Inner.write(w, msg.inner, 17);
        W.packed(w, W.double, msg.doubles, 18);
        W.repeated(w, Inner.write, msg.inners, 19);
        W.map(w, W.string, KC.string, W.string, msg.map, 20);
        W.map(w, W.string, KC.string, Inner.write, msg.mapInner, 21);
        W.map(w, W.int64decimal, KC.int64decimal, W.int32, msg.mapInts, 22);
        W.map(w, W.bool, KC.bool, W.string, msg.mapBool, 23);
        Outer.write(w, msg.recursive, 24);
        Nested.write(w, msg.nested, 27);
        importableImportMeProto.Imported.write(w, msg.imported, 28);
        importableImportMeProto.Imported.EnumForImport.write(w, msg.enumImported, 29);
        W.fixed64hexpad(w, msg.ulongFixedHex, 31);
        if ("innerOption" in msg) { Inner.write(w, msg.innerOption, 25); }
        else if ("stringOption" in msg) { W.string(w, msg.stringOption, 26); }
        else if ("importedOption" in msg) { Surrogates.Args.write(w, msg.importedOption, 30); }
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
        [1, "doubleVal", F.double],
        [2, "floatVal", F.float],
        [3, "longVal", F.int64decimal],
        [4, "ulongVal", F.uint64decimal],
        [5, "intVal", F.int32],
        [6, "ulongFixed", F.fixed64decimal],
        [7, "uintFixed", F.fixed32],
        [8, "boolVal", F.bool],
        [9, "stringVal", F.string],
        [10, "bytesVal", F.bytes],
        [11, "uintVal", F.uint32],
        [12, "enumVal", () => EnumType],
        [17, "inner", () => Inner],
        [18, "doubles", F.repeated(F.double)],
        [19, "inners", F.repeated(() => Inner)],
        [20, "map", F.map(F.string, F.string)],
        [21, "mapInner", F.map(F.string, () => Inner)],
        [22, "mapInts", F.map(F.int64decimal, F.int32)],
        [23, "mapBool", F.map(F.bool, F.string)],
        [24, "recursive", () => Outer],
        [25, "innerOption", F.oneof("union", () => Inner)],
        [26, "stringOption", F.oneof("union", F.string)],
        [30, "importedOption", F.oneof("union", () => Surrogates.Args)],
        [27, "nested", () => Nested],
        [28, "imported", () => importableImportMeProto.Imported],
        [29, "enumImported", () => importableImportMeProto.Imported.EnumForImport],
        [31, "ulongFixedHex", F.fixed64hexpad],
    ]

    export const readMessageValue = F.makeMessageValueReader<Strict>(fields);

    export const {readValue, defVal, read, wireType} = F.message(() => ({readMessageValue}));

    export const decode = (bytes: Uint8Array) => readValue(Reader.fromBytes(bytes));

    export const toStrict: (value: Value) => Strict = undefined as any;

    export namespace NestEnumeration {
        type ProtoName = "ex.ample.Outer.NestEnumeration"

        export type Black = typeof Black | "Black" | 0
        export type Red = typeof Red | "Red" | 1
        export type Blue = typeof Blue | "Blue" | 2

        export const Black = H.enumValue<ProtoName>(0, "Black");
        export const Red = H.enumValue<ProtoName>(1, "Red");
        export const Blue = H.enumValue<ProtoName>(2, "Blue");

        const map = new Map<string|number, H.EnumValue<ProtoName>>([
            ["black", Black],
            [0, Black],
            ["red", Red],
            [1, Red],
            ["blue", Blue],
            [2, Blue],
        ]);

        type LiteralNumber = 0 | 1 | 2
        type LiteralString = "Black" | "Red" | "Blue"
        export type Literal = LiteralNumber | LiteralString
        export type Value = H.EnumValue<ProtoName> | Literal;

        export const from = H.makeEnumConstructor<ProtoName, LiteralNumber, LiteralString>(map);
        export const toNumber = H.makeToNumber(from);
        export const toString = H.makeToString(from);
        export const write = H.makeEnumWriter(toNumber);
        export const {defVal, read, wireType, readValue} = F.enumeration(() => ({from}));
    }
    export type NestEnumeration = H.EnumValue<"ex.ample.Outer.NestEnumeration">

    export namespace Nested {
        type ProtoName = "ex.ample.Outer.Nested";

        export type Strict = {
            // repeated NestEnumeration enums = 1;
            readonly enums: NestEnumeration[],
            // Inner inner = 2;
            readonly inner: Inner.Strict | undefined,
        }

        export type Loose = {
            // repeated NestEnumeration enums = 1;
            readonly enums?: NestEnumeration.Value[],
            // Inner inner = 2;
            readonly inner?: Inner.Value,
        }

        export type Value = Strict | Loose;

        /**
         * Write all non-default fields
         * @param {NestedWritable} writable - Target writable
         * @param {Value} value - instance of message
         */
        export const writeContents: H.WriteMessage<Value> = (w, msg) => {
            W.packed(w, NestEnumeration.write, msg.enums, 1);
            Inner.write(w, msg.inner, 2);
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
            [1, "enums", F.repeated(() => NestEnumeration)],
            [2, "inner", () => Inner],
        ]

        export const readMessageValue = F.makeMessageValueReader<Strict>(fields);

        export const {readValue, defVal, read, wireType} = F.message(() => ({readMessageValue}));

        export const decode = (bytes: Uint8Array) => readValue(Reader.fromBytes(bytes));

        export const toStrict: (value: Value) => Strict = undefined as any;
    }
}

export class ServiceOneClient {
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

    methodInfoExampleUnaryRpc = new grpcWeb.AbstractClientBase.MethodInfo<Inner.Value, importableImportMeProto.Imported.Strict>(
        H.noconstructor,
        Inner.encode,
        importableImportMeProto.Imported.decode
    );

    exampleUnaryRpc(request: Inner.Value, metadata: grpcWeb.Metadata | null): Promise<importableImportMeProto.Imported.Strict>;
    exampleUnaryRpc(request: Inner.Value, metadata: grpcWeb.Metadata | null, callback: (err: grpcWeb.Error, response: importableImportMeProto.Imported.Strict) => void): grpcWeb.ClientReadableStream<importableImportMeProto.Imported.Strict>;
    exampleUnaryRpc(request: Inner.Value, metadata: grpcWeb.Metadata | null, callback?: (err: grpcWeb.Error, response: importableImportMeProto.Imported.Strict) => void) {
        if (callback !== undefined) {
            return this.client_.rpcCall(
                this.hostname_ + '/ex.ample.ServiceOne/ExampleUnaryRpc',
                request,
                metadata || {},
                this.methodInfoExampleUnaryRpc,
                callback
            );
        }
        return this.client_.unaryCall(
            this.hostname_ + '/ex.ample.ServiceOne/ExampleUnaryRpc',
            request,
            metadata || {},
            this.methodInfoExampleUnaryRpc
        );
    }

    methodInfoExampleServerStreamingRpc = new grpcWeb.AbstractClientBase.MethodInfo(
        H.noconstructor,
        Outer.Nested.encode,
        importableImportMeProto.Imported.decode
    );

    exampleServerStreamingRpc(request: Outer.Nested.Value, metadata?: grpcWeb.Metadata) {
        return this.client_.serverStreaming(
            this.hostname_ + '/ex.ample.ServiceOne/ExampleServerStreamingRpc',
            request,
            metadata || {},
            this.methodInfoExampleServerStreamingRpc
        );
    }
}

