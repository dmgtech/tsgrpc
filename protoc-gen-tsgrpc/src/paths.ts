import {relative, dirname, join, sep} from "path";

const toPortable: (path: string) => string = sep === "/" ? (p => p) : (p => p.split(sep).join('/'))

function rooted(path: string) {
    return join(`/${path}`)
}

export function protoPathToTsImportPath(path: string) {
    return `${path.replace(/\.proto$/, ".proto.gen")}`;
}

export function relativeImportPath(target: string, fromContext: string) {
    const rel = toPortable(relative(dirname(rooted(fromContext)), rooted(target)));
    return rel.startsWith('.') ? rel : `./${rel}`;
}

