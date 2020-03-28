import { NestedWritable, WireType } from "./types";
import { tag } from "./write-field";
import { useSharedWriter } from "./writer";

export type Encoded<ProtoName> = ArrayBuffer & {__proto: ProtoName};

export type WriteMessage<T> = (w: NestedWritable, value: T) => void;
type WriteMessageField<T> = (w: NestedWritable, value: undefined | T, field?: number) => boolean
type EncodeMessage<T, ProtoName> = (value: T) => Encoded<ProtoName>

export function makeDelimitedWriter<T>(writeContents: WriteMessage<T>): WriteMessage<T> {
    return (w: NestedWritable, value: T) => {
        w.begin();
        writeContents(w, value);
        w.end();
    }
}

export function makeFieldWriter<T>(writeValue: WriteMessage<T>): WriteMessageField<T> {
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

export function makeEncoder<ProtoName, T>(writeContents: WriteMessage<T>): EncodeMessage<T, ProtoName> {
    return (value: T) => {
        return useSharedWriter(w => {
            writeContents(w, value);
        }) as (Uint8Array & {__proto: ProtoName});
    }
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

export function makeToNumber<ProtoName, TLiteral>(construct: EnumConstructor<ProtoName, TLiteral>) {
    return (v: EnumValue<ProtoName> | TLiteral | undefined) =>
        (v === undefined) ? undefined : construct(v).toNumber();
}

export function makeToString<ProtoName, TLiteral>(construct: EnumConstructor<ProtoName, TLiteral>) {
    return (v: EnumValue<ProtoName> | TLiteral | undefined) =>
        (v === undefined) ? undefined : construct(v).toString();
}


