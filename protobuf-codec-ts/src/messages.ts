import { ValueWriter, WriteMessageField, makeDelimitedWriter, makeFieldWriter, makeEncoder, makeDecoder } from './helpers';
import { MessageFieldDef, MessageValueReader, makeMessageValueReader, message } from './field-types';
import { FieldValueReader, FieldReader, WireType } from './types';

export type MessageDef<Strict extends Value, Value> = {
    /**
     * Write all non-default fields
     * @param {NestedWritable} writable - Target writable
     * @param {Value} value - instance of message
     */
    writeContents: ValueWriter<Value>,
    /**
     * Write all non-default fields into a length-prefixed block
     * @param {NestedWritable} writable - Target writable
     * @param {Value} value - instance of message
     */
    writeValue: ValueWriter<Value>,
    /**
     * Write all non-default fields into a length-prefixed block with a tag
     * @param {NestedWritable} writable - Target writable
     * @param {Value} value - instance of message
     * @param {number} field - number of field
     * @returns {boolean} - true if it wrote anything
     */
    write: WriteMessageField<Value>,
    /**
     * Convert a message instance to its encoded form
     * @param {Value} value - instance of message
     * @returns {Uint8Array} - the encoded form of the message
     */
    encode: (v: Value) => Uint8Array,
    fields: readonly MessageFieldDef[],
    readValue: FieldValueReader<Strict>,
    defVal: () => undefined,
    read: FieldReader<Strict, undefined>,
    wireType: WireType,
    decode: (bytes: Uint8Array) => Strict,
    toStrict: (v: Value) => Strict,
    readMessageValue: MessageValueReader<Strict>,
}

type MessageDefRaw<Strict extends Value, Value> = {
    writeContents: ValueWriter<Value>,
    fields: readonly MessageFieldDef[],
}

export function define<Strict extends Value, Value>(placeholder: MessageDef<Strict, Value>, raw: MessageDefRaw<Strict, Value>): void {
    const {writeContents, fields} = raw;
    const writeValue = makeDelimitedWriter(writeContents);
    const write = makeFieldWriter(writeValue);
    const encode = makeEncoder<Value>(writeContents);
    const readMessageValue = makeMessageValueReader<Strict>(fields);
    const {readValue, defVal, read, wireType} = message(() => ({readMessageValue}));
    const decode = makeDecoder(readValue);
    const toStrict: (value: Value) => Strict = undefined as any;
    const complete = {writeContents, writeValue, write, encode, fields, readMessageValue, readValue, defVal, read, wireType, decode, toStrict};
    Object.assign(placeholder, complete);
}
