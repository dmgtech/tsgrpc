/* istanbul ignore file */
/**
 * @fileoverview tsgrpc-generated client stub for ex.ample from example.proto
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!

/* eslint-disable */
/* @ts-nocheck */

import * as grpcWeb from "grpc-web";
import {Enums as E, Messages as M, WriteField as W, KeyConverters as KC, Helpers as H, Reader, FieldTypes as F, Reducers, Types as T} from "protobuf-codec-ts";
import * as importableImportMeProto from "./importable/importMe.manual";
import * as Surrogates from "./surrogates";

export namespace EnumType {
    export type ProtoName = "ex.ample.EnumType"
    export type Def = {
        "None": 0,
        "One": 1,
        "Two": 2,
    }

    export type None = E.Value<ProtoName, Def, "None">
    export type One = E.Value<ProtoName, Def, "One">
    export type Two = E.Value<ProtoName, Def, "Two">

    export type Strict = E.EnumValue<ProtoName, E.Literal<Def>>;
    export type Value = Strict | E.Literal<Def>;
}
export type EnumType = EnumType.Strict;

export namespace Inner {
    export type ProtoName = "ex.ample.Inner";

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
}

export namespace Outer {
    export type ProtoName = "ex.ample.Outer";

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
        // importable.Args surrogate = 32;
        readonly surrogate: ReturnType<typeof Surrogates.Args.readValue>,
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
        // importable.Args surrogate = 32;
        readonly surrogate?: Parameters<typeof Surrogates.Args.writeValue>[1],
    } & UnionLoose

    export type Value = Strict | Loose;

    export namespace NestEnumeration {
        export type ProtoName = "ex.ample.Outer.NestEnumeration"
        export type Def = {
            "Black": 0,
            "Red": 1,
            "Blue": 2,
        }

        export type Black = E.Value<ProtoName, Def, "Black">
        export type Red = E.Value<ProtoName, Def, "Red">
        export type Blue = E.Value<ProtoName, Def, "Blue">

        export type Strict = E.EnumValue<ProtoName, E.Literal<Def>>;
        export type Value = Strict | E.Literal<Def>;
    }
    export type NestEnumeration = NestEnumeration.Strict;

    export namespace Nested {
        export type ProtoName = "ex.ample.Outer.Nested";

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

        export namespace DoubleNested {
            export type ProtoName = "ex.ample.Outer.Nested.DoubleNested";

            export type Strict = {
            }

            export type Loose = {
            }

            export type Value = Strict | Loose;
        }
    }
}

export namespace ResultEvent {
    export type ProtoName = "ex.ample.ResultEvent";

    export type Strict = {
        // EnumType subscription_state = 1;
        readonly subscriptionState: EnumType,
        // repeated Record records = 2;
        readonly records: Record.Strict[],
    }

    export type Loose = {
        // EnumType subscription_state = 1;
        readonly subscriptionState?: EnumType.Value,
        // repeated Record records = 2;
        readonly records?: Record.Value[],
    }

    export type Value = Strict | Loose;

    export namespace Record {
        export type ProtoName = "ex.ample.ResultEvent.Record";

        export type Strict = {
            // string key = 1;
            readonly key: string,
            // string value = 2;
            readonly value: string,
        }

        export type Loose = {
            // string key = 1;
            readonly key?: string,
            // string value = 2;
            readonly value?: string,
        }

        export type Value = Strict | Loose;
    }
}

export const EnumType = {
} as unknown as
    E.EnumDef<EnumType.ProtoName, EnumType.Def>

export const Inner = {
} as unknown as
    M.MessageDef<Inner.Strict, Inner.Value>

export const Outer = {
    NestEnumeration: {},
    Nested: {
        DoubleNested: {},
    },
} as unknown as
    M.MessageDef<Outer.Strict, Outer.Value> & {
        NestEnumeration: E.EnumDef<Outer.NestEnumeration.ProtoName, Outer.NestEnumeration.Def>,
        Nested: M.MessageDef<Outer.Nested.Strict, Outer.Nested.Value> & {
            DoubleNested: M.MessageDef<Outer.Nested.DoubleNested.Strict, Outer.Nested.DoubleNested.Value>,
        },
    }

export const ResultEvent = {
    Record: {},
} as unknown as
    M.MessageDef<ResultEvent.Strict, ResultEvent.Value> & {
        Record: M.MessageDef<ResultEvent.Record.Strict, ResultEvent.Record.Value>,
    }

E.define(EnumType, {
    "None": 0 as 0,
    "One": 1 as 1,
    "Two": 2 as 2,
});

M.define(Inner, {
    writeContents: (w, msg) => {
        W.sfixed32(w, msg.intFixed, 13);
        W.sfixed64decimal(w, msg.longFixed, 14);
        W.sint32(w, msg.zigzagInt, 15);
        W.sint64decimal(w, msg.zigzagLong, 16);
        Outer.Nested.write(w, msg.nested, 17);
        Outer.NestEnumeration.write(w, msg.nestedEnum, 18);
    },
    fields: [
        [13, "intFixed", F.sfixed32],
        [14, "longFixed", F.sfixed64decimal],
        [15, "zigzagInt", F.sint32],
        [16, "zigzagLong", F.sint64decimal],
        [17, "nested", () => Outer.Nested],
        [18, "nestedEnum", () => Outer.NestEnumeration],
    ],
})

M.define(Outer, {
    writeContents: (w, msg) => {
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
        Outer.Nested.write(w, msg.nested, 27);
        importableImportMeProto.Imported.write(w, msg.imported, 28);
        importableImportMeProto.Imported.EnumForImport.write(w, msg.enumImported, 29);
        W.fixed64hexpad(w, msg.ulongFixedHex, 31);
        Surrogates.Args.write(w, msg.surrogate, 32);
        if ("innerOption" in msg) { Inner.write(w, msg.innerOption, 25); }
        else if ("stringOption" in msg) { W.string(w, msg.stringOption, 26); }
        else if ("importedOption" in msg) { Surrogates.Args.write(w, msg.importedOption, 30); }
    },
    fields: [
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
        [27, "nested", () => Outer.Nested],
        [28, "imported", () => importableImportMeProto.Imported],
        [29, "enumImported", () => importableImportMeProto.Imported.EnumForImport],
        [31, "ulongFixedHex", F.fixed64hexpad],
        [32, "surrogate", () => Surrogates.Args],
    ],
})

E.define(Outer.NestEnumeration, {
    "Black": 0 as 0,
    "Red": 1 as 1,
    "Blue": 2 as 2,
});

M.define(Outer.Nested, {
    writeContents: (w, msg) => {
        W.packed(w, Outer.NestEnumeration.write, msg.enums, 1);
        Inner.write(w, msg.inner, 2);
    },
    fields: [
        [1, "enums", F.repeated(() => Outer.NestEnumeration)],
        [2, "inner", () => Inner],
    ],
})

M.define(Outer.Nested.DoubleNested, {
    writeContents: (w, msg) => {
    },
    fields: [
    ],
})

M.define(ResultEvent, {
    writeContents: (w, msg) => {
        EnumType.write(w, msg.subscriptionState, 1);
        W.repeated(w, ResultEvent.Record.write, msg.records, 2);
    },
    fields: [
        [1, "subscriptionState", () => EnumType],
        [2, "records", F.repeated(() => ResultEvent.Record)],
    ],
})

M.define(ResultEvent.Record, {
    writeContents: (w, msg) => {
        W.string(w, msg.key, 1);
        W.string(w, msg.value, 2);
    },
    fields: [
        [1, "key", F.string],
        [2, "value", F.string],
    ],
})

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
        H.makeEncoder(Inner.writeValue),
        H.makeDecoder(importableImportMeProto.Imported.readValue)
    );

    exampleUnaryRpc(request: Parameters<typeof Inner.writeValue>[1], metadata: grpcWeb.Metadata | null): Promise<importableImportMeProto.Imported.Strict>;
    exampleUnaryRpc(request: Parameters<typeof Inner.writeValue>[1], metadata: grpcWeb.Metadata | null, callback: (err: grpcWeb.Error, response: importableImportMeProto.Imported.Strict) => void): grpcWeb.ClientReadableStream<importableImportMeProto.Imported.Strict>;
    exampleUnaryRpc(request: Parameters<typeof Inner.writeValue>[1], metadata: grpcWeb.Metadata | null, callback?: (err: grpcWeb.Error, response: importableImportMeProto.Imported.Strict) => void) {
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
        H.makeEncoder(Outer.Nested.writeValue),
        H.makeDecoder(importableImportMeProto.Imported.readValue)
    );

    exampleServerStreamingRpc(request: Parameters<typeof Outer.Nested.writeValue>[1], metadata?: grpcWeb.Metadata): grpcWeb.ClientReadableStream<importableImportMeProto.Imported.Strict> {
        return this.client_.serverStreaming(
            this.hostname_ + '/ex.ample.ServiceOne/ExampleServerStreamingRpc',
            request,
            metadata || {},
            this.methodInfoExampleServerStreamingRpc
        );
    }

    methodInfoExampleSubscription = new grpcWeb.AbstractClientBase.MethodInfo(
        H.noconstructor,
        H.makeEncoder(Surrogates.Args.writeValue),
        H.makeDecoder(ResultEvent.readValue)
    );

    exampleSubscription(request: Parameters<typeof Surrogates.Args.writeValue>[1], metadata?: grpcWeb.Metadata): grpcWeb.ClientReadableStream<ResultEvent.Strict> {
        return this.client_.serverStreaming(
            this.hostname_ + '/ex.ample.ServiceOne/ExampleSubscription',
            request,
            metadata || {},
            this.methodInfoExampleSubscription
        );
    }
}

export namespace ServiceOne {
    const client = ServiceOneClient;
    const {prototype} = client;
    export const ExampleUnaryRpc = {type: "unary", client, method: prototype.exampleUnaryRpc};
    export const ExampleServerStreamingRpc = {type: "server-streaming", client, method: prototype.exampleServerStreamingRpc, reducer: () => Reducers.keepAll<importableImportMeProto.Imported.Strict>()};
    export const ExampleSubscription = {type: "server-streaming", client, method: prototype.exampleSubscription, reducer: () => Reducers.keepLastByKey<ResultEvent.Strict>()};
}
