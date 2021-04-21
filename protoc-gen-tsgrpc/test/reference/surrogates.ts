import {Customize} from "protobuf-codec-ts"
import {Args as ArgsRaw} from "./importable/importMe.proto.gen";

export const Args = Customize.message(ArgsRaw).usingSurrogate({
    defVal: () => "default",
    isDef(v): v is "default" { return v === "default" },
    toSurrogate: (raw) => `(${raw.value})`,
    fromSurrogate: (surrogate) => {
        const stripped = /\((.*)\)/.exec(surrogate)?.[1];
        return stripped ? {value: stripped} : {value: `** bad format: "${surrogate}" **`};
    }
});
