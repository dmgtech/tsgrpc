import {CodeGeneratorRequest, CodeGeneratorResponse, FileDescriptorProto, EnumDescriptorProto, EnumValueDescriptorProto, DescriptorProto, FieldDescriptorProto} from "protoc-plugin";
import {pascalCase, camelCase} from "change-case";

// we need to be able to parse a CodeGeneratorRequest from stdin

// not entirely sure the best way to do this given the generated code.

import fs from "fs"
import { lookup } from "dns";
const data = fs.readFileSync(0);

const request = CodeGeneratorRequest.deserializeBinary(data);
const response = new CodeGeneratorResponse();

for (const infile of request.getProtoFileList()) {
    const name = infile.getName();
    
    const outfile = new CodeGeneratorResponse.File;
    outfile.setName(`${name}.gen.ts`);
    const codeFrag = protoToTs(infile);
    const content = codeNodeToString(codeFrag);
    outfile.setContent(content);
    response.getFileList().push(outfile);

    // Dump out some helpful json
    const outjson = new CodeGeneratorResponse.File;
    outjson.setName(`${name}.gen.json`);
    outjson.setContent(JSON.stringify(infile.toObject(), null, 4));
    response.getFileList().push(outjson);
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

//response.setError("Not implemented");

process.stdout.write(response.serializeBinary());

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

function enumToTs(e: EnumDescriptorProto, packageName: string | undefined): CodeFrag {
    const packagePrefix = packageName ? `${packageName}.` : ``;
    const enumJsName = pascalCase(e.getName() || "");
    const values = e.getValueList().map(v => ({
        jsName: enumValJsName(enumJsName || "", v.getName() || ""),
        number: v.getNumber(),
    }))
    return [
        ``,
        `export namespace ${enumJsName} {`,
        block(
            `type ProtoName = "${packagePrefix}${e.getName()}"`,
            ``,
            `export type Value = H.EnumValue<ProtoName>;`,
            values.map(({jsName, number}) => `export type ${jsName} = typeof ${jsName} | "${jsName}" | ${number}`),
            ``,
            values.map(({jsName, number}) => `export const ${jsName} = H.enumValue<ProtoName>(${number}, "${jsName}");`),
            ``,
            `const map = new Map<string|number, Value>([`,
            block(
                values.map(({jsName, number}) => ([
                    `["${jsName.toLowerCase()}", ${enumJsName}.${jsName}],`,
                    `[${number}, ${enumJsName}.${jsName}],`,
                ])),
            ),
            `]);`,
            ``,
            `type LiteralNumber = ${values.map(v => v.number).join(" | ")}`,
            `type LiteralString = ${values.map(v => `"${v.jsName}"`).join(" | ")}`,
            `export type Literal = LiteralNumber | LiteralString`,
            ``,
            `export const from = H.makeEnumConstructor<ProtoName, LiteralNumber, LiteralString>(map);`,
            `export const toNumber = H.makeToNumber(from);`,
            `export const toString = H.makeToString(from);`,
            `export const write = H.makeEnumWriter(toNumber);`,
        ),
        `}`,
        `export type ${enumJsName} = H.EnumValue<"${packagePrefix}${enumJsName}">`,
    ];
}

function nsRelative(name: string, nameContext: string) {
    const nameSegs = name.replace(/^\./, '').split('.');
    const ctxSegs = nameContext.replace(/^\./, '').split('.');
    let i: number;
    for (i = 0; i < (nameSegs.length - 1) && i < ctxSegs.length && nameSegs[i] === ctxSegs[i]; i++) ;
    return nameSegs.slice(i).join(".");
}

type FieldDef = {
    name: {proto: string, js: string},
    type: FieldTypeInfo,
    number: number,
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
    toJsType: (protoType: string, strict?: boolean) => string,
    wrap: "enumeration" | "message"
}

type MapType = {
    name: string,
    key: FieldDescriptorProto,
    value: FieldDescriptorProto,
}

function isRepeatedField(field: FieldDescriptorProto): boolean {
    return field.getLabel() === 3;
}

function getMapType(field: FieldDescriptorProto, lookupMapType: (typename: string) => MapType | undefined) {
    return lookupMapType(field.getTypeName()!);
}

function protoCustomTypeToJs(protoTypeName: string) {
    return protoTypeName.replace(/^\./, "");
}

function protoMessageTypeToJs(protoTypeName: string, strict?: boolean) {
    return `${protoCustomTypeToJs(protoTypeName)}${(strict === undefined ? "" : strict ? ".Strict" : ".Value")}`;
}

function protoEnumTypeToJs(protoTypeName: string, strict?: boolean) {
    const jsType = protoCustomTypeToJs(protoTypeName);
    return strict === false ? `(${jsType} | ${jsType}.Literal)` : jsType;
}

function tsField(protoTypeName: string, protoFieldName: string, protoFieldNumber: number, jsFieldName: string, jsTypeName: string, optional: boolean) {
    return [
        `// ${protoTypeName} ${protoFieldName} = ${protoFieldNumber};`,
        `readonly ${jsFieldName}${(optional ? "?" : "")}: ${jsTypeName},`,
    ]
}

function renderMessageFieldTypeDecl(strict: boolean, field: FieldDescriptorProto, nameContext: string, lookupMapType: (typename: string) => MapType | undefined) {
    const protoFieldName = field.getName()!;
    const jsFieldName = `${camelCase(protoFieldName)}`;
    const protoFieldNumber = field.getNumber()!;
    const type = fieldTypeInfo(field);
    const map = getMapType(field, lookupMapType);
    const isRepeated = !map && isRepeatedField(field);
    const optional = !strict;
    if (map) {
        const valtype = fieldTypeInfo(map.value);
        const keytype = fieldTypeInfo(map.key);
        if (!keytype.builtin)
            throw new Error(`Illegal map key type ${keytype.proto}`);
        const protoValTypeRelative = valtype.builtin ? valtype.proto : nsRelative(valtype.proto, nameContext);
        const protoKeyType = keytype.proto;
        const protoTypeName = `map<${protoKeyType}, ${protoValTypeRelative}>`;
        const jsValTypeName = valtype.builtin ? (strict ? valtype.strict : valtype.loose) : (valtype.toJsType(protoValTypeRelative, strict));
        const jsStrictMap = `{ ${(keytype.proto === "bool" ? `[key in "true" | "false"]?` : `[key: string]`)}: ${jsValTypeName} }`;
        const jsLooseMap = `Map<${keytype.loose}, ${jsValTypeName}> | ${jsStrictMap}`
        const jsTypeName = strict ? jsStrictMap : jsLooseMap;
        return tsField(protoTypeName, protoFieldName, protoFieldNumber, jsFieldName, jsTypeName, optional);
    }
    else {
        const protoRelative = type.builtin ? type.proto : nsRelative(type.proto, nameContext);
        const protoTypeName = `${(isRepeated ? "repeated " : "")}${protoRelative}`;
        const jsElementTypeName = type.builtin ? (strict ? type.strict : type.loose) : (type.toJsType(protoRelative, strict));
        const jsTypeName = `${jsElementTypeName}${isRepeated ? '[]' : (!type.builtin && type.nullable && strict) ? ' | undefined' : ''}`
        return tsField(protoTypeName, protoFieldName, protoFieldNumber, jsFieldName, jsTypeName, optional);
    }
}

function renderOneofFieldTypeDecl(strict: boolean, oneofName: string, field: FieldDescriptorProto, nameContext: string) {
    const protoFieldName = field.getName()!;
    const jsFieldName = `${camelCase(protoFieldName)}`;
    const type = fieldTypeInfo(field);
    const protoRelative = type.builtin ? type.proto : nsRelative(type.proto, nameContext);
    const protoTypeName = `${protoRelative}`;
    const jsElementTypeName = type.builtin ? (strict ? type.strict : type.loose) : (type.toJsType(protoRelative, strict));
    const jsTypeName = `${jsElementTypeName}${(!type.builtin && type.nullable && strict) ? ' | undefined' : !strict ? ' | undefined' : ''}`
    const caseDecl = strict ? `${camelCase(oneofName)}Case: "${jsFieldName}", ` : ``;
    return [
        `// ${protoTypeName} ${protoFieldName} = ${field.getNumber()};`,
        `| { ${caseDecl}${jsFieldName}: ${jsTypeName} }`,
    ]    
}

function renderOneofTypeDecl(strict: boolean, oneof: OneofInfo, nameContext: string) {
    const caseDecl = strict ? ` ${oneof.name}Case: "" ` : ``;
    return [
        ``,
        `type ${pascalCase(oneof.name)}${strict ? "Strict" : "Loose"} = {${caseDecl}}`,
        block(
            oneof.fields.map(field => renderOneofFieldTypeDecl(strict, oneof.name, field, nameContext))
        ),
    ]    
}

function fieldWrite(writer: string, jsFieldName: string, protoFieldNumber: number, ...args: string[]): CodeLine {
    return `${writer}(w, ${args.map(a => `${a}, `).join("")}msg.${jsFieldName}, ${protoFieldNumber});`
}

function builtInName(type: BuiltInFieldType) {
    return `${type.proto}${type.defaultRep || ""}`;
}

function getTypeWriter(type: FieldTypeInfo, nameContext: string): string {
    const typeRelative = type.builtin ? type.proto : nsRelative(type.proto, nameContext);
    return type.builtin ? `W.${builtInName(type)}` : `${type.toJsType(typeRelative)}.write`
}

function getTypeReader(type: FieldTypeInfo, nameContext: string): string {
    const typeRelative = type.builtin ? type.proto : nsRelative(type.proto, nameContext);
    return type.builtin ? `F.${builtInName(type)}` : `F.${type.wrap}(() => ${type.toJsType(typeRelative)})`
}

function renderMessageFieldWrite(field: FieldDescriptorProto, nameContext: string, lookupMapType: (typename: string) => MapType | undefined): CodeLine {
    const protoFieldName = field.getName()!;
    const jsFieldName = `${camelCase(protoFieldName)}`;
    const protoFieldNumber = field.getNumber()!;
    const type = fieldTypeInfo(field);
    const map = getMapType(field, lookupMapType);
    const isRepeated = !map && isRepeatedField(field);
    if (map) {
        const valtype = fieldTypeInfo(map.value);
        const keytype = fieldTypeInfo(map.key);
        const valwriter = getTypeWriter(valtype, nameContext);
        if (!keytype.builtin)
            throw new Error(`Illegal map key type ${keytype.proto}`);
        const keyTypeName = builtInName(keytype);
        return fieldWrite(`W.map`, jsFieldName, protoFieldNumber, `W.${keyTypeName}`, `KC.${keyTypeName}`, valwriter);
    }
    const valueWriter = getTypeWriter(type, nameContext);
    if (isRepeated) {
        return fieldWrite(`W.${type.packed ? "packed" : "repeated"}`, jsFieldName, protoFieldNumber, valueWriter);
    }
    else {
        return fieldWrite(valueWriter, jsFieldName, protoFieldNumber);
    }
}

function renderOneofFieldsWrite(oneof: OneofInfo, nameContext: string) {
    return oneof.fields.map((field, index) => renderOneofFieldWrite(field, index, nameContext))
}

function renderOneofFieldWrite(field: FieldDescriptorProto, index: number, nameContext: string) {
    // TODO: the code generated by this might be inefficient for large oneofs; consider and benchmark other methods for large oneofs
    const protoFieldName = field.getName()!;
    const jsFieldName = `${camelCase(protoFieldName)}`;
    return `${(index === 0) ? "if" : "else if"} ("${jsFieldName}" in msg) { ${renderMessageFieldWrite(field, nameContext, () => undefined)} }`
}

function renderMessageFieldRead(field: FieldDescriptorProto, nameContext: string, lookupMapType: (typename: string) => MapType | undefined, lookupOneofName: (index: number) => string | undefined) {
    const protoFieldName = field.getName()!;
    const jsFieldName = `${camelCase(protoFieldName)}`;
    const protoFieldNumber = field.getNumber()!;
    const type = fieldTypeInfo(field);
    const map = getMapType(field, lookupMapType);
    const oneof = field.hasOneofIndex() ? lookupOneofName(field.getOneofIndex()!) : undefined;
    const isRepeated = !map && isRepeatedField(field);
    if (map) {
        const valtype = fieldTypeInfo(map.value);
        const keytype = fieldTypeInfo(map.key);
        const valueReader = getTypeReader(valtype, nameContext);
        const keyReader = getTypeReader(keytype, nameContext);
        return `[${protoFieldNumber}, "${jsFieldName}", F.map(${keyReader}, ${valueReader})],`;
    }
    else {
        const valueReader = getTypeReader(type, nameContext);
        const reader = oneof ? `F.oneof("${oneof}", ${valueReader})` : isRepeated ? `F.repeated(${valueReader})` : valueReader;
        return `[${protoFieldNumber}, "${jsFieldName}", ${reader}],`
    }
}

function fieldTypeInfo(field: FieldDescriptorProto): FieldTypeInfo {
    const fieldType = field.getType();
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
            proto: field.getTypeName()!,
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
            proto: field.getTypeName()!,
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

function fieldName(f: FieldDescriptorProto) {
    const name = f.getName() || "";
    return {
        proto: name,
        js: camelCase(name),
    }
}

function typesToTs(enums: EnumDescriptorProto[], messages: DescriptorProto[], ns: string | undefined): CodeFrag {
    return [
        enums.map(e => enumToTs(e, ns)),
        messages.map(m => messageToTs(m, ns)),
    ]
}

interface OneofInfo {
    name: string,
    index: number,
    fields: FieldDescriptorProto[],
}

function messageToTs(m: DescriptorProto, packageName: string | undefined): CodeFrag {
    const packagePrefix = packageName ? `${packageName}.` : ``;
    const msgJsName = m.getName() || "";
    const fqName = `${packagePrefix}${msgJsName}`;
    const mapTypes = m.getNestedTypeList()
        .filter(nt => nt.getOptions()?.getMapEntry() === true)
        .map<MapType>(nt => ({
            name: `.${fqName}.${nt.getName()}`,
            key: nt.getFieldList().find(kf => kf.getNumber() === 1)!,
            value: nt.getFieldList().find(vf => vf.getNumber() === 2)!,
        }))
    const fields = m.getFieldList();
    const oneofs = m.getOneofDeclList()
        .map(odl => odl.getName()!)
        .map<OneofInfo>((name, index) => ({
            name,
            index,
            fields: fields.filter(f => f.hasOneofIndex() && f.getOneofIndex() === index)
        }))
    const getMapType = (name: string) => mapTypes.find(mt => name === mt.name);
    const getOneofName = (index: number) => oneofs[index]?.name;
    const nonOneOfFields = fields
        .filter(f => !f.hasOneofIndex())
        //.map(f => fieldDef(f, fqName, ))
    const nestedMessages = m.getNestedTypeList()
        .filter(nt => nt.getOptions()?.getMapEntry() !== true);
    const nestedEnums = m.getEnumTypeList();

    return [
        ``,
        `export namespace ${m.getName()} {`,
        block([
            `type ProtoName = "${fqName}";`,
            oneofs.map(oneof => renderOneofTypeDecl(true, oneof, fqName)),
            ``,
            `export type Strict = {`,
            block([
                nonOneOfFields
                .map(field => renderMessageFieldTypeDecl(true, field, fqName, getMapType)),
            ]),
            `}${oneofs.map(oo => ` & ${pascalCase(oo.name)}Strict`)}`,
            oneofs.map(oneof => renderOneofTypeDecl(false, oneof, fqName)),
            ``,
            `export type Loose = {`,
            block([
                nonOneOfFields
                .map(field => renderMessageFieldTypeDecl(false, field, fqName, getMapType)),
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
                .map(field => renderMessageFieldWrite(field, fqName, getMapType)),
            ]),
            block([
                oneofs
                .map(oneof => renderOneofFieldsWrite(oneof, fqName))
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
                .map(field => renderMessageFieldRead(field, fqName, getMapType, getOneofName)),
            ]),
            `]`,
            ``,
            `export const readValue = F.makeMessageValueReader<Strict>(fields);`,
            ``,
            `export const decode = (bytes: Uint8Array) => readValue(Reader.fromBytes(bytes));`,
            typesToTs(nestedEnums, nestedMessages, fqName),
            //`/*`,
            //JSON.stringify(m.toObject(), null, 4).split('\n'),
            //`*/`,
        ]),
        `}`,
    ]
}

function nsWrap(ns: string | undefined, render: () => CodeFrag) {
    return ns ? [`export namespace ${ns} {`, block(render()), `}`] : [render()];
}

function protoToTs(infile: FileDescriptorProto): CodeFrag {
    const ns = infile.getPackage();
    return [
        `import {WriteField as W, KeyConverters as KC, Helpers as H, Reader, FieldTypes as F} from "protobuf-codec-ts"`,
        ``,
        nsWrap(ns, () => typesToTs(infile.getEnumTypeList(), infile.getMessageTypeList(), ns)),
    ]
}


