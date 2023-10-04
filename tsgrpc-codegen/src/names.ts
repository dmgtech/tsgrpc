import {isTruthy} from "./util";
import {camelCase} from "change-case";

export function protoNameJoin(...parts: (string | undefined | null)[]): string {
    return parts
        .filter(isTruthy)
        .map(s => s.replace(/^\./, "").replace(/\.$/, ""))
        .filter(isTruthy)
        .join('.')
}

export function protoNameUnqualified(name: string) {
    return name.split(/\./).slice(-1)[0];
}

export function nsRelative(name: string, nameContext: string | undefined) {
    const nameSegs = name.replace(/^\./, '').split('.');
    const ctxSegs = (nameContext || "").replace(/^\./, '').split('.');
    let i: number;
    for (i = 0; i < (nameSegs.length - 1) && i < ctxSegs.length && nameSegs[i] === ctxSegs[i]; i++) ;
    return nameSegs.slice(i).join(".");
}

export function importNameFor(path: string) {
    return camelCase(path.replace(/[\-\/\.]/, "_"));
}

