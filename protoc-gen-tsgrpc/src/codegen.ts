import {CodeGeneratorRequest, CodeGeneratorResponse, FileDescriptorProto, EnumDescriptorProto, DescriptorProto, FieldDescriptorProto, ServiceDescriptorProto, MethodDescriptorProto, FieldOptions, OneofDescriptorProto, MessageOptions, EnumValueDescriptorProto, EnumOptions} from "protoc-plugin";
import {pascalCase, camelCase} from "change-case";
import {assertNever} from "assert-never";
import {relative, dirname, join} from "path";

type FileContext = {
    path: string,
    pkg: string | undefined,
    comments: ReadonlyMap<string, string>,
}

type ImportContext = Map<string, FileContext>;

export function runPlugin(request: CodeGeneratorRequest): CodeGeneratorResponse {
    const response = new CodeGeneratorResponse();

    const paramString = request.getParameter() || "";
    const parameters = paramString
        .split(/,/)
        .map(kv => kv.split(/=/, 2))
        .reduce((a, v) => { a.set(v[0], v[1] || ""); return a; }, new Map<string, string>());

    const protoFileList = request
        .getProtoFileList();

    const genJson = parameters.get("json") !== undefined;

    // handle surrogates
    const surrogates = getSurrogates(protoFileList);
    
    // build a map of identifiers to the files that define them
    // because to import these we need to import to a variable
    // and then use that variable to access the external identifier
    // so we need to know which imported file declared the identifier we're using
    const imports = buildDeclarationsMap(protoFileList);

    for (const infile of request.getProtoFileList()) {
        const name = infile.getName();
        
        const outfile = new CodeGeneratorResponse.File;
        outfile.setName(`${name}.gen.ts`);
        const codeFrag = renderProtoFile(infile, imports, surrogates);
        const content = codeNodeToString(codeFrag);
        outfile.setContent(content);
        response.getFileList().push(outfile);

        if (genJson) {
            // Dump out some helpful json
            const outjson = new CodeGeneratorResponse.File;
            outjson.setName(`${name}.gen.json`);
            outjson.setContent(JSON.stringify(infile.toObject(), null, 4));
            response.getFileList().push(outjson);
        }
    }

    return response;
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

function getCommentFlags(comment: string): readonly CommentFlag[] {
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

function getSurrogates(files: FileDescriptorProto[]): ReadonlyMap<string, string> {
    const types = new Map<string, string>();
    for (const file of files) {
        const comments = getComments(file);
        recurseTypes(file.getPackage(), file.getMessageTypeList(), file.getEnumTypeList(), (name, type, path) => {
            const comment = comments.get(path);
            if (!comment)
                return;
            const commentFlags = getCommentFlags(comment);
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

function isTruthy<T>(v: T | undefined | null): v is T {return !!v};

function protoNameJoin(...parts: (string | undefined | null)[]): string {
    return parts
        .filter(isTruthy)
        .map(s => s.replace(/^\./, "").replace(/\.$/, ""))
        .filter(isTruthy)
        .join('.')
}

function protoNameUnqualified(name: string) {
    return name.split(/\./).slice(-1)[0];
}

function codeNodeToString(node: CodeNode, indentStr: string = "    ", indent: number = 0): string {
    if (Array.isArray(node)) {
        // code fragment
        // return string at current indent
        return node.map(line => codeNodeToString(line, indentStr, indent)).join("");
    }
    else if (typeof node === "object") {
        // code block
        // indent the specified amount and process code node
        return codeNodeToString(node.indent, indentStr, indent + 1);
    }
    else {
        // string
        return node === "" ? "\n" : `${indentStr.repeat(indent)}${node}${"\n"}`
    }
}


export type CodeNode = CodeBlock | CodeFrag | CodeLine;

export type CodeFrag = CodeNode[];

export type CodeLine = string;

export type CodeBlock = {indent: CodeNode}

function enumValJsName(enumName: string, valName: string): string {
    const pascalName = pascalCase(valName);
    const prefix = pascalCase(enumName);
    return pascalName?.startsWith(prefix) ? pascalName.slice(prefix.length) : pascalName;
}

function block(...contents: CodeNode[]) { return {indent: contents} };

type EnumValueInfo = {
    jsName: string,
    number: number,
}

function getEnumValues(enumJsName: string, e: EnumDef): EnumValueInfo[] {
    const values = e.valueList.map(v => ({
        jsName: enumValJsName(enumJsName || "", v.name || ""),
        number: v.number!,
    }))
    // add a 0 if there isn't one already
    // this is the current strategy to handle the situation where we are importing from a proto2 as is the case with descriptor.proto
    return values.some(v => v.number === 0) ? values : [{jsName: "Unspecified", number: 0}, ...values];
}

function renderEnumTypeDecl(e: EnumDef, ns: string | undefined): CodeFrag {
    const enumJsName = e.name || "";
    const values = getEnumValues(enumJsName, e);
    return [
        ``,
        `export namespace ${enumJsName} {`,
        block(
            `export type ProtoName = "${protoNameJoin(ns, e.name)}"`,
            `export type Def = {`,
            block(
                values.map(({jsName, number}) => ([
                    `"${jsName}": ${number},`,
                ]))
            ),
            `}`,
            ``,
            values.map(({jsName}) => `export type ${jsName} = E.Value<ProtoName, Def, "${jsName}">`),
            ``,
            `export type Value = E.EnumValue<ProtoName, E.Literal<Def>> | E.Literal<Def>;`,
        ),
        `}`,
        `export type ${enumJsName} = ${enumJsName}.Value;`,
    ];
}

function renderEnumDef(e: EnumDef, context: Context): CodeFrag {
    const enumJsName = e.name || "";
    const values = getEnumValues(enumJsName, e);
    const relname = nsRelative(e.fqName, context.name);
    return [
        ``,
        `E.define(${relname}, {`,
        block(
            values.map(({jsName, number}) => ([
                `"${jsName}": ${number},`,
            ]))
        ),
        `});`,
    ];
}

function nsRelative(name: string, nameContext: string | undefined) {
    const nameSegs = name.replace(/^\./, '').split('.');
    const ctxSegs = (nameContext || "").replace(/^\./, '').split('.');
    let i: number;
    for (i = 0; i < (nameSegs.length - 1) && i < ctxSegs.length && nameSegs[i] === ctxSegs[i]; i++) ;
    return nameSegs.slice(i).join(".");
}

type FieldTypeInfo = BuiltInFieldType | CustomFieldType
type BuiltInFieldType = {
    builtin: true,
    packed: boolean,
    proto: "int32" | "double" | "float" | "int64" | "uint64" | "fixed64" | "fixed32" | "bool" | "string" | "bytes" | "uint32" | "sfixed32" | "sfixed64" | "sint32" | "sint64",
    strict: string,
    loose: string,
    defaultRep?: "decimal" | "hex" | "decimalpad" | "hexpad",
}
type CustomFieldType = {
    builtin: false,
    packed: boolean,
    proto: string,
    nullable: boolean,
    toJsType: ProtoTypeNameToTsTranslator,
    wrap: "enumeration" | "message"
}

type ProtoTypeNameToTsTranslator = (protoType: string, strict?: boolean) => string;

type MapType = {
    name: string,
    key: FieldDef,
    value: FieldDef,
}

type Context = {
    readonly imports: ImportContext,
    readonly surrogates: ReadonlyMap<string, string>,
    readonly file: FileContext,
    readonly name: string | undefined,
    lookupType(name: string): MessageDef | EnumDef | undefined,
}

function isRepeatedField(field: FieldDef): boolean {
    return field.label === 3;
}

function getMapType(field: FieldDef, lookupMapType: (typename: string) => MapType | undefined) {
    return lookupMapType(field.typeName!);
}

function protoCustomTypeToJs(protoTypeName: string) {
    return protoTypeName.replace(/^\./, "");
}

function protoMessageTypeToJs(protoTypeName: string, strict?: boolean) {
    return `${protoCustomTypeToJs(protoTypeName)}${(strict === undefined ? "" : strict ? ".Strict" : ".Value")}`;
}

function protoEnumTypeToJs(protoTypeName: string, strict?: boolean) {
    const jsType = protoCustomTypeToJs(protoTypeName);
    return strict === false ? `${jsType}.Value` : jsType;
}

function tsField(protoTypeName: string, protoFieldName: string, protoFieldNumber: number, jsFieldName: string, jsTypeName: string, optional: boolean) {
    return [
        `// ${protoTypeName} ${protoFieldName} = ${protoFieldNumber};`,
        `readonly ${jsFieldName}${(optional ? "?" : "")}: ${jsTypeName},`,
    ]
}

function renderMessageFieldTypeDecl(strict: boolean, field: FieldDef, context: Context, lookupMapType: (typename: string) => MapType | undefined) {
    const protoFieldName = field.name!;
    const jsFieldName = `${camelCase(protoFieldName)}`;
    const protoFieldNumber = field.number!;
    const type = fieldTypeInfo(field);
    const mapType = getMapType(field, lookupMapType);
    const isRepeated = !mapType && isRepeatedField(field);
    const optional = !strict;
    if (mapType) {
        const valtype = fieldTypeInfo(mapType.value);
        const keytype = fieldTypeInfo(mapType.key);
        if (!keytype.builtin)
            throw new Error(`Illegal map key type ${keytype.proto}`);
        const protoValTypeRelative = valtype.builtin ? valtype.proto : nsRelative(valtype.proto, context.name);
        const protoKeyType = keytype.proto;
        const protoTypeName = `map<${protoKeyType}, ${protoValTypeRelative}>`;
        const jsValTypeName = valtype.builtin ? (strict ? valtype.strict : valtype.loose) : jsIdentifierForProtoType(valtype, context, strict);
        const jsStrictMap = `{ ${(keytype.proto === "bool" ? `[key in "true" | "false"]?` : `[key: string]`)}: ${jsValTypeName} }`;
        const jsLooseMap = `Map<${keytype.loose}, ${jsValTypeName}> | ${jsStrictMap}`
        const jsTypeName = strict ? jsStrictMap : jsLooseMap;
        return tsField(protoTypeName, protoFieldName, protoFieldNumber, jsFieldName, jsTypeName, optional);
    }
    else {
        const protoRelative = type.builtin ? type.proto : nsRelative(type.proto, context.name)
        const protoTypeName = `${(isRepeated ? "repeated " : "")}${protoRelative}`;
        const jsElementTypeName = type.builtin ? (strict ? type.strict : type.loose) : jsIdentifierForProtoType(type, context, strict);
        const isSurrogate = context.surrogates.has(type.proto);
        const jsTypeName = `${jsElementTypeName}${isRepeated ? '[]' : (!type.builtin && type.nullable && strict && !isSurrogate) ? ' | undefined' : ''}`
        return tsField(protoTypeName, protoFieldName, protoFieldNumber, jsFieldName, jsTypeName, optional);
    }
}

function jsIdentifierForProtoType(type: FieldTypeInfo, context: Context, strict?: boolean) {
    if (type.builtin)
        return type.proto;
    return jsIdentifierForCustomType(type.proto, type.toJsType, context, strict);
}

function jsIdentifierForCustomType(protoType: string, toJsType: ProtoTypeNameToTsTranslator, {imports, surrogates, file, name}: Context, strict?: boolean) {
    const importContext = imports.get(protoType);
    const surrogate = surrogates.get(protoType);
    if (surrogate) {
        return (
            strict === true ? `ReturnType<typeof Surrogates.${surrogate}.readValue>` :
            strict === false ? `Parameters<typeof Surrogates.${surrogate}.writeValue>[1]` :
            `Surrogates.${surrogate}`
        )
    }
    // is the identifier in the current file?
    if (!importContext || importContext.path === file.path)
        return toJsType(nsRelative(protoType, name), strict);
    // the identifier was imported so we need an import reference
    return `${importNameFor(importContext.path)}.${toJsType(nsRelative(protoType, importContext.pkg || ""), strict)}`;
}

function renderOneofFieldTypeDecl(strict: boolean, oneofName: string, field: FieldDef, context: Context) {
    const protoFieldName = field.name!;
    const jsFieldName = `${camelCase(protoFieldName)}`;
    const type = fieldTypeInfo(field);
    const protoRelative = type.builtin ? type.proto : nsRelative(type.proto, context.name);
    const protoTypeName = `${protoRelative}`;
    const surrogate = context.surrogates.get(type.proto);
    const jsElementTypeName = type.builtin ? (strict ? type.strict : type.loose) : (jsIdentifierForProtoType(type, context, strict));
    const isSurrogate = context.surrogates.has(type.proto);
    const jsTypeName = `${jsElementTypeName}${(!type.builtin && type.nullable && strict && !isSurrogate) ? ' | undefined' : !strict ? ' | undefined' : ''}`
    const caseDecl = strict ? `${camelCase(oneofName)}Case: "${jsFieldName}", ` : ``;
    return [
        `// ${protoTypeName} ${protoFieldName} = ${field.number};`,
        `| { ${caseDecl}${jsFieldName}: ${jsTypeName} }`,
    ]    
}

function renderOneofTypeDecl(strict: boolean, oneof: OneofInfo, context: Context) {
    const caseDecl = strict ? ` ${oneof.name}Case: "" ` : ``;
    return [
        ``,
        `type ${pascalCase(oneof.name)}${strict ? "Strict" : "Loose"} = {${caseDecl}}`,
        block(
            oneof.fields.map(field => renderOneofFieldTypeDecl(strict, oneof.name, field, context))
        ),
    ]    
}

function fieldWrite(writer: string, jsFieldName: string, protoFieldNumber: number, ...args: string[]): CodeLine {
    return `${writer}(w, ${args.map(a => `${a}, `).join("")}msg.${jsFieldName}, ${protoFieldNumber});`
}

function builtInName(type: BuiltInFieldType, representationVariation: string | undefined) {
    const variation =
        representationVariation !== undefined ? representationVariation :
        type.defaultRep !== undefined ? type.defaultRep :
        "";
    return `${type.proto}${variation}`;
}

function getTypeWriter(type: FieldTypeInfo, context: Context, representationVariation: string | undefined): string {
    return type.builtin ? `W.${builtInName(type, representationVariation)}` : `${jsIdentifierForProtoType(type, context)}.write`
}

function getTypeReader(type: FieldTypeInfo, context: Context, representationVariation: string | undefined): string {
    return type.builtin ? `F.${builtInName(type, representationVariation)}` : `() => ${jsIdentifierForProtoType(type, context)}`
}

function getRepresentationVariation(path: string, comments: ReadonlyMap<string, string>): string | undefined {
    const comment = comments.get(path);
    if (!comment)
        return undefined;
    const flags = getCommentFlags(comment);
    const flag = flags.find(f => f.name === "representation");
    return flag?.args;
}

function renderMessageFieldWrite(field: FieldDef, context: Context, lookupMapType: (typename: string) => MapType | undefined): CodeLine {
    const protoFieldName = field.name!;
    const jsFieldName = `${camelCase(protoFieldName)}`;
    const protoFieldNumber = field.number!;
    const type = fieldTypeInfo(field);
    const mapType = getMapType(field, lookupMapType);
    const isRepeated = !mapType && isRepeatedField(field);
    const representationVariation = getRepresentationVariation(field.path, context.file.comments);
    if (mapType) {
        const valtype = fieldTypeInfo(mapType.value);
        const keytype = fieldTypeInfo(mapType.key);
        const valwriter = getTypeWriter(valtype, context, representationVariation);
        if (!keytype.builtin)
            throw new Error(`Illegal map key type ${keytype.proto}`);
        const keyTypeName = builtInName(keytype, representationVariation);
        return fieldWrite(`W.map`, jsFieldName, protoFieldNumber, `W.${keyTypeName}`, `KC.${keyTypeName}`, valwriter);
    }
    const valueWriter = getTypeWriter(type, context, representationVariation);
    if (isRepeated) {
        return fieldWrite(`W.${type.packed ? "packed" : "repeated"}`, jsFieldName, protoFieldNumber, valueWriter);
    }
    else {
        return fieldWrite(valueWriter, jsFieldName, protoFieldNumber);
    }
}

function renderOneofFieldsWrite(oneof: OneofInfo, context: Context) {
    return oneof.fields.map((field, index) => renderOneofFieldWrite(field, index, context))
}

function renderOneofFieldWrite(field: FieldDef, index: number, context: Context) {
    // TODO: the code generated by this might be inefficient for large oneofs; consider and benchmark other methods for large oneofs
    const protoFieldName = field.name!;
    const jsFieldName = `${camelCase(protoFieldName)}`;
    return `${(index === 0) ? "if" : "else if"} ("${jsFieldName}" in msg) { ${renderMessageFieldWrite(field, context, () => undefined)} }`
}

function renderMessageFieldRead(field: FieldDef, context: Context, lookupMapType: (typename: string) => MapType | undefined, lookupOneofName: (index: number) => string | undefined) {
    const protoFieldName = field.name!;
    const jsFieldName = `${camelCase(protoFieldName)}`;
    const protoFieldNumber = field.number!;
    const type = fieldTypeInfo(field);
    const map = getMapType(field, lookupMapType);
    const oneof = field.oneofIndex !== undefined ? lookupOneofName(field.oneofIndex) : undefined;
    const isRepeated = !map && isRepeatedField(field);
    const representationVariation = getRepresentationVariation(field.path, context.file.comments);
    if (map) {
        const valtype = fieldTypeInfo(map.value);
        const keytype = fieldTypeInfo(map.key);
        const valueReader = getTypeReader(valtype, context, representationVariation);
        const keyReader = getTypeReader(keytype, context, representationVariation);
        return `[${protoFieldNumber}, "${jsFieldName}", F.map(${keyReader}, ${valueReader})],`;
    }
    else {
        const valueReader = getTypeReader(type, context, representationVariation);
        const reader = oneof ? `F.oneof("${oneof}", ${valueReader})` : isRepeated ? `F.repeated(${valueReader})` : valueReader;
        return `[${protoFieldNumber}, "${jsFieldName}", ${reader}],`
    }
}

function fieldTypeInfo(field: FieldDef): FieldTypeInfo {
    const fieldType = field.type;
    switch (fieldType) {
        case 1: return {
            packed: true,
            builtin: true,
            proto: `double`,
            strict: `number`,
            loose: `number`,
        };
        case 2: return {
            packed: true,
            builtin: true,
            proto: `float`,
            strict: `number`,
            loose: `number`,
        };
        case 3: return {
            packed: true,
            builtin: true,
            proto: `int64`,
            strict: `string`,
            loose: `(string | number)`,
            defaultRep: `decimal`,
        };
        case 4: return {
            packed: true,
            builtin: true,
            proto: `uint64`,
            strict: `string`,
            loose: `(string | number)`,
            defaultRep: `decimal`,
        };
        case 5: return {
            packed: true,
            builtin: true,
            proto: `int32`,
            strict: `number`,
            loose: `number`,
        };
        case 6: return {
            packed: true,
            builtin: true,
            proto: `fixed64`,
            strict: `string`,
            loose: `(string | number)`,
            defaultRep: `decimal`,
        };
        case 7: return {
            packed: true,
            builtin: true,
            proto: `fixed32`,
            strict: `number`,
            loose: `number`,
        };
        case 8: return {
            packed: true,
            builtin: true,
            proto: `bool`,
            strict: `boolean`,
            loose: `boolean`,
        };
        case 9: return {
            packed: false,
            builtin: true,
            proto: `string`,
            strict: `string`,
            loose: `string`,
        };
        case 11: return {
            packed: false,
            builtin: false,
            proto: field.typeName!,
            nullable: true,
            toJsType: protoMessageTypeToJs,
            wrap: "message",
        };
        case 12: return {
            packed: false,
            builtin: true,
            proto: `bytes`,
            strict: `ArrayBuffer`,
            loose: `ArrayBuffer`,
        };
        case 13: return {
            packed: true,
            builtin: true,
            proto: `uint32`,
            strict: `number`,
            loose: `number`,
        };
        case 14: return {
            packed: true,
            builtin: false,
            proto: field.typeName!,
            nullable: false,
            toJsType: protoEnumTypeToJs,
            wrap: "enumeration",
        };
        case 15: return {
            packed: true,
            builtin: true,
            proto: `sfixed32`,
            strict: `number`,
            loose: `number`,
        };
        case 16: return {
            packed: true,
            builtin: true,
            proto: `sfixed64`,
            strict: `string`,
            loose: `(string | number)`,
            defaultRep: `decimal`,
        };
        case 17: return {
            packed: true,
            builtin: true,
            proto: `sint32`,
            strict: `number`,
            loose: `number`,
        };
        case 18: return {
            packed: true,
            builtin: true,
            proto: `sint64`,
            strict: `string`,
            loose: `(string | number)`,
            defaultRep: `decimal`,
        };
        default: {
            throw new Error(`Unimplemented field type code: ${fieldType}`)
        };
    }
}

function renderTypeDecls(enums: EnumDef[], messages: MessageDef[], context: Context): CodeFrag {
    return [
        enums.map((e, i) => renderEnumTypeDecl(e, context.name)),
        messages.map((m, i) => messageToTsTypeDecl(m, {...context, name: `${protoNameJoin(context.name, m.name || "")}`})),
    ]
}

interface OneofInfo {
    name: string,
    index: number,
    fields: FieldDef[],
}

type FieldDef = {
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
type MessageDef = {
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
type EnumDef = {
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

function isMapType(m: DescriptorProto.AsObject): boolean {
    return m.options?.mapEntry === true;
}

function not<T>(fn: (t: T) => boolean) {
    return (t: T) => !(fn(t));
}

function toMessageDefs(ns: string | undefined, list: DescriptorProto.AsObject[], path: string, listField: number, comments: ReadonlyMap<string, string>): MessageDef[] {
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

function toEnumDefs(ns: string | undefined, list: EnumDescriptorProto.AsObject[], path: string, listField: number, comments: ReadonlyMap<string, string>): EnumDef[] {
    const context = `${path}/${listField}`;
    return list.map<EnumDef>((nested, i) => ({
        ...nested,
        type: "enum",
        fqName: `.${protoNameJoin(ns, nested.name)}`,
        path: `${context}/${i}`,
        comments: comments.get(`${context}/${i}`),
    }))
}

function toFieldDefs(list: FieldDescriptorProto.AsObject[], path: string, listField: number, comments: ReadonlyMap<string, string>): FieldDef[] {
    const context = `${path}/${listField}`;
    return list.map<FieldDef>((field, i) => ({
        ...field,
        path: `${context}/${i}`,
        comments: comments.get(`${context}/${i}`),
    }))
}

function flatten(types: (MessageDef | EnumDef)[]): (MessageDef | EnumDef)[] {
    if (types.length == 0)
        return [];
    return types.flatMap(t => {
        if (t.type === "enum") {
            return [t];
        }
        else {
            const {nestedTypeList, enumTypeList} = t;
            return [t, ...enumTypeList, ...flatten(nestedTypeList)];
        }
    })
}

function renderTypeDef(t: MessageDef | EnumDef, context: Context) {
    return t.type === "message" ? renderMessageDefine(t, context) : renderEnumDef(t, context)
}

function renderTypeDefines(t: (MessageDef | EnumDef)[], context: Context) {
    const flattened = flatten(t);
    return flattened.map(nt => renderTypeDef(nt, context));
}

function renderMessageDefine(m: MessageDef, context: Context): CodeFrag {
    const mapTypes = m.mapTypeList
        .map<MapType>(nt => ({
            name: nt.fqName,
            key: nt.fieldList.find(kf => kf.number === 1)!,
            value: nt.fieldList.find(vf => vf.number === 2)!,
        }))
    const fields = m.fieldList.map<FieldDef>((field, i) => ({...field, path: `${m.path}/2/${i}`}));
    const oneofs = m.oneofDeclList
        .map(odl => odl.name!)
        .map<OneofInfo>((name, index) => ({
            name,
            index,
            fields: fields.filter(f => f.oneofIndex === index)
        }))
    const getMapType = (name: string) => mapTypes.find(mt => name === mt.name);
    const getOneofName = (index: number) => oneofs[index]?.name;
    const nonOneOfFields = fields
        .filter(f => f.oneofIndex === undefined)
        //.map(f => fieldDef(f, fqName, ))
    const relname = nsRelative(m.fqName, context.name);
    return [
        ``,
        `M.define(${relname}, {`,
        block([
            `writeContents: (w, msg) => {`,
            block([
                nonOneOfFields
                .map(field => renderMessageFieldWrite(field, context, getMapType)),
            ]),
            block([
                oneofs
                .map(oneof => renderOneofFieldsWrite(oneof, context))
            ]),
            `},`,
            `fields: [`,
            block([
                fields
                .map(field => renderMessageFieldRead(field, context, getMapType, getOneofName)),
            ]),
            `],`,
        ]),
        `})`,
    ];
}

function renderProperty(name: string, code: CodeLine | CodeFrag): CodeFrag {
    const frag = typeof code === "string" ? [code] : code;
    return (
        frag.length === 0 ? [] :
        frag.length === 1 ? [`${name}: ${frag[0]},`] :
        [`${name}: ${frag[0]}`, ...frag.slice(1, frag.length - 1), `${frag[frag.length - 1]},`]
    )
}

function renderPlaceholderType(t: EnumDef | MessageDef, context: Context, top: boolean): CodeFrag {
    return t.type === "message" ? renderMessagePlaceholderType(t, context, top) : renderEnumPlaceholderType(t, context, top)
}

function renderEnumPlaceholderType(e: EnumDef, context: Context, top: boolean): CodeFrag {
    const relname = nsRelative(e.fqName, context.name);
    const typeDef = [`E.EnumDef<${relname}.ProtoName, ${relname}.Def>`];
    return top ? typeDef : renderProperty(e.name!, typeDef);
}

function renderMessagePlaceholderType(m: MessageDef, context: Context, top: boolean): CodeFrag {
    const relname = nsRelative(m.fqName, context.name);
    const thisMsg = `M.MessageDef<${relname}.Strict, ${relname}.Value>`;
    const nestedTypes = [...m.enumTypeList, ...m.nestedTypeList];

    const typeDef = (nestedTypes.length === 0)
        ? [thisMsg]
        : [
            `${thisMsg} & {`,
            block([
                nestedTypes.map(nt => renderPlaceholderType(nt, context, false))
            ]),
            `}`,
        ]
    
    return top ? typeDef : renderProperty(m.name!, typeDef);
}

function renderPlaceholders(types: (EnumDef | MessageDef)[], context: Context, top: boolean): CodeFrag {
    return types.map(t => renderPlaceholder(t, context, top));
}

function renderPlaceholder(t: EnumDef | MessageDef, context: Context, top: boolean): CodeFrag {
    const nestedTypes = t.type === "enum" ? [] :
        [...t.enumTypeList, ...t.nestedTypeList];
    
    const nestedPlaceholders = renderPlaceholders(nestedTypes, context, false);

    return top
        ? [
            ``,
            `export const ${t.name} = {`,
            block(nestedPlaceholders),
            `} as unknown as`,
            block(renderPlaceholderType(t, context, top)),
        ]
        : nestedPlaceholders.length === 0 ? [`${t.name}: {},`] : [
            `${t.name}: {`,
            block(nestedPlaceholders),
            `},`,
        ]
}

function messageToTsTypeDecl(m: MessageDef, context: Context): CodeFrag {
    const nestedEnums = m.enumTypeList.map<EnumDef>((nested, i) => ({...nested, path: `${m.path}/4/${i}`}));
    const mapTypes = m.mapTypeList
        .map<MapType>(nt => ({
            name: nt.fqName,
            key: nt.fieldList.find(kf => kf.number === 1)!,
            value: nt.fieldList.find(vf => vf.number === 2)!,
        }))
    const fields = m.fieldList.map<FieldDef>((field, i) => ({...field, path: `${m.path}/2/${i}`}));
    const oneofs = m.oneofDeclList
        .map(odl => odl.name!)
        .map<OneofInfo>((name, index) => ({
            name,
            index,
            fields: fields.filter(f => f.oneofIndex === index)
        }))
    const getMapType = (name: string) => mapTypes.find(mt => name === mt.name);
    const getOneofName = (index: number) => oneofs[index]?.name;
    const nonOneOfFields = fields
        .filter(f => f.oneofIndex === undefined)
    const nestedMessages = m.nestedTypeList;

    return [
        ``,
        `export namespace ${m.name} {`,
        block([
            `export type ProtoName = "${context.name}";`,
            oneofs.map(oneof => renderOneofTypeDecl(true, oneof, context)),
            ``,
            `export type Strict = {`,
            block([
                nonOneOfFields
                .map(field => renderMessageFieldTypeDecl(true, field, context, getMapType)),
            ]),
            `}${oneofs.map(oo => ` & ${pascalCase(oo.name)}Strict`)}`,
            oneofs.map(oneof => renderOneofTypeDecl(false, oneof, context)),
            ``,
            `export type Loose = {`,
            block([
                nonOneOfFields
                .map(field => renderMessageFieldTypeDecl(false, field, context, getMapType)),
            ]),
            `}${oneofs.map(oo => ` & ${pascalCase(oo.name)}Loose`)}`,
            ``,
            `export type Value = Strict | Loose;`,
            renderTypeDecls(nestedEnums, nestedMessages, context),
        ]),
        `}`,
    ]
}

function importNameFor(path: string) {
    return camelCase(path.replace(/[\-\/\.]/, "_"));
}

function protoPathToTsImportPath(path: string) {
    return `${path.replace(/\.proto$/, ".proto.gen")}`;
}

function rooted(path: string) {
    return join(`/${path}`)
}

function importRelative(target: string, fromContext: string) {
    const rel = relative(dirname(rooted(fromContext)), rooted(target));
    return rel.startsWith('.') ? rel : `./${rel}`;
}

function renderImports(depPath: string, fromProtoPath: string) {
    const relPath = importRelative(depPath, fromProtoPath);
    return `import * as ${importNameFor(depPath)} from "${protoPathToTsImportPath(relPath)}"`
}

function getMethodType(clientStreaming: boolean, serverStreaming: boolean): "unary" | "client-streaming" | "server-streaming" | "bidirectional" {
    return clientStreaming ? (serverStreaming ? "bidirectional" : "client-streaming") : (serverStreaming ? "server-streaming" : "unary");
}

function getMethodInfo(method: MethodDescriptorProto, context: Context) {
    const methodName = method.getName()!;
    const requestJsName = jsIdentifierForCustomType(method.getInputType()!, protoMessageTypeToJs, context);
    const responseJsName = jsIdentifierForCustomType(method.getOutputType()!, protoMessageTypeToJs, context);
    const reducer = detectReducer(method, context);
    return {methodName, requestJsName, responseJsName, reducer};
}

function unaryMethodToTs(serviceFqName: string, method: MethodDescriptorProto, context: Context): CodeFrag {
    const {methodName, requestJsName, responseJsName} = getMethodInfo(method, context);
    return [
        ``,
        `methodInfo${pascalCase(methodName)} = new grpcWeb.AbstractClientBase.MethodInfo<${requestJsName}.Value, ${responseJsName}.Strict>(`,
        `    H.noconstructor,`,
        `    H.makeEncoder(${requestJsName}.writeValue),`,
        `    H.makeDecoder(${responseJsName}.readValue)`,
        `);`,
        ``,
        `${camelCase(methodName)}(request: Parameters<typeof ${requestJsName}.writeValue>[1], metadata: grpcWeb.Metadata | null): Promise<${responseJsName}.Strict>;`,
        `${camelCase(methodName)}(request: Parameters<typeof ${requestJsName}.writeValue>[1], metadata: grpcWeb.Metadata | null, callback: (err: grpcWeb.Error, response: ${responseJsName}.Strict) => void): grpcWeb.ClientReadableStream<${responseJsName}.Strict>;`,
        `${camelCase(methodName)}(request: Parameters<typeof ${requestJsName}.writeValue>[1], metadata: grpcWeb.Metadata | null, callback?: (err: grpcWeb.Error, response: ${responseJsName}.Strict) => void) {`,
        `    if (callback !== undefined) {`,
        `        return this.client_.rpcCall(`,
        `            this.hostname_ + '/${serviceFqName}/${methodName}',`,
        `            request,`,
        `            metadata || {},`,
        `            this.methodInfo${pascalCase(methodName)},`,
        `            callback`,
        `        );`,
        `    }`,
        `    return this.client_.unaryCall(`,
        `        this.hostname_ + '/${serviceFqName}/${methodName}',`,
        `        request,`,
        `        metadata || {},`,
        `        this.methodInfo${pascalCase(methodName)}`,
        `    );`,
        `}`,
    ]
}

function serverStreamingMethodToTs(serviceFqName: string, method: MethodDescriptorProto, context: Context): CodeFrag {
    const {methodName, requestJsName, responseJsName} = getMethodInfo(method, context);
    return [
        ``,
        `methodInfo${pascalCase(methodName)} = new grpcWeb.AbstractClientBase.MethodInfo(`,
        `    H.noconstructor,`,
        `    H.makeEncoder(${requestJsName}.writeValue),`,
        `    H.makeDecoder(${responseJsName}.readValue)`,
        `);`,
        ``,
        `${camelCase(methodName)}(request: Parameters<typeof ${requestJsName}.writeValue>[1], metadata?: grpcWeb.Metadata): grpcWeb.ClientReadableStream<${responseJsName}.Strict> {`,
        `    return this.client_.serverStreaming(`,
        `        this.hostname_ + '/${serviceFqName}/${methodName}',`,
        `        request,`,
        `        metadata || {},`,
        `        this.methodInfo${pascalCase(methodName)}`,
        `    );`,
        `}`,
    ]
}

function methodToTs(serviceFqName: string, method: MethodDescriptorProto, context: Context): CodeFrag {
    const type = getMethodType(method.getClientStreaming() || false, method.getServerStreaming() || false);
    switch (type) {
        case "unary":
            return unaryMethodToTs(serviceFqName, method, context);
        case "server-streaming":
            return serverStreamingMethodToTs(serviceFqName, method, context);
        default:
            // nothing else is currently supported by the grpc-web protocol
            return []
    }
}

function detectReducer(method: MethodDescriptorProto, context: Context): "keepLast" | "keepAll" | "keepLastByKey" | string {
    /*
    // TODO: get comment flags for the method
    const comment = method.comment;
    if (comment) {
        const commentFlags = getCommentFlags(comment);
        const reducerFlag = commentFlags.find(cf => cf.name === "reducer");
        if (reducerFlag && "args" in reducerFlag && reducerFlag.args) {
            return reducerFlag.args;
        }
    }
    */
    if (method.getServerStreaming()) {
        const resultType = method.getOutputType()!;
        const type = context.lookupType(resultType);
        if (type && type.type === "message") {
            const is_subscription = type.fieldList.some(f => f.name === "subscription_state");
            if (is_subscription) {
                const records = type.fieldList.find(f => f.name === "records");
                if (records) {
                    const recordsTypeName = records.typeName;
                    const recordsType = recordsTypeName && context.lookupType(recordsTypeName);
                    if (recordsType && recordsType.type === "message" && recordsType.fieldList.length >= 2) {
                        const keyField = recordsType.fieldList.find(f => f.name === "key");
                        if (keyField) {
                            return "keepLastByKey";
                        }
                    }
                }
            }
        }
    }
    return "keepAll";
}

function methodToTsDef(serviceFqName: string, method: MethodDescriptorProto, context: Context): CodeFrag {
    const type = getMethodType(method.getClientStreaming() || false, method.getServerStreaming() || false);
    const {methodName, responseJsName, reducer} = getMethodInfo(method, context);
    switch (type) {
        case "unary":
            return [`export const ${pascalCase(methodName)} = {type: "${type}", client, method: prototype.${camelCase(methodName)}};`]
        case "server-streaming": {
            return [`export const ${pascalCase(methodName)} = {type: "${type}", client, method: prototype.${camelCase(methodName)}, reducer: () => Reducers.${reducer}<${responseJsName}.Strict>()};`]
        }
        default:
            // nothing else is currently supported by the grpc-web protocol
            return []
    }
}

function serviceToTs(svc: ServiceDescriptorProto, context: Context) {
    const serviceFqName = protoNameJoin(context.name, svc.getName()!);
    return [
        ``,
        `export class ${svc.getName()}Client {`,
        block([
            `client_: grpcWeb.AbstractClientBase;`,
            `hostname_: string;`,
            `credentials_: null | { [index: string]: string; };`,
            `options_: null | { [index: string]: string; };`,
            ``,
            `constructor (hostname: string, credentials?: null | { [index: string]: string; }, options?: null | { [index: string]: string; }) {`,
            `    if (!options)`,
            `        options = {};`,
            `    if (!credentials)`,
            `        credentials = {};`,
            `    options['format'] = 'text';`,
            ``,
            `    this.client_ = new grpcWeb.GrpcWebClientBase(options);`,
            `    this.hostname_ = hostname;`,
            `    this.credentials_ = credentials;`,
            `    this.options_ = options;`,
            `}`,
            svc.getMethodList().map(method => methodToTs(serviceFqName, method, context)),
        ]),
        `}`,
        ``,
        `export namespace ${svc.getName()} {`,
        block([
            `const client = ${svc.getName()}Client;`,
            `const {prototype} = client;`,
            svc.getMethodList().map(method => methodToTsDef(serviceFqName, method, context)),
        ]),
        `}`,
    ];
}

function findType(enums: EnumDef[], messages: MessageDef[], fqName: string): EnumDef | MessageDef | undefined {
    for (const e of enums) {
        if (e.fqName === fqName)
            return e;
    }
    for (const m of messages) {
        if (m.fqName === fqName)
            return m;
        const inNested = findType(m.enumTypeList, m.nestedTypeList, fqName);
        if (inNested)
            return inNested;
    }
    return undefined;
}

function renderProtoFile(infile: FileDescriptorProto, imports: ImportContext, surrogates: ReadonlyMap<string, string>): CodeFrag {
    const fileContext: FileContext = {path: infile.getName()!, pkg: infile.getPackage(), comments: getComments(infile)};
    const enums = toEnumDefs(fileContext.pkg, infile.getEnumTypeList().map(e => e.toObject()), "", 5, fileContext.comments);
    const messages = toMessageDefs(fileContext.pkg, infile.getMessageTypeList().map(m => m.toObject()), "", 4, fileContext.comments);
    const lookupType = (fqName: string) => findType(enums, messages, fqName);
    const context: Context = {imports, surrogates, file: fileContext, name: fileContext.pkg, lookupType}
    const depth = infile.getName()?.split(/\//)?.length! - 1;
    return [
        `/* istanbul ignore file */`,
        `/**`,
        ` * @fileoverview tsgrpc-generated client stub for ${fileContext.pkg} from ${fileContext.path}`,
        ` * @enhanceable`,
        ` * @public`,
        ` */`,
        ``,
        `// GENERATED CODE -- DO NOT EDIT!`,
        ``,
        `/* eslint-disable */`,
        `/* @ts-nocheck */`,
        ``,
        `import * as grpcWeb from "grpc-web";`,
        `import {Enums as E, Messages as M, WriteField as W, KeyConverters as KC, Helpers as H, Reader, FieldTypes as F, Reducers, Types as T} from "protobuf-codec-ts";`,
        infile.getDependencyList().map(d => renderImports(d, fileContext.path)),
        surrogates.size ? [`import * as Surrogates from "${depth === 0 ? "./" : "../".repeat(depth)}surrogates";`] : [],
        renderTypeDecls(enums, messages, context),
        renderPlaceholders([...enums, ...messages], context, true),
        renderTypeDefines([...enums, ...messages], context),
        infile.getServiceList().map(svc => serviceToTs(svc, context)),
    ]
}


