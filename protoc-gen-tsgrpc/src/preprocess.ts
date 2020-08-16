import { FileDescriptorProto, EnumDescriptorProto, DescriptorProto, FieldDescriptorProto, FieldOptions, OneofDescriptorProto, MessageOptions, EnumValueDescriptorProto, EnumOptions} from "protoc-plugin";
import { protoNameJoin, protoNameUnqualified } from "./names";
import { not } from "./util";
// This file contains preprocessing of the protocol buffer structures into more usuable shapes
// for later rendering

export type FileContext = {
    path: string,
    pkg: string | undefined,
    comments: ReadonlyMap<string, string>,
}

export type ImportContext = Map<string, FileContext>;

export type FieldDef = {
    name?: string,
    number?: number,
    label?: FieldDescriptorProto.Label,
    type?: FieldDescriptorProto.Type,
    typeName?: string,
    extendee?: string,
    defaultValue?: string,
    oneofIndex?: number,
    jsonName?: string,
    options?: FieldOptions.AsObject,
    path: string,
    comments: string | undefined,
};

export type MessageDef = {
    type: "message",
    name?: string,
    extensionList: Array<FieldDescriptorProto.AsObject>,
    extensionRangeList: Array<DescriptorProto.ExtensionRange.AsObject>,
    oneofDeclList: Array<OneofDescriptorProto.AsObject>,
    options?: MessageOptions.AsObject,
    reservedRangeList: Array<DescriptorProto.ReservedRange.AsObject>,
    reservedNameList: Array<string>,
    path: string,
    nestedTypeList: MessageDef[],
    enumTypeList: EnumDef[],
    fieldList: FieldDef[]
    fqName: string,
    comments: string | undefined,
    mapTypeList: MessageDef[],
};

export type EnumDef = {
    type: "enum",
    name?: string,
    valueList: Array<EnumValueDescriptorProto.AsObject>,
    options?: EnumOptions.AsObject,
    reservedRangeList: Array<EnumDescriptorProto.EnumReservedRange.AsObject>,
    reservedNameList: Array<string>,
    path: string
    fqName: string,
    comments: string | undefined,
};

export function toMessageDefs(ns: string | undefined, list: DescriptorProto.AsObject[], path: string, listField: number, comments: ReadonlyMap<string, string>): MessageDef[] {
    const context = `${path}/${listField}`;
    return list.map<MessageDef>((nested, i) => ({
        ...nested,
        type: "message",
        fqName: `.${protoNameJoin(ns, nested.name)}`,
        path: `${context}/${i}`,
        nestedTypeList: toMessageDefs(`.${protoNameJoin(ns, nested.name)}`, nested.nestedTypeList.filter(not(isMapType)), `${context}/${i}`, 3, comments),
        mapTypeList: toMessageDefs(`.${protoNameJoin(ns, nested.name)}`, nested.nestedTypeList.filter(isMapType), `${context}/${i}`, 3, comments),
        enumTypeList: toEnumDefs(protoNameJoin(ns, nested.name), nested.enumTypeList, `${context}/${i}`, 4, comments),
        fieldList: toFieldDefs(nested.fieldList, `${context}/${i}`, 2, comments),
        comments: comments.get(`${context}/${i}`),
    }))
}

export function toEnumDefs(ns: string | undefined, list: EnumDescriptorProto.AsObject[], path: string, listField: number, comments: ReadonlyMap<string, string>): EnumDef[] {
    const context = `${path}/${listField}`;
    return list.map<EnumDef>((nested, i) => ({
        ...nested,
        type: "enum",
        fqName: `.${protoNameJoin(ns, nested.name)}`,
        path: `${context}/${i}`,
        comments: comments.get(`${context}/${i}`),
    }))
}

export function toFieldDefs(list: FieldDescriptorProto.AsObject[], path: string, listField: number, comments: ReadonlyMap<string, string>): FieldDef[] {
    const context = `${path}/${listField}`;
    return list.map<FieldDef>((field, i) => ({
        ...field,
        path: `${context}/${i}`,
        comments: comments.get(`${context}/${i}`),
    }))
}

function isMapType(m: DescriptorProto.AsObject): boolean {
    return m.options?.mapEntry === true;
}

function getComments(file: FileDescriptorProto): ReadonlyMap<string, string> {
    const comments = new Map<string, string>();
    for (const location of file.getSourceCodeInfo()?.getLocationList() || []) {
        const path = location.getPathList().map(s => `/${s}`).join("");
        const leadingComments = location.getLeadingComments()?.trim();
        if (leadingComments) {
            comments.set(path, leadingComments);
        }
    }
    return comments;
}

type CommentFlag = {name: string, args?: string}

export function parseCommentFlags(comment: string): readonly CommentFlag[] {
    const commentFlagPattern = /@([a-zA-Z\-_][a-zA-Z\-_0-9]*)(:[^\s]*)?/g;
    const flags: CommentFlag[] = [];
    let match;
    while (match = commentFlagPattern.exec(comment)) {
        const name = match[1];
        const args = match[2]?.slice(1);
        flags.push(args ? {name, args} : {name});
    }
    return flags;
}

export function getSurrogates(files: FileDescriptorProto[]): ReadonlyMap<string, string> {
    const types = new Map<string, string>();
    for (const file of files) {
        const comments = getComments(file);
        recurseTypes(file.getPackage(), file.getMessageTypeList(), file.getEnumTypeList(), (name, type, path) => {
            const comment = comments.get(path);
            if (!comment)
                return;
            const commentFlags = parseCommentFlags(comment);
            const hasSurrogate = commentFlags.find(cf => cf.name === "has-surrogate");
            if (hasSurrogate) {
                types.set(name, protoNameUnqualified(name));
            }
        }, 4, 5, "");
    }
    return types;
}

function recurseTypes(ns: string | undefined, msgs: DescriptorProto[], enums: EnumDescriptorProto[], onRecord: (name: string, type: DescriptorProto | EnumDescriptorProto, path: string) => void, messagesFieldNum: number, enumsFieldNum: number, path: string) {
    for (let i = 0; i < msgs.length; i++) {
        const message = msgs[i];
        const name = `${protoNameJoin(ns, message.getName()!)}`;
        const pathToThis = `${path}/${messagesFieldNum}/${i}`;
        onRecord(`.${name}`, message, pathToThis);
        recurseTypes(name, message.getNestedTypeList(), message.getEnumTypeList(), onRecord, 3, 4, pathToThis);
    }
    for (let i = 0; i < enums.length; i++) {
        const enumeration = enums[i];
        const name = `${protoNameJoin(ns, enumeration.getName()!)}`;
        const pathToThis = `${path}/${enumsFieldNum}/${i}`;
        onRecord(`.${name}`, enumeration, pathToThis);
    }
}

export function getFileContext(infile: FileDescriptorProto): FileContext {
    return {path: infile.getName()!, pkg: infile.getPackage(), comments: getComments(infile)}    
}

export function buildDeclarationsMap(files: FileDescriptorProto[]): Map<string, FileContext> {
    const imports: ImportContext = new Map<string, FileContext>();
    for (const file of files) {
        const path = file.getName();
        const comments = getComments(file);
        if (!path)
            continue;
        const pkg = file.getPackage();
        recurseTypes(pkg, file.getMessageTypeList(), file.getEnumTypeList(), (name) => {
            imports.set(name, {pkg, path, comments});
        }, 4, 5, "")
    }
    return imports
}
