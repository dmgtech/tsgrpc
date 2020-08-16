import {relative, dirname, join} from "path";

function rooted(path: string) {
    return join(`/${path}`)
}

export function protoPathToTsImportPath(path: string) {
    return `${path.replace(/\.proto$/, ".proto.gen")}`;
}

export function relativeImportPath(target: string, fromContext: string) {
    const rel = relative(dirname(rooted(fromContext)), rooted(target));
    return rel.startsWith('.') ? rel : `./${rel}`;
}

