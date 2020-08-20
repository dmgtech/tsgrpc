import { RepeatableFieldType, FieldType, makeDecoder } from './field-types';
import { Readable, NestedWritable, FieldWriter, WireType } from './types';
import { MessageFieldType, extendBasicCodec, TypeCodecBasic, TypeCodec } from './messages';
import { makeEncoder } from './write-field';

type SurrogateDef<TSurrogate, TDefault, TStrict, TLoose> = {
    defVal: () => TDefault,
    isDef: (v: TSurrogate | TDefault) => v is TDefault,
    fromSurrogate: (surrogate: TSurrogate) => TStrict | TLoose,
    toSurrogate: (raw: TStrict) => TSurrogate,
};

type Customizable<TStrict, TLoose> = {
    usingSurrogate<TSurrogate, TDefault>(surrogateDef: SurrogateDef<TSurrogate, TDefault, TStrict, TLoose>): TypeCodec<TSurrogate, TSurrogate, TDefault>
}

// This should ultimately replace MessageFieldType
type MessageType<TStrict, TLoose> = MessageFieldType<TStrict> & RepeatableType<TStrict, undefined> & {
    create(v: TLoose): TStrict,
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

function createConverter<TStrict extends TValue, TValue>(rawType: TypeCodecBasic<TStrict, TValue, undefined>) {
    return <TSurrogate, TDefault>(surrogateDef: SurrogateDef<TSurrogate, TDefault, TStrict, TValue>): TypeCodec<TSurrogate, TSurrogate, TDefault> => {
        const {defVal, isDef, toSurrogate, fromSurrogate} = surrogateDef;
        const rawMsg = extendBasicCodec(rawType);
        const writeContents = (w: NestedWritable, value: TSurrogate) => rawType.writeContents(w, fromSurrogate(value));
        const writeValue = (w: NestedWritable, value: TSurrogate) => rawMsg.writeValue(w, fromSurrogate(value));
        const readValue = (r: Readable) => toSurrogate(rawMsg.readValue(r));
        const surrogate: TypeCodec<TSurrogate, TSurrogate, TDefault> = {
            defVal,
            isDef,
            readValue,
            read: (r, wt, number, prev) => {
                const raw = rawMsg.read(r, wt, number, () => undefined);
                return raw instanceof Error ? raw : toSurrogate(raw);
            },
            readMessageValue: (r, prev) => toSurrogate(rawType.readMessageValue(r, undefined)) as any, // TODO: this basically isn't really supported
            writeContents,
            writeValue,
            write(w, value, field) {
                if (value === undefined)
                    return false;
                // Note: this isn't as correct as it could be because the equality operator might not be the most appropriate
                //       and it's possible there could be multiple representations that should be considered default
                //       so we should make the surrogate def specify an isDefault (perhaps optionally)
                if (isDef(value))
                    return false;
                const rawValue = fromSurrogate(value);
                return rawMsg.write(w, rawValue, field);
            },
            encode: makeEncoder(writeContents),
            decode: makeDecoder(readValue),
            create: (value: TSurrogate, merge?: TSurrogate) => toSurrogate(rawType.create(fromSurrogate(value), merge !== undefined ? fromSurrogate(merge) : undefined)),
        };
        return surrogate;
    }
}

// This crazy generic code below allows us to get the Strict and Loose variations given only the message namespace
export function message<TMsgNs extends TypeCodecBasic<TStrict, TLoose, undefined>, TLoose = Parameters<TMsgNs["create"]>[0], TStrict extends TLoose = ReturnType<TMsgNs["readMessageValue"]>>(rawType: TMsgNs): Customizable<TStrict, TLoose> {
    return {
        usingSurrogate: createConverter<TStrict, TStrict | TLoose>(rawType)
    }
}
