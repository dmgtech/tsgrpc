import { RepeatableFieldType, MessageImpl } from './field-types';
import { WriteMessage } from './helpers';
import { Readable } from './types';

type ConversionDef<TCustom, TStrict, TValue> = {
    defVal: () => TCustom,
    fromCustom: (custom: TCustom) => TStrict | undefined,
    toCustom: (raw: TValue | undefined) => TCustom,
};

type CustomizedRepresentation<TCustom, TStrict, TValue> = ConversionDef<TCustom, TStrict, TValue> & {
    wrapField(rawFieldType: RepeatableFieldType<MessageImpl<TStrict>, undefined>): RepeatableFieldType<TCustom>
}

type Representable<TStrict, TValue> = {
    usingConversion<TCustom>(def: ConversionDef<TCustom, TStrict, TValue>): CustomizedRepresentation<TCustom, TStrict, TValue>
}

function customize<TCustom, TStrict, TLoose>({defVal, toCustom, fromCustom}: ConversionDef<TCustom, TStrict, TStrict | TLoose>): CustomizedRepresentation<TCustom, TStrict, TStrict | TLoose> {
    function wrapField(rawFieldType: RepeatableFieldType<MessageImpl<TStrict>, undefined>) {
        const wrapped: RepeatableFieldType<TCustom> = {
            defVal,
            readValue: (r) => toCustom(rawFieldType.readValue(r)),
            read: (r, wt, number, prev) => {
                const raw = rawFieldType.read(r, wt, number, () => undefined);
                return raw instanceof Error ? raw : toCustom(raw);
            },
            wireType: rawFieldType.wireType,
        }
        return wrapped;
    }

    return {
        defVal,
        fromCustom,
        toCustom,
        wrapField,
    }
}

export function representationOf<TMsgNs extends {writeValue: WriteMessage<TValue>, readValue: (r: Readable) => TStrict}, TValue = Parameters<TMsgNs["writeValue"]>[1], TStrict = ReturnType<TMsgNs["readValue"]>>(msgNs: TMsgNs): Representable<TStrict, TValue> {
    return {
        usingConversion: customize
    }
}
