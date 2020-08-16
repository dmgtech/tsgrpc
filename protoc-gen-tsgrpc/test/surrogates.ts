import {Customize} from "protobuf-codec-ts"
import {Args as ArgsRaw} from "./importable/importMe.manual";

export const Args = Customize.message(ArgsRaw).usingSurrogate({
    defVal: () => "default",
    toSurrogate: (raw) => `(${raw.value})`,
    fromSurrogate: (surrogate) => {
        const stripped = /\((.*)\)/.exec(surrogate)?.[1];
        return stripped ? {value: stripped} : {value: `** bad format: "${surrogate}" **`};
    }
});
