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
        const codeFrag = protoToTs(infile, imports, surrogates);
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

function getSurrogates(files: FileDescriptorProto[]): ReadonlyMap<string, string> {
    const types = new Map<string, string>();
    for (const file of files) {
        const comments = getComments(file);
        recurseTypes(file.getPackage(), file.getMessageTypeList(), file.getEnumTypeList(), (name, type, path) => {
            const comment = comments.get(path);
            if (comment && /@has-surrogate/.test(comment)) {
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

function enumToTs(e: EnumDef, ns: string | undefined): CodeFrag {
    const enumJsName = e.name || "";
    const values = getEnumValues(enumJsName, e);
    return [
        ``,
        `export namespace ${enumJsName} {`,
        block(
            `type ProtoName = "${protoNameJoin(ns, e.name)}"`,
            ``,
            values.map(({jsName, number}) => `export type ${jsName} = typeof ${jsName} | "${jsName}" | ${number}`),
            ``,
            values.map(({jsName, number}) => `export const ${jsName} = H.enumValue<ProtoName>(${number}, "${jsName}");`),
            ``,
            `const map = new Map<string|number, H.EnumValue<ProtoName>>([`,
            block(
                values.map(({jsName, number}) => ([
                    `["${jsName.toLowerCase()}", ${jsName}],`,
                    `[${number}, ${jsName}],`,
                ])),
            ),
            `]);`,
            ``,
            `type LiteralNumber = ${values.map(v => v.number).join(" | ")}`,
            `type LiteralString = ${values.map(v => `"${v.jsName}"`).join(" | ")}`,
            `export type Literal = LiteralNumber | LiteralString`,
            `export type Value = H.EnumValue<ProtoName> | Literal;`,
            ``,
            `export const from = H.makeEnumConstructor<ProtoName, LiteralNumber, LiteralString>(map);`,
            `export const toNumber = H.makeToNumber(from);`,
            `export const toString = H.makeToString(from);`,
            `export const write = H.makeEnumWriter(toNumber);`,
            `export const {defVal, read, wireType, readValue} = F.enumeration(() => ({from}));`,
        ),
        `}`,
        `export type ${enumJsName} = H.EnumValue<"${protoNameJoin(ns, enumJsName)}">`,
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
    const map = getMapType(field, lookupMapType);
    const isRepeated = !map && isRepeatedField(field);
    const optional = !strict;
    if (map) {
        const valtype = fieldTypeInfo(map.value);
        const keytype = fieldTypeInfo(map.key);
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
    const match = /@representation:([a-z\-_0-9]+)/.exec(comment);
    return match?.[1];
}

function renderMessageFieldWrite(field: FieldDef, context: Context, lookupMapType: (typename: string) => MapType | undefined): CodeLine {
    const protoFieldName = field.name!;
    const jsFieldName = `${camelCase(protoFieldName)}`;
    const protoFieldNumber = field.number!;
    const type = fieldTypeInfo(field);
    const map = getMapType(field, lookupMapType);
    const isRepeated = !map && isRepeatedField(field);
    const representationVariation = getRepresentationVariation(field.path, context.file.comments);
    if (map) {
        const valtype = fieldTypeInfo(map.value);
        const keytype = fieldTypeInfo(map.key);
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

function typesToTs(enums: EnumDef[], messages: MessageDef[], context: Context): CodeFrag {
    return [
        enums.map((e, i) => enumToTs(e, context.name)),
        messages.map((m, i) => messageToTs(m, {...context, name: `${protoNameJoin(context.name, m.name || "")}`})),
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
    comments: string | undefined,
};
type EnumDef = {
    name?: string,
    valueList: Array<EnumValueDescriptorProto.AsObject>,
    options?: EnumOptions.AsObject,
    reservedRangeList: Array<EnumDescriptorProto.EnumReservedRange.AsObject>,
    reservedNameList: Array<string>,
    path: string
    comments: string | undefined,
};

function toMessageDefs(list: DescriptorProto.AsObject[], path: string, listField: number, comments: ReadonlyMap<string, string>): MessageDef[] {
    const context = `${path}/${listField}`;
    return list.map<MessageDef>((nested, i) => ({
        ...nested,
        path: `${context}/${i}`,
        nestedTypeList: toMessageDefs(nested.nestedTypeList, `${context}/${i}`, 3, comments),
        enumTypeList: toEnumDefs(nested.enumTypeList, `${context}/${i}`, 4, comments),
        fieldList: toFieldDefs(nested.fieldList, `${context}/${i}`, 2, comments),
        comments: comments.get(`${context}/${i}`),
    }))
}

function toEnumDefs(list: EnumDescriptorProto.AsObject[], path: string, listField: number, comments: ReadonlyMap<string, string>): EnumDef[] {
    const context = `${path}/${listField}`;
    return list.map<EnumDef>((nested, i) => ({
        ...nested,
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

function messageToTs(m: MessageDef, context: Context): CodeFrag {
    const nestedEnums = m.enumTypeList.map<EnumDef>((nested, i) => ({...nested, path: `${m.path}/4/${i}`}));
    const mapTypes = m.nestedTypeList
        .filter(nt => nt.options?.mapEntry === true)
        .map<MapType>(nt => ({
            name: `.${context.name}.${nt.name}`,
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
    const nestedMessages = m.nestedTypeList
        .filter(nt => nt.options?.mapEntry !== true);

    return [
        ``,
        `export namespace ${m.name} {`,
        block([
            `type ProtoName = "${context.name}";`,
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
            ``,
            `/**`,
            ` * Write all non-default fields`,
            ` * @param {NestedWritable} writable - Target writable`,
            ` * @param {Value} value - instance of message`,
            ` */`,
            `export const writeContents: H.WriteMessage<Value> = (w, msg) => {`,
            block([
                nonOneOfFields
                .map(field => renderMessageFieldWrite(field, context, getMapType)),
            ]),
            block([
                oneofs
                .map(oneof => renderOneofFieldsWrite(oneof, context))
            ]),
            `}`,
            ``,
            `/**`,
            ` * Write all non-default fields into a length-prefixed block`,
            ` * @param {NestedWritable} writable - Target writable`,
            ` * @param {Value} value - instance of message`,
            ` */`,
            `export const writeValue = H.makeDelimitedWriter(writeContents);`,
            ``,
            `/**`,
            ` * Write all non-default fields into a length-prefixed block with a tag`,
            ` * @param {NestedWritable} writable - Target writable`,
            ` * @param {Value} value - instance of message`,
            ` * @param {number} field - number of field`,
            ` * @returns {boolean} - true if it wrote anything`,
            ` */`,
            `export const write = H.makeFieldWriter(writeValue);`,
            ``,
            `/**`,
            ` * Convert a message instance to its encoded form`,
            ` * @param {Value} value - instance of message`,
            ` * @returns {Uint8Array} - the encoded form of the message`,
            ` */`,
            `export const encode = H.makeEncoder<Loose | Strict>(writeContents);`,
            ``,
            `export const fields: F.MessageFieldDef[] = [`,
            block([
                fields
                .map(field => renderMessageFieldRead(field, context, getMapType, getOneofName)),
            ]),
            `]`,
            ``,
            `export const readMessageValue = F.makeMessageValueReader<Strict>(fields);`,
            ``,
            `export const {readValue, defVal, read, wireType} = F.message(() => ({readMessageValue}));`,
            ``,
            `export const decode = (bytes: Uint8Array) => readValue(Reader.fromBytes(bytes));`,
            ``,
            `export const toStrict: (value: Value) => Strict = undefined as any;`,
            //``,
            //`export const empty = H.once(() => readValue(H.empty()));`,
            typesToTs(nestedEnums, nestedMessages, context),
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

function depToImportTs(depPath: string, fromProtoPath: string) {
    const relPath = importRelative(depPath, fromProtoPath);
    return `import * as ${importNameFor(depPath)} from "${protoPathToTsImportPath(relPath)}"`
}

function getMethodType(clientStreaming: boolean, serverStreaming: boolean): "unary" | "client-streaming" | "server-streaming" | "bidirectional" {
    return clientStreaming ? (serverStreaming ? "bidirectional" : "client-streaming") : (serverStreaming ? "server-streaming" : "unary");
}

function unaryMethodToTs(serviceFqName: string, method: MethodDescriptorProto, context: Context): CodeFrag {
    const methodName = method.getName()!;
    const requestJsName = jsIdentifierForCustomType(method.getInputType()!, protoMessageTypeToJs, context);
    const responseJsName = jsIdentifierForCustomType(method.getOutputType()!, protoMessageTypeToJs, context);
    return [
        ``,
        `methodInfo${pascalCase(methodName)} = new grpcWeb.AbstractClientBase.MethodInfo<${requestJsName}.Value, ${responseJsName}.Strict>(`,
        `    H.noconstructor,`,
        `    ${requestJsName}.encode,`,
        `    ${responseJsName}.decode`,
        `);`,
        ``,
        `${camelCase(methodName)}(request: ${requestJsName}.Value, metadata: grpcWeb.Metadata | null): Promise<${responseJsName}.Strict>;`,
        `${camelCase(methodName)}(request: ${requestJsName}.Value, metadata: grpcWeb.Metadata | null, callback: (err: grpcWeb.Error, response: ${responseJsName}.Strict) => void): grpcWeb.ClientReadableStream<${responseJsName}.Strict>;`,
        `${camelCase(methodName)}(request: ${requestJsName}.Value, metadata: grpcWeb.Metadata | null, callback?: (err: grpcWeb.Error, response: ${responseJsName}.Strict) => void) {`,
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
    const methodName = method.getName()!;
    const requestJsName = jsIdentifierForCustomType(method.getInputType()!, protoMessageTypeToJs, context);
    const responseJsName = jsIdentifierForCustomType(method.getOutputType()!, protoMessageTypeToJs, context);
    return [
        ``,
        `methodInfo${pascalCase(methodName)} = new grpcWeb.AbstractClientBase.MethodInfo(`,
        `    H.noconstructor,`,
        `    ${requestJsName}.encode,`,
        `    ${responseJsName}.decode`,
        `);`,
        ``,
        `${camelCase(methodName)}(request: ${requestJsName}.Value, metadata?: grpcWeb.Metadata) {`,
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
        case "bidirectional":
            // these aren't supported by the grpc-web protocol
            return [];
        case "client-streaming":
            // these aren't supported by the grpc-web protocol
            return [];
        default:
            assertNever(type);
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
    ];
}

function protoToTs(infile: FileDescriptorProto, imports: ImportContext, surrogates: ReadonlyMap<string, string>): CodeFrag {
    const fileContext: FileContext = {path: infile.getName()!, pkg: infile.getPackage(), comments: getComments(infile)};
    const context: Context = {imports, surrogates, file: fileContext, name: fileContext.pkg}
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
        `import {WriteField as W, KeyConverters as KC, Helpers as H, Reader, FieldTypes as F} from "protobuf-codec-ts"`,
        infile.getDependencyList().map(d => depToImportTs(d, fileContext.path)),
        surrogates.size ? [`import * as Surrogates from "${depth === 0 ? "./" : "../".repeat(depth)}surrogates";`] : [],
        typesToTs(
            toEnumDefs(infile.getEnumTypeList().map(e => e.toObject()), "", 5, fileContext.comments),
            toMessageDefs(infile.getMessageTypeList().map(m => m.toObject()), "", 4, fileContext.comments),
            context
        ),
        infile.getServiceList().map(svc => serviceToTs(svc, context)),
        ``,
    ]
}

