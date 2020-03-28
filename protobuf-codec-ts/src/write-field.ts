import {FieldWriter, Writable, WireType, NestedWritable} from "./types"
import * as val from "./write-value";
import Long from "long"

export namespace FieldEnc {
    export const double = WireType.Double;
    export const float = WireType.Single;
    export const int64 = WireType.Varint;
    export const uint64 = WireType.Varint;
    export const int32 = WireType.Varint;
    export const fixed64 = WireType.Double;
    export const fixed32 = WireType.Single;
    export const boolean = WireType.Varint;
    export const string = WireType.LengthDelim;
    export const bytes = WireType.LengthDelim;
    export const uint32 = WireType.Varint;
    export const enumeration = WireType.Varint;
    export const sfixed32 = WireType.Single;
    export const sfixed64 = WireType.Double;
    export const sint32 = WireType.Varint;
    export const sint64 = WireType.Varint;
}

function lengthOf(buffer: Uint8Array | ArrayBuffer | number[]) {
    if (Array.isArray(buffer))
        return buffer.length;
    return buffer.byteLength;
}

export const tag: (writable: Writable, field: number, wire: WireType) => void
= (w, field, wire) => val.int32(w, (field << 3) | wire)

export const packed: <T>(writable: NestedWritable, writer: FieldWriter<T>, value: Iterable<T> | undefined, field: number) => void
= (w, writeOne, repeated, field) => {
    if (repeated) {
        const iterator = repeated[Symbol.iterator]();
        const first = iterator.next();
        if (!first.done) {
            tag(w, field, WireType.LengthDelim);
            w.begin();
            writeOne(w, first.value, undefined, true);
            for (let current = iterator.next(); !current.done; current = iterator.next()) {
                writeOne(w, current.value, undefined, true);
            }
            w.end();
        }
    }
}

export const repeated: <T>(writable: NestedWritable, writer: FieldWriter<T>, value: Iterable<T> | undefined, field: number) => void
= (w, writeOne, repeated, field) => {
    if (repeated) {
        for (const record of repeated) {
            writeOne(w, record, field, true);
        }
    }
}

function writeMapEntry<K, V>(w: NestedWritable, field: number, writeKey: FieldWriter<K>, writeValue: FieldWriter<V>, key: K, value: V) {
    tag(w, field, WireType.LengthDelim);
    w.begin();
    writeKey(w, key, 1, false);
    writeValue(w, value, 2, false);
    w.end();
}

export const map: <K, V>(writable: NestedWritable, keyWriter: FieldWriter<K>, keyFromString: (v: string) => K, valueWriter: FieldWriter<V>, records: Map<K, V> | {[name: string]: V | undefined} | undefined, field: number) => void
= (w, writeKey, keyFromString, writeValue, records, field) => {
    if (records === undefined)
        return;
    if (records instanceof Map) {
        for (const [key, value] of records) {
            writeMapEntry(w, field, writeKey, writeValue, key, value);
        }
    }
    else {
        for (const stringKey in records) {
            const value = records[stringKey];
            if (value === undefined) {
                continue;
            }
            const key = keyFromString(stringKey);
            writeMapEntry(w, field, writeKey, writeValue, key, value);
        }
    }
}

/// ----------------------------------------------------------------------------

type WriteValue<TVal> = (w: Writable, value: TVal) => void;

// This makes a writer for a field when the protobuf type of the field is representable by a single javascript data type
function makeWriter<TVal>({ wireType, writeValue, isDefault }: { wireType: WireType; writeValue: WriteValue<TVal>; isDefault: (v: TVal) => boolean; }) {
    return (writable: Writable, value: TVal | undefined, field: number | undefined, force: boolean = false) => {
        if (value === undefined || (isDefault(value) && !force))
            return false;
        if (field !== undefined)
            tag(writable, field, wireType);
        writeValue(writable, value);
        return true;
    }
}

// This makes a writer for a field when the protobuf type of the field cannot be fully represented by a single javascript data type
// so we use some kind of surrogate type
function makeLongWriter<TSurrogate>(
{ wireType, writeNumber, writeLong, toLong, isNil = () => false }: { wireType: WireType; writeNumber: FieldWriter<number>; writeLong: WriteValue<Long>; toLong: (v: TSurrogate) => Long; isNil?: (v: TSurrogate) => boolean; }) {
    return (writable: NestedWritable, value: TSurrogate | number | undefined, field: number | undefined, force: boolean = false) => {
        if (typeof value === "number")
            return writeNumber(writable, value, field, force)
        if (value === undefined || isNil(value))
            return false;
        const long = toLong(value);
        if (!force && long.isZero())
            return false;
        if (field !== undefined)
            tag(writable, field, wireType);
        writeLong(writable, long);
        return true;
    }
}

const longFromString: (signed: boolean, base: number) => (v: string) => Long = (signed, base) => (v) => Long.fromString(v, !signed, base);

export const int32: FieldWriter<number> = makeWriter({
    wireType: FieldEnc.int32,
    writeValue: val.int32,
    isDefault: value => value === 0,
});

export const int64: FieldWriter<number> = makeWriter({
    wireType: FieldEnc.int64,
    writeValue: val.int64,
    isDefault: value => value === 0,
});

export const int64long: FieldWriter<Long | number> = makeLongWriter({
    wireType: FieldEnc.int64,
    writeNumber: int64,
    writeLong: val.int64long,
    toLong: v => v,
});

export const int64decimal: FieldWriter<string | number> = makeLongWriter<string>({
    wireType: FieldEnc.int64,
    writeNumber: int64,
    writeLong: val.int64long,
    toLong: longFromString(true, 10),
    isNil: v => v === "",
});

export const bool: FieldWriter<boolean> = makeWriter({
    wireType: FieldEnc.boolean,
    writeValue: val.bool,
    isDefault: value => value === false,
});

export const double: FieldWriter<number> = makeWriter({
    wireType: FieldEnc.double,
    writeValue: val.double,
    isDefault: value => value === 0 && !Object.is(value, -0),
});

export const fixed32: FieldWriter<number> = makeWriter({
    wireType: FieldEnc.fixed32,
    writeValue: val.fixed32,
    isDefault: value => value === 0,
});

export const fixed64: FieldWriter<number> = makeWriter({
    wireType: FieldEnc.fixed64,
    writeValue: val.fixed64,
    isDefault: value => value === 0,
});

export const fixed64long: FieldWriter<Long | number> = makeLongWriter({
    wireType: FieldEnc.fixed64,
    writeNumber: fixed64,
    writeLong: val.fixed64long,
    toLong: v => v,
});

export const fixed64decimal: FieldWriter<string | number> = makeLongWriter<string>({
    wireType: FieldEnc.fixed64,
    writeNumber: fixed64,
    writeLong: val.fixed64long,
    toLong: longFromString(false, 10),
    isNil: v => v === "",
});

export const float: FieldWriter<number> = makeWriter({
    wireType: FieldEnc.float,
    writeValue: val.float,
    isDefault: value => value === 0 && !Object.is(value, -0),
});

export const sfixed32: FieldWriter<number> = makeWriter({
    wireType: FieldEnc.sfixed32,
    writeValue: val.sfixed32,
    isDefault: value => value === 0,
});

export const sfixed64: FieldWriter<number> = makeWriter({
    wireType: FieldEnc.sfixed64,
    writeValue: val.sfixed64,
    isDefault: value => value === 0,
});

export const sfixed64decimal: FieldWriter<string | number> = makeLongWriter<string>({
    wireType: FieldEnc.sfixed64,
    writeNumber: sfixed64,
    writeLong: val.sfixed64long,
    toLong: longFromString(false, 10),
    isNil: v => v === "",
});

export const sfixed64long: FieldWriter<Long | number> = makeLongWriter({
    wireType: FieldEnc.sfixed64,
    writeNumber: sfixed64,
    writeLong: val.sfixed64long,
    toLong: v => v,
});

export const sint32: FieldWriter<number> = makeWriter({
    wireType: FieldEnc.sint32,
    writeValue: val.sint32,
    isDefault: value => value === 0,
});

export const sint64: FieldWriter<number> = makeWriter({
    wireType: FieldEnc.sint64,
    writeValue: val.sint64,
    isDefault: value => value === 0,
});

export const sint64decimal: FieldWriter<string | number> = makeLongWriter<string>({
    wireType: FieldEnc.sint64,
    writeNumber: sint64,
    writeLong: val.sint64long,
    toLong: longFromString(true, 10),
    isNil: v => v === "",
});

export const sint64long: FieldWriter<Long | number> = makeLongWriter({
    wireType: FieldEnc.sint64,
    writeNumber: sint64,
    writeLong: val.sint64long,
    toLong: v => v,
});

export const string: FieldWriter<string> = makeWriter({
    wireType: FieldEnc.string,
    writeValue: val.string,
    isDefault: value => value === "",
});

export const bytes: FieldWriter<ArrayBuffer | number[]> = makeWriter({
    wireType: FieldEnc.bytes,
    writeValue: val.bytes,
    isDefault: value => lengthOf(value) === 0,
});

export const uint32: FieldWriter<number> = makeWriter({
    wireType: FieldEnc.uint32,
    writeValue: val.uint32,
    isDefault: value => value === 0,
});

export const uint64: FieldWriter<number> = makeWriter({
    wireType: FieldEnc.uint64,
    writeValue: val.uint64,
    isDefault: value => value === 0,
});

export const uint64long: FieldWriter<Long | number> = makeLongWriter({
    wireType: FieldEnc.uint64,
    writeNumber: uint64,
    writeLong: val.uint64long,
    toLong: v => v,
});

export const uint64decimal: FieldWriter<string | number> = makeLongWriter<string>({
    wireType: FieldEnc.uint64,
    writeNumber: uint64,
    writeLong: val.uint64long,
    toLong: longFromString(false, 10),
    isNil: v => v === "",
});
