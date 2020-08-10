import {Customize} from "protobuf-codec-ts"
import {Args as ArgsRaw} from "./importable/importMe.manual";

export const Args = Customize.message(ArgsRaw).usingSurrogate({
    defVal: () => "",
    toSurrogate: (raw) => raw ? `(${raw.value})` : "",
    fromSurrogate: (custom) => {
        const stripped = /\((.*)\)/.exec(custom || "")?.[1];
        return stripped ? {value: stripped} : {value: `** bad format: "${custom}" **`};
    }
});
