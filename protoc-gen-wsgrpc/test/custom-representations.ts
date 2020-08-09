import {Customize} from "protobuf-codec-ts"
import {Args as ArgsRaw} from "./importable/importMe.manual";
import { FieldTypes } from "protobuf-codec-ts";

export const Args: FieldTypes.RepeatableFieldType<string> = Customize.representationOf(ArgsRaw).usingConversion({
    defVal: () => "",
    toCustom: (raw) => raw ? `(${raw.value})` : "",
    fromCustom: (custom) => {
        const stripped = /\((.*)\)/.exec(custom || "")?.[1];
        return stripped ? {value: stripped} : undefined;
    }
});
