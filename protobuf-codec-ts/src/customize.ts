import { RepeatableFieldType, MessageFieldType, MessageImpl, FieldType } from './field-types';
import { WriteMessage } from './helpers';
import { Readable, WireType, FieldReader, NestedWritable, FieldWriter } from './types';
import { Writable } from 'stream';

type ConversionDef<TCustom, TStrict, TLoose> = {
    defVal: () => TCustom,
    fromCustom: (custom: TCustom) => TStrict,
    toCustom: (raw: TStrict | TLoose | undefined) => TCustom,
};

type Representable<TStrict, TLoose> = {
    usingConversion<TCustom>(conversionDef: ConversionDef<TCustom, TStrict, TLoose>): RepeatableType<TCustom>
}

// This should ultimately replace MessageFieldType
type MessageType<TStrict, TLoose> = MessageFieldType<TStrict> & RepeatableType<TStrict, undefined> & {
    toStrict(v: TLoose): TStrict,
    writeValue(w: NestedWritable, value: TStrict | TLoose): void,
}

// This should ultimately replace RepeatableFieldTYpe
type RepeatableType<TVal, TDef = TVal> = RepeatableFieldType<TVal, TDef> & ProtoType<TVal, TDef> & {
    writeValue(w: NestedWritable, value: TVal): void,
}

type ProtoType<TVal, TDef> = FieldType<TVal, TDef> & {
    write: FieldWriter<TVal | TDef>,
}

function createConverter<TStrict, TLoose>(rawType: MessageType<TStrict, TLoose>) {
    return <TCustom>(conversionDef: ConversionDef<TCustom, TStrict, TStrict | TLoose>): RepeatableType<TCustom> => {
        const {defVal, toCustom, fromCustom} = conversionDef;
        const custom: RepeatableType<TCustom> = {
            defVal,
            readValue: (r: Readable) => toCustom(rawType.readValue(r)),
            read: (r, wt, number, prev) => {
                const raw = rawType.read(r, wt, number, () => undefined);
                return raw instanceof Error ? raw : toCustom(raw);
            },
            wireType: rawType.wireType,
            writeValue: (w: NestedWritable, value: TCustom) => rawType.writeValue(w, fromCustom(value)),
            write(w, value, field, force) {
                if (value === undefined)
                    return false;
                const rawValue = fromCustom(value);
                return rawType.write(w, rawValue, field, force);
            },
        };
        return custom;
    }
}

// This crazy generic code below allows us to get the Strict and Loose variations given only the message namespace
export function representationOf<TMsgNs extends MessageType<TStrict, TLoose>, TLoose = Parameters<TMsgNs["toStrict"]>[0], TStrict = ReturnType<TMsgNs["readValue"]>>(rawType: TMsgNs): Representable<TStrict, TLoose> {
    return {
        usingConversion: createConverter<TStrict, TLoose>(rawType)
    }
}
