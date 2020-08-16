import { RepeatableFieldType, FieldType } from './field-types';
import { Readable, NestedWritable, FieldWriter } from './types';
import { MessageFieldType } from './messages';

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
                // Note: this isn't as correct as it could be because the equality operator might not be the most appropriate
                //       and it's possible there could be multiple representations that should be considered default
                //       so we should make the surrogate def specify an isDefault (perhaps optionally)
                if (value === defVal())
                    return false;
                const rawValue = fromSurrogate(value);
                return rawType.write(w, rawValue, field, force);
            },
        };
        return surrogate;
    }
}

// This crazy generic code below allows us to get the Strict and Loose variations given only the message namespace
export function message<TMsgNs extends MessageType<TStrict, TLoose>, TLoose = Parameters<TMsgNs["create"]>[0], TStrict = ReturnType<TMsgNs["readValue"]>>(rawType: TMsgNs): Customizable<TStrict, TLoose> {
    return {
        usingSurrogate: createConverter<TStrict, TLoose>(rawType)
    }
}
