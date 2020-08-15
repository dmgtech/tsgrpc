import { RepeatableFieldType, MessageFieldType, MessageImpl, FieldType } from './field-types';
import { Readable, NestedWritable, FieldWriter } from './types';

type SurrogateDef<TSurrogate, TStrict, TLoose> = {
    defVal: () => TSurrogate,
    fromSurrogate: (surrogate: TSurrogate) => TStrict | TLoose,
    toSurrogate: (raw: TStrict) => TSurrogate,
};

type Customizable<TStrict, TLoose> = {
    usingSurrogate<TCustom>(surrogateDef: SurrogateDef<TCustom, TStrict, TLoose>): RepeatableType<TCustom>
}

// This should ultimately replace MessageFieldType
type MessageType<TStrict, TLoose> = MessageFieldType<TStrict> & RepeatableType<TStrict, undefined> & {
    toStrict(v: TLoose): TStrict,
    writeValue(w: NestedWritable, value: TStrict | TLoose): void,
    write(w: NestedWritable, value: TStrict | TLoose | undefined, field?: number | undefined, force?: boolean | undefined): boolean,
}

// This should ultimately replace RepeatableFieldTYpe
type RepeatableType<TVal, TDef = TVal> = RepeatableFieldType<TVal, TDef> & ProtoType<TVal, TDef> & {
    writeValue(w: NestedWritable, value: TVal): void,
}

type ProtoType<TVal, TDef> = FieldType<TVal, TDef> & {
    write: FieldWriter<TVal | TDef>,
}

function createConverter<TStrict, TLoose>(rawType: MessageType<TStrict, TLoose>) {
    return <TSurrogate>(surrogateDef: SurrogateDef<TSurrogate, TStrict, TStrict | TLoose>): RepeatableType<TSurrogate> => {
        const {defVal, toSurrogate, fromSurrogate} = surrogateDef;
        const surrogate: RepeatableType<TSurrogate> = {
            defVal,
            readValue: (r: Readable) => toSurrogate(rawType.readValue(r)),
            read: (r, wt, number, prev) => {
                const raw = rawType.read(r, wt, number, () => undefined);
                return raw instanceof Error ? raw : toSurrogate(raw);
            },
            wireType: rawType.wireType,
            writeValue: (w: NestedWritable, value: TSurrogate) => rawType.writeValue(w, fromSurrogate(value)),
            write(w, value, field, force) {
                if (value === undefined)
                    return false;
                const rawValue = fromSurrogate(value);
                return rawType.write(w, rawValue, field, force);
            },
        };
        return surrogate;
    }
}

// This crazy generic code below allows us to get the Strict and Loose variations given only the message namespace
export function message<TMsgNs extends MessageType<TStrict, TLoose>, TLoose = Parameters<TMsgNs["toStrict"]>[0], TStrict = ReturnType<TMsgNs["readValue"]>>(rawType: TMsgNs): Customizable<TStrict, TLoose> {
    return {
        usingSurrogate: createConverter<TStrict, TLoose>(rawType)
    }
}
