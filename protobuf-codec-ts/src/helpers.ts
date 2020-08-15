import { NestedWritable, WireType, FieldWriter, FieldValueReader } from "./types";
import { tag } from "./write-field";
import { useSharedWriter } from "./writer";
import { Reader } from './protobuf-codec-ts';

export type ValueWriter<T> = (w: NestedWritable, value: T) => void;
export type WriteMessageField<T> = (w: NestedWritable, value: undefined | T, field?: number) => boolean

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