/**
 * @fileoverview tsgrpc-generated client stub for ex.ample from example.proto
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!

/* eslint-disable */
// @ts-nocheck

import {Enums as E, Messages as M, Services as S, WriteField as W, KeyConverters as KC, Helpers as H, Reader, FieldTypes as F, Reducers, Types as T} from "@dmgtech/protobuf-codec-ts";
import * as timelib from '@js-joda/core';
import * as importableImportMeProto from "./importable/importMe.proto.gen";
import * as Surrogates from "./surrogates";

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
        // google.protobuf.DoubleValue maybe_double = 33;
        readonly maybeDouble: (number | undefined),
        // google.protobuf.FloatValue maybe_float = 34;
        readonly maybeFloat: (number | undefined),
        // google.protobuf.Int64Value maybe_int64 = 35;
        readonly maybeInt64: (string | undefined),
        // google.protobuf.UInt64Value maybe_uint64 = 36;
        readonly maybeUint64: (string | undefined),
        // google.protobuf.Int32Value maybe_int32 = 37;
        readonly maybeInt32: (number | undefined),
        // google.protobuf.UInt32Value maybe_uint32 = 38;
        readonly maybeUint32: (number | undefined),
        // google.protobuf.BoolValue maybe_bool = 39;
        readonly maybeBool: (boolean | undefined),
        // google.protobuf.StringValue maybe_string = 40;
        readonly maybeString: (string | undefined),
        // google.protobuf.BytesValue maybe_bytes = 41;
        readonly maybeBytes: (ArrayBuffer | undefined),
        // google.protobuf.Timestamp timestamp = 42;
        readonly timestamp: (timelib.Instant | undefined),
        // google.protobuf.Duration duration = 43;
        readonly duration: (timelib.Duration | undefined),
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
        // google.protobuf.DoubleValue maybe_double = 33;
        readonly maybeDouble?: number,
        // google.protobuf.FloatValue maybe_float = 34;
        readonly maybeFloat?: number,
        // google.protobuf.Int64Value maybe_int64 = 35;
        readonly maybeInt64?: (string | number),
        // google.protobuf.UInt64Value maybe_uint64 = 36;
        readonly maybeUint64?: (string | number),
        // google.protobuf.Int32Value maybe_int32 = 37;
        readonly maybeInt32?: number,
        // google.protobuf.UInt32Value maybe_uint32 = 38;
        readonly maybeUint32?: number,
        // google.protobuf.BoolValue maybe_bool = 39;
        readonly maybeBool?: boolean,
        // google.protobuf.StringValue maybe_string = 40;
        readonly maybeString?: string,
        // google.protobuf.BytesValue maybe_bytes = 41;
        readonly maybeBytes?: ArrayBuffer,
        // google.protobuf.Timestamp timestamp = 42;
        readonly timestamp?: timelib.Instant,
        // google.protobuf.Duration duration = 43;
        readonly duration?: timelib.Duration,
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

E.define(EnumType, {
    "None": 0 as 0,
    "One": 1 as 1,
    "Two": 2 as 2,
});

M.define(Inner, {
    writeContents: (w, msg) => {
        if ('intFixed' in msg) { W.sfixed32(w, msg.intFixed, 13); }
        if ('longFixed' in msg) { W.sfixed64decimal(w, msg.longFixed, 14); }
        if ('zigzagInt' in msg) { W.sint32(w, msg.zigzagInt, 15); }
        if ('zigzagLong' in msg) { W.sint64decimal(w, msg.zigzagLong, 16); }
        if ('nested' in msg) { Outer.Nested.write(w, msg.nested, 17); }
        if ('nestedEnum' in msg) { Outer.NestEnumeration.write(w, msg.nestedEnum, 18); }
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
        if ('doubleVal' in msg) { W.double(w, msg.doubleVal, 1); }
        if ('floatVal' in msg) { W.float(w, msg.floatVal, 2); }
        if ('longVal' in msg) { W.int64decimal(w, msg.longVal, 3); }
        if ('ulongVal' in msg) { W.uint64decimal(w, msg.ulongVal, 4); }
        if ('intVal' in msg) { W.int32(w, msg.intVal, 5); }
        if ('ulongFixed' in msg) { W.fixed64decimal(w, msg.ulongFixed, 6); }
        if ('uintFixed' in msg) { W.fixed32(w, msg.uintFixed, 7); }
        if ('boolVal' in msg) { W.bool(w, msg.boolVal, 8); }
        if ('stringVal' in msg) { W.string(w, msg.stringVal, 9); }
        if ('bytesVal' in msg) { W.bytes(w, msg.bytesVal, 10); }
        if ('uintVal' in msg) { W.uint32(w, msg.uintVal, 11); }
        if ('enumVal' in msg) { EnumType.write(w, msg.enumVal, 12); }
        if ('inner' in msg) { Inner.write(w, msg.inner, 17); }
        if ('doubles' in msg) { W.packed(w, W.double, msg.doubles, 18); }
        if ('inners' in msg) { W.repeated(w, Inner.write, msg.inners, 19); }
        if ('map' in msg) { W.map(w, W.string, KC.string, W.string, msg.map, 20); }
        if ('mapInner' in msg) { W.map(w, W.string, KC.string, Inner.write, msg.mapInner, 21); }
        if ('mapInts' in msg) { W.map(w, W.int64decimal, KC.int64decimal, W.int32, msg.mapInts, 22); }
        if ('mapBool' in msg) { W.map(w, W.bool, KC.bool, W.string, msg.mapBool, 23); }
        if ('recursive' in msg) { Outer.write(w, msg.recursive, 24); }
        if ('nested' in msg) { Outer.Nested.write(w, msg.nested, 27); }
        if ('imported' in msg) { importableImportMeProto.Imported.write(w, msg.imported, 28); }
        if ('enumImported' in msg) { importableImportMeProto.Imported.EnumForImport.write(w, msg.enumImported, 29); }
        if ('ulongFixedHex' in msg) { W.fixed64hexpad(w, msg.ulongFixedHex, 31); }
        if ('surrogate' in msg) { Surrogates.Args.write(w, msg.surrogate, 32); }
        if ('maybeDouble' in msg) { W.maybeDouble(w, msg.maybeDouble, 33); }
        if ('maybeFloat' in msg) { W.maybeFloat(w, msg.maybeFloat, 34); }
        if ('maybeInt64' in msg) { W.maybeInt64decimal(w, msg.maybeInt64, 35); }
        if ('maybeUint64' in msg) { W.maybeUint64decimal(w, msg.maybeUint64, 36); }
        if ('maybeInt32' in msg) { W.maybeInt32(w, msg.maybeInt32, 37); }
        if ('maybeUint32' in msg) { W.maybeUint32(w, msg.maybeUint32, 38); }
        if ('maybeBool' in msg) { W.maybeBool(w, msg.maybeBool, 39); }
        if ('maybeString' in msg) { W.maybeString(w, msg.maybeString, 40); }
        if ('maybeBytes' in msg) { W.maybeBytes(w, msg.maybeBytes, 41); }
        if ('timestamp' in msg) { W.timestamp(w, msg.timestamp, 42); }
        if ('duration' in msg) { W.duration(w, msg.duration, 43); }
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
        [33, "maybeDouble", F.maybeDouble],
        [34, "maybeFloat", F.maybeFloat],
        [35, "maybeInt64", F.maybeInt64decimal],
        [36, "maybeUint64", F.maybeUint64decimal],
        [37, "maybeInt32", F.maybeInt32],
        [38, "maybeUint32", F.maybeUint32],
        [39, "maybeBool", F.maybeBool],
        [40, "maybeString", F.maybeString],
        [41, "maybeBytes", F.maybeBytes],
        [42, "timestamp", F.timestamp],
        [43, "duration", F.duration],
    ],
})

E.define(Outer.NestEnumeration, {
    "Black": 0 as 0,
    "Red": 1 as 1,
    "Blue": 2 as 2,
});

M.define(Outer.Nested, {
    writeContents: (w, msg) => {
        if ('enums' in msg) { W.packed(w, Outer.NestEnumeration.write, msg.enums, 1); }
        if ('inner' in msg) { Inner.write(w, msg.inner, 2); }
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
        if ('subscriptionState' in msg) { EnumType.write(w, msg.subscriptionState, 1); }
        if ('records' in msg) { W.repeated(w, ResultEvent.Record.write, msg.records, 2); }
    },
    fields: [
        [1, "subscriptionState", () => EnumType],
        [2, "records", F.repeated(() => ResultEvent.Record)],
    ],
})

M.define(ResultEvent.Record, {
    writeContents: (w, msg) => {
        if ('key' in msg) { W.string(w, msg.key, 1); }
        if ('value' in msg) { W.string(w, msg.value, 2); }
    },
    fields: [
        [1, "key", F.string],
        [2, "value", F.string],
    ],
})

const ServiceOneService: S.GrpcService = {name: "ex.ample.ServiceOne"}

export namespace ServiceOne {
    export const ExampleUnaryRpc = S.unary(ServiceOneService, "ExampleUnaryRpc", Inner.encode, importableImportMeProto.Imported.decode);
    export const ExampleServerStreamingRpc = S.serverStreaming(ServiceOneService, "ExampleServerStreamingRpc", Outer.Nested.encode, importableImportMeProto.Imported.decode, () => Reducers.keepAll<importableImportMeProto.Imported.Strict>());
    export const ExampleSubscription = S.serverStreaming(ServiceOneService, "ExampleSubscription", Surrogates.Args.encode, ResultEvent.decode, () => Reducers.keepLastByKey<ResultEvent.Strict>());
}
