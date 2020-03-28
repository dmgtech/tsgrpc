import {WriteField as W, KeyConverters as KC, Helpers as H, ReadField as R, Reader, FieldReader, FieldTypes as F} from "protobuf-codec-ts"

export namespace example {

/*
enum EnumType {
    ENUM_TYPE_NONE = 0;
    ENUM_TYPE_ONE = 1;
    ENUM_TYPE_TWO = 2;
}
*/

export namespace EnumType {
    type ProtoName = "example.EnumType"

    export type Value = H.EnumValue<ProtoName>;
    export type None = typeof None | "None" | 0
    export type One = typeof One | "One" | 1
    export type Two = typeof Two | "Two" | 2

    export const None = H.enumValue<ProtoName>(0, "None");
    export const One = H.enumValue<ProtoName>(1, "One");
    export const Two = H.enumValue<ProtoName>(2, "Two");
 
    const map = new Map<string|number, Value>([
        ["none", EnumType.None],
        [0, EnumType.None],
        ["one", EnumType.One],
        [1, EnumType.One],
        ["two", EnumType.Two],
        [2, EnumType.Two],
    ]);

    type LiteralNumber = 0 | 1 | 2
    type LiteralString = "None" | "One" | "Two"
    export type Literal = LiteralNumber | LiteralString

    export const from = H.makeEnumConstructor<ProtoName, LiteralNumber, LiteralString>(map);
    export const toNumber = H.makeToNumber(from);
    export const toString = H.makeToString(from);
}
export type EnumType = H.EnumValue<"example.EnumType">


/*
message Inner {
    sfixed32 int_fixed = 13;
    sfixed64 long_fixed = 14;
    sint32 zigzag_int = 15;
    sint64 zigzag_long = 16;
}
*/
export namespace Inner {
    type ProtoName = "example.Inner";

    export interface Strict {
        // sfixed32 int_fixed = 13;
        readonly intFixed: number,
        // sfixed64 long_fixed = 14;
        readonly longFixed: string,
        // sint32 zigzag_int = 15;
        readonly zigzagInt: number,
        // sint64 zigzag_long = 16;
        readonly zigzagLong: string,
    }

    export interface Loose {
        // sfixed32 int_fixed = 13;
        readonly intFixed?: number,
        // sfixed64 long_fixed = 14;
        readonly longFixed?: number | string,
        // sint32 zigzag_int = 15;
        readonly zigzagInt?: number,
        // sint64 zigzag_long = 16;
        readonly zigzagLong?: number | string,
    }

    type Value = Strict | Loose;

    export const writeContents: H.WriteMessage<Value> = (w, msg) => {
        W.sfixed32(w, msg.intFixed, 13);
        W.sfixed64decimal(w, msg.longFixed, 14);
        W.sint32(w, msg.zigzagInt, 15);
        W.sint64decimal(w, msg.zigzagLong, 16);
    }

    export const writeValue = H.makeDelimitedWriter(writeContents);

    export const write = H.makeFieldWriter(writeValue);

    export const encode = H.makeEncoder<ProtoName, Loose | Strict>(writeContents);

    const fields: R.FieldInfo[] = [
        [13, "intFixed", F.sfixed32],
        [14, "longFixed", F.sfixed64decimal],
        [15, "zigzagInt", F.sint32],
        [16, "zigzagLong", F.sint64decimal],
    ]

    const reader = F.message<Strict>(fields);
    export const {def, read, readValue, wireType} = reader;

    export const decode = (bytes: Uint8Array) => readValue(Reader.fromBytes(bytes));
}


/*
message Outer {
    double double_val = 1;
    float float_val = 2;
    int64 long_val = 3;
    uint64 ulong_val = 4;
    int32 int_val = 5;
    fixed64 ulong_fixed = 6;
    fixed32 uint_fixed = 7;
    bool bool_val = 8;
    string string_val = 9;
    bytes bytes_val = 10;
    uint32 uint_val = 11;
    EnumType enum_val = 12;
    Inner inner = 17;
    repeated double doubles = 18;
    repeated Inner inners = 19;
    map<string, string> map = 20;
    map<string, Inner> map_inner = 21;
    map<int64, int32> map_ints = 22;
    map<bool, string> map_bool = 23;
    Outer recursive = 24;
    oneof union {
        Inner inner_option = 25;
        string string_option = 26;
    }
}

*/
export namespace Outer {
    type ProtoName = "example.Outer";

    type UnionStrict = { unionCase: "" }
        // Inner inner_option = 25;
        | { unionCase: "innerOption", innerOption: Inner.Strict | undefined }
        // string string_option = 26;
        | { unionCase: "stringOption", stringOption: string | undefined }

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
        readonly map: Map<string, string>,
        // map<string, Inner> map_inner = 21;
        readonly mapInner?: { [key: string]: Inner.Loose | Inner.Strict },
        // map<int64, int32> map_ints = 22;
        readonly mapInts?: { [key: number]: number },
        // map<bool, string> map_bool = 23;
        readonly mapBool?: { [key in "true" | "false"]?: string },
        // Outer recursive = 24;
        readonly recursive: Strict | undefined,
    } & UnionStrict

    type UnionLoose = {}
        // Inner inner_option = 25;
        | { innerOption: Inner.Loose | Inner.Strict | undefined }
        // string string_option = 26;
        | { stringOption: string | undefined }

    export type Loose = {
        // double double_val = 1;
        readonly doubleVal?: number,
        // float float_val = 2;
        readonly floatVal?: number,
        // int64 long_val = 3;
        readonly longVal?: string | number,
        // uint64 ulong_val = 4;
        readonly ulongVal?: string | number,
        // int32 int_val = 5;
        readonly intVal?: number,
        // fixed64 ulong_fixed = 6;
        readonly ulongFixed?: string | number,
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
        readonly enumVal?: EnumType | EnumType.Literal,
        // Inner inner = 17;
        readonly inner?: Inner.Loose | Inner.Strict,
        // repeated double doubles = 18;
        readonly doubles?: number[],
        // repeated Inner inners = 19;
        readonly inners?: (Inner.Loose | Inner.Strict)[],
        // map<string, string> map = 20;
        readonly map?: Map<string, string> | { [key: string]: string },
        // map<string, Inner> map_inner = 21;
        readonly mapInner?: Map<string, Inner.Loose | Inner.Strict> | { [key: string]: Inner.Loose | Inner.Strict },
        // map<int64, int32> map_ints = 22;
        readonly mapInts?: Map<string | number, number> | { [key: string]: number },
        // map<bool, string> map_bool = 23;
        readonly mapBool?: Map<boolean, string> | { [key in "true" | "false"]?: string },
        // Outer recursive = 24;
        readonly recursive?: Outer.Loose | Outer.Strict,
    } & UnionLoose

    type Value = Strict | Loose;

    /**
     * Write all non-default fields
     * @param w 
     * @param msg 
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
        W.int32(w, EnumType.toNumber(msg.enumVal), 12);
        Inner.write(w, msg.inner, 17);
        W.packed(w, W.double, msg.doubles, 18);
        W.repeated(w, Inner.write, msg.inners, 19);
        W.map(w, W.string, KC.string, W.string, msg.map, 20);
        W.map(w, W.string, KC.string, Inner.write, msg.mapInner, 21);
        W.map(w, W.int64decimal, KC.int64decimal, W.int32, msg.mapInts, 22);
        W.map(w, W.bool, KC.bool, W.string, msg.mapBool, 23);
        Outer.write(w, msg.recursive, 24);
        // TODO: this might be inefficient for large oneofs; consider and benchmark other methods for large oneofs
        if ("innerOption" in msg) { Inner.write(w, msg.innerOption, 25); }
        else if ("stringOption" in msg) { W.string(w, msg.stringOption, 26); }
    }

    /**
     * Write a length-delimited block
     */
    export const writeValue = H.makeDelimitedWriter(writeContents);

    /**
     * Write a tag and length-delimited block
     */
    export const write = H.makeFieldWriter(writeValue);

    /**
     * Convert the message to its encoded form
     */
    export const encode = H.makeEncoder<ProtoName, Loose | Strict>(writeContents);

    const fields: R.FieldInfo[] = [
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
        [12, "enumVal", F.int32],
        [17, "inner", Inner],
        [18, "doubles", F.repeated(F.double)],
        [19, "inners", F.repeated(Inner)],
        /*
        [20, "map", F.],
        [21, "mapInner", F.],
        [22, "mapInts", F.],
        [23, "mapBool", F.],
        */
        [24, "recursive", Outer],
        /*
        [, "unionCase", F.],
        */
        [25, "innerOption", F.oneof("union", Inner)],
        [26, "stringOption", F.oneof("union", F.string)],
        /*

        get inners(): Inner.Strict[] { return this._vtable[14](); }
        get map(): Map<string, string> { return this._vtable[15](); }
        get mapInner(): { [key: string]: Inner.Loose | Inner.Strict } { return this._vtable[16](); }
        get mapInts(): { [key: number]: number } { return this._vtable[17](); }
        get mapBool(): { [key in "true" | "false"]?: string } { return this._vtable[18](); }
        get recursive(): Strict | undefined { return this._vtable[19](); }
        get unionCase(): "" | "innerOption" | "stringOption" { return this._vtable[20](); }
        get innerOption(): Inner.Strict | undefined { return this._vtable[21](); }
        get stringOption(): string | undefined { return this._vtable[22](); }

        */
    ]

    const reader = F.message<Strict>(fields);
    export const {def, read, readValue, wireType} = reader;

    export const decode = (bytes: Uint8Array) => readValue(Reader.fromBytes(bytes));

}

}