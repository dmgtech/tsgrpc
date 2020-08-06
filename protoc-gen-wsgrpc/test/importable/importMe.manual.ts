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
}
