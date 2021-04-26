import { FieldOptions, EnumOptions, EnumValueDescriptorProto, MessageOptions, OneofDescriptorProto, FieldDescriptorProto, FileDescriptorProto, EnumDescriptorProto, DescriptorProto } from "./google/protobuf/descriptor.proto.gen"
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
    readonly name?: string,
    readonly number?: number,
    readonly label?: FieldDescriptorProto.Label,
    readonly type?: FieldDescriptorProto.Type,
    readonly typeName: string,
    readonly extendee?: string,
    readonly defaultValue?: string,
    readonly oneofIndex?: number,
    readonly jsonName?: string,
    readonly options?: FieldOptions.Strict,
    readonly path: string,
    readonly comments: string | undefined,
    readonly proto3Optional: boolean,
};

export type MessageDef = {
    readonly type: "message",
    readonly name?: string,
    readonly extensions: readonly FieldDescriptorProto.Strict[],
    readonly extensionRanges: readonly DescriptorProto.ExtensionRange.Strict[],
    readonly oneofDecls: readonly OneofDescriptorProto.Strict[],
    readonly options?: MessageOptions.Strict,
    readonly reservedRanges: readonly DescriptorProto.ReservedRange.Strict[],
    readonly reservedNames: readonly string[],
    readonly path: string,
    readonly nestedTypes: readonly MessageDef[],
    readonly enumTypes: readonly EnumDef[],
    readonly fields: readonly FieldDef[]
    readonly fqName: string,
    readonly comments: string | undefined,
    readonly mapTypes: readonly MessageDef[],
};

export type EnumDef = {
    readonly type: "enum",
    readonly name?: string,
    readonly values: readonly EnumValueDescriptorProto.Strict[],
    readonly options?: EnumOptions.Strict,
    readonly reservedRanges: readonly EnumDescriptorProto.EnumReservedRange.Strict[],
    readonly reservedNames: readonly string[],
    readonly path: string
    readonly fqName: string,
    readonly comments: string | undefined,
};

export function toMessageDefs(ns: string | undefined, list: DescriptorProto.Strict[], path: string, listField: number, comments: ReadonlyMap<string, string>): MessageDef[] {
    const context = `${path}/${listField}`;
    return list.map<MessageDef>((nested, i) => ({
        name: nested.name,
        extensions: nested.extensions,
        extensionRanges: nested.extensionRanges,
        oneofDecls: nested.oneofDecls.filter((decl, i) => nested.fields.some(f => f.oneofIndex == i && !f.proto3Optional)),
        options: nested.options,
        reservedRanges: nested.reservedRanges,
        reservedNames: nested.reservedNames,
        type: "message",
        fqName: `.${protoNameJoin(ns, nested.name)}`,
        path: `${context}/${i}`,
        nestedTypes: toMessageDefs(`.${protoNameJoin(ns, nested.name)}`, nested.nestedTypes.filter(not(isMapType)), `${context}/${i}`, 3, comments),
        mapTypes: toMessageDefs(`.${protoNameJoin(ns, nested.name)}`, nested.nestedTypes.filter(isMapType), `${context}/${i}`, 3, comments),
        enumTypes: toEnumDefs(protoNameJoin(ns, nested.name), nested.enumTypes, `${context}/${i}`, 4, comments),
        fields: toFieldDefs(nested.fields, `${context}/${i}`, 2, comments),
        comments: comments.get(`${context}/${i}`),
    }))
}

export function toEnumDefs(ns: string | undefined, list: EnumDescriptorProto.Strict[], path: string, listField: number, comments: ReadonlyMap<string, string>): EnumDef[] {
    const context = `${path}/${listField}`;
    return list.map<EnumDef>((nested, i) => ({
        name: nested.name,
        options: nested.options,
        values: nested.values,
        reservedRanges: nested.reservedRanges,
        reservedNames: nested.reservedNames,
        type: "enum",
        fqName: `.${protoNameJoin(ns, nested.name)}`,
        path: `${context}/${i}`,
        comments: comments.get(`${context}/${i}`),
    }))
}

export function toFieldDefs(list: FieldDescriptorProto.Strict[], path: string, listField: number, comments: ReadonlyMap<string, string>): FieldDef[] {
    const context = `${path}/${listField}`;
    return list.map<FieldDef>((field, i) => ({
        name: field.name,
        number: field.number,
        label: field.label,
        type: field.type,
        typeName: field.typeName,
        extendee: field.extendee,
        defaultValue: field.defaultValue,
        oneofIndex: (!field.proto3Optional && field.oneofIndex !== undefined) ? field.oneofIndex : undefined,
        proto3Optional: field.proto3Optional,
        jsonName: field.jsonName,
        options: field.options,
        path: `${context}/${i}`,
        comments: comments.get(`${context}/${i}`),
    }))
}

function isMapType(m: DescriptorProto.Strict): boolean {
    return m.options?.mapEntry === true;
}

function getComments(file: FileDescriptorProto.Strict): ReadonlyMap<string, string> {
    const comments = new Map<string, string>();
    for (const location of file.sourceCodeInfo?.location || []) {
        const path = location.paths.map(s => `/${s}`).join("");
        const leadingComments = location.leadingComments.trim();
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

export function getSurrogates(files: FileDescriptorProto.Strict[]): ReadonlyMap<string, string> {
    const types = new Map<string, string>();
    for (const file of files) {
        const comments = getComments(file);
        recurseTypes(file.package, file.messageTypes, file.enumTypes, (name, type, path) => {
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

function recurseTypes(ns: string | undefined, msgs: DescriptorProto.Strict[], enums: EnumDescriptorProto.Strict[], onRecord: (name: string, type: DescriptorProto.Strict | EnumDescriptorProto.Strict, path: string) => void, messagesFieldNum: number, enumsFieldNum: number, path: string) {
    for (let i = 0; i < msgs.length; i++) {
        const message = msgs[i];
        const name = `${protoNameJoin(ns, message.name)}`;
        const pathToThis = `${path}/${messagesFieldNum}/${i}`;
        onRecord(`.${name}`, message, pathToThis);
        recurseTypes(name, message.nestedTypes, message.enumTypes, onRecord, 3, 4, pathToThis);
    }
    for (let i = 0; i < enums.length; i++) {
        const enumeration = enums[i];
        const name = `${protoNameJoin(ns, enumeration.name)}`;
        const pathToThis = `${path}/${enumsFieldNum}/${i}`;
        onRecord(`.${name}`, enumeration, pathToThis);
    }
}

export function getFileContext(infile: FileDescriptorProto.Strict): FileContext {
    return {path: infile.name, pkg: infile.package, comments: getComments(infile)}    
}

export function buildDeclarationsMap(files: FileDescriptorProto.Strict[]): Map<string, FileContext> {
    const imports: ImportContext = new Map<string, FileContext>();
    for (const file of files) {
        const path = file.name;
        const comments = getComments(file);
        if (!path)
            continue;
        const pkg = file.package;
        recurseTypes(pkg, file.messageTypes, file.enumTypes, (name) => {
            imports.set(name, {pkg, path, comments});
        }, 4, 5, "")
    }
    return imports
}
