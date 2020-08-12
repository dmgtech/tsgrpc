import { NestedWritable, WireType, FieldWriter, FieldValueReader } from "./types";
import { tag, int32 } from "./write-field";
import { useSharedWriter } from "./writer";
import { Reader } from './protobuf-codec-ts';

export type Encoded<ProtoName> = ArrayBuffer & {__proto: ProtoName};

export type ValueWriter<T> = (w: NestedWritable, value: T) => void;
type WriteMessageField<T> = (w: NestedWritable, value: undefined | T, field?: number) => boolean
type EncodeMessage<T, ProtoName> = (value: T) => Encoded<ProtoName>

export function makeDelimitedWriter<T>(writeContents: ValueWriter<T>): ValueWriter<T> {
    return (w: NestedWritable, value: T) => {
        w.begin();
        writeContents(w, value);
        w.end();
    }
}

export function makeFieldWriter<T>(writeValue: ValueWriter<T>): WriteMessageField<T> {
    return (w: NestedWritable, value: undefined | T, field?: number) => {
        if (value !== undefined) {
            if (field !== undefined)
                tag(w, field, WireType.LengthDelim);
            writeValue(w, value);
            return true;
        }
        return false;
    }
}

export function makeEncoder<T>(writeValue: ValueWriter<T>): (v: T) => Uint8Array {
    return (value: T) => {
        return useSharedWriter(w => {
            writeValue(w, value);
        })
    }
}

export function makeDecoder<T>(readValue: FieldValueReader<T>): (bytes: Uint8Array) => T {
    return (bytes: Uint8Array) => readValue(Reader.fromBytes(bytes))
}

export function enumValue<ProtoName>(n: number, s: string): EnumValue<ProtoName> {
    return {
        toString: () => s,
        toJSON: () => s,
        toNumber: () => n,
    } as EnumValue<ProtoName>
}
interface Enum {
    toString(): string,
    toJSON(): string,
    toNumber(): number,
}
export type EnumValue<ProtoName> = Enum & {__enum: ProtoName}
export type EnumConstructor<ProtoName, TLiteral> = (v: EnumValue<ProtoName> | TLiteral) => EnumValue<ProtoName>;

export function makeEnumConstructor<ProtoName extends string, TLiteralNumber extends number, TLiteralString extends string>(
    map: Map<string|number, EnumValue<ProtoName>>
    ): EnumConstructor<ProtoName, TLiteralNumber | TLiteralString>
    {
    return (v: EnumValue<ProtoName> | TLiteralNumber | TLiteralString) => {
        const e: EnumValue<ProtoName> | undefined =
            (typeof v === "number") ? map.get(v) :
            (typeof v === "string") ? map.get(v.toLowerCase()) :
            v;
        if (e === undefined)
            throw new Error(`Invalid EnumType ${v}`)
        return e;
    }
}

export function makeEnumWriter<ProtoName, TLiteral>(toNumber: EnumToNumber<TLiteral, ProtoName>): FieldWriter<EnumValue<ProtoName> | TLiteral> {
    return (w, value, field, force) => int32(w, toNumber(value), field, force);
}

export interface EnumToNumber<TLiteral, ProtoName> {
    (v: TLiteral | EnumValue<ProtoName>): number
    (v: undefined): undefined
    (v: TLiteral | EnumValue<ProtoName> | undefined): number | undefined
}
export function makeToNumber<ProtoName, TLiteral>(construct: EnumConstructor<ProtoName, TLiteral>): EnumToNumber<TLiteral, ProtoName> {
    return ((v: EnumValue<ProtoName> | TLiteral | undefined) =>
        (v === undefined) ? undefined : construct(v).toNumber()) as EnumToNumber<TLiteral, ProtoName>;
}

export function makeToString<ProtoName, TLiteral>(construct: EnumConstructor<ProtoName, TLiteral>) {
    return (v: EnumValue<ProtoName> | TLiteral | undefined) =>
        (v === undefined) ? undefined : construct(v).toString();
}

export function once<T>(fn: () => T): () => T {
    let get = () => {
        const value = fn();
        get = () => value;
        return value;
    }
    return () => get();
}

const zeroBytes = new Uint8Array(0);
export const empty = () => Reader.fromBytes(zeroBytes);

export const noconstructor: new () => any = class { constructor() { throw new Error("Attempt to use 'noconstructor'"); }};