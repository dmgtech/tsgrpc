import { FieldDef } from "./preprocess";

export type FieldTypeInfo = BuiltInFieldType | CustomFieldType

type BuiltInFieldType = {
    builtin: true,
    packed: boolean,
    proto: string,
    presence: "always" | "wrapper" | "optional",
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

export type ProtoTypeNameToTsTranslator = (protoType: string, strict?: boolean) => string;

const wellKnownTypes = new Map<string, FieldTypeInfo>([
    [".google.protobuf.Timestamp", {
        packed: false,
        builtin: true,
        presence: "wrapper",
        proto: `timestamp`,
        strict: `(timelib.Instant | undefined)`,
        loose: `timelib.Instant`,
    }],
    [".google.protobuf.Duration", {
        packed: false,
        builtin: true,
        presence: "wrapper",
        proto: `duration`,
        strict: `(timelib.Duration | undefined)`,
        loose: `timelib.Duration`,
    }],
    [".google.protobuf.DoubleValue", {
        packed: false,
        builtin: true,
        presence: "wrapper",
        proto: `maybeDouble`,
        strict: `(number | undefined)`,
        loose: `number`,
    }],
    [".google.protobuf.FloatValue", {
        //maybeFloat?: number
        packed: false,
        builtin: true,
        presence: "wrapper",
        proto: `maybeFloat`,
        strict: `(number | undefined)`,
        loose: `number`,
    }],
    [".google.protobuf.Int64Value", {
        //maybeInt64?: (string | number)
        packed: false,
        builtin: true,
        presence: "wrapper",
        proto: `maybeInt64`,
        strict: `(string | undefined)`,
        loose: `(string | number)`,
        defaultRep: `decimal`,
    }],
    [".google.protobuf.UInt64Value", {
        //maybeUint64?: (string | number)
        packed: false,
        builtin: true,
        presence: "wrapper",
        proto: `maybeUint64`,
        strict: `(string | undefined)`,
        loose: `(string | number)`,
        defaultRep: `decimal`,
    }],
    [".google.protobuf.Int32Value", {
        //maybeInt32?: number
        packed: false,
        builtin: true,
        presence: "wrapper",
        proto: `maybeInt32`,
        strict: `(number | undefined)`,
        loose: `number`,
    }],
    [".google.protobuf.UInt32Value", {
        //maybeUint32?: number
        packed: false,
        builtin: true,
        presence: "wrapper",
        proto: `maybeUint32`,
        strict: `(number | undefined)`,
        loose: `number`,
    }],
    [".google.protobuf.BoolValue", {
        //maybeBool?: boolean
        packed: false,
        builtin: true,
        presence: "wrapper",
        proto: `maybeBool`,
        strict: `(boolean | undefined)`,
        loose: `boolean`,
    }],
    [".google.protobuf.StringValue", {
        //maybeString?: string
        packed: false,
        builtin: true,
        presence: "wrapper",
        proto: `maybeString`,
        strict: `(string | undefined)`,
        loose: `string`,
    }],
    [".google.protobuf.BytesValue", {
        //maybeBytes?: ArrayBuffer
        packed: false,
        builtin: true,
        presence: "wrapper",
        proto: `maybeBytes`,
        strict: `(ArrayBuffer | undefined)`,
        loose: `ArrayBuffer`,
    }],
])

export function fieldTypeInfo(field: FieldDef): FieldTypeInfo {
    const fieldType = field.type;
    switch (fieldType?.toNumber()) {
        case 1: return {
            packed: true,
            builtin: true,
            proto: `double`,
            presence: field.proto3Optional ? "optional" : "always",
            strict: `number`,
            loose: `number`,
        };
        case 2: return {
            packed: true,
            builtin: true,
            proto: `float`,
            presence: field.proto3Optional ? "optional" : "always",
            strict: `number`,
            loose: `number`,
        };
        case 3: return {
            packed: true,
            builtin: true,
            proto: `int64`,
            presence: field.proto3Optional ? "optional" : "always",
            strict: `string`,
            loose: `(string | number)`,
            defaultRep: `decimal`,
        };
        case 4: return {
            packed: true,
            builtin: true,
            proto: `uint64`,
            presence: field.proto3Optional ? "optional" : "always",
            strict: `string`,
            loose: `(string | number)`,
            defaultRep: `decimal`,
        };
        case 5: return {
            packed: true,
            builtin: true,
            proto: `int32`,
            presence: field.proto3Optional ? "optional" : "always",
            strict: `number`,
            loose: `number`,
        };
        case 6: return {
            packed: true,
            builtin: true,
            proto: `fixed64`,
            presence: field.proto3Optional ? "optional" : "always",
            strict: `string`,
            loose: `(string | number)`,
            defaultRep: `decimal`,
        };
        case 7: return {
            packed: true,
            builtin: true,
            proto: `fixed32`,
            presence: field.proto3Optional ? "optional" : "always",
            strict: `number`,
            loose: `number`,
        };
        case 8: return {
            packed: true,
            builtin: true,
            proto: `bool`,
            presence: field.proto3Optional ? "optional" : "always",
            strict: `boolean`,
            loose: `boolean`,
        };
        case 9: return {
            packed: false,
            builtin: true,
            proto: `string`,
            presence: field.proto3Optional ? "optional" : "always",
            strict: `string`,
            loose: `string`,
        };
        case 11: return wellKnownTypes.get(field.typeName!) || {
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
            presence: field.proto3Optional ? "optional" : "always",
            strict: `ArrayBuffer`,
            loose: `ArrayBuffer`,
        };
        case 13: return {
            packed: true,
            builtin: true,
            proto: `uint32`,
            presence: field.proto3Optional ? "optional" : "always",
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
            presence: field.proto3Optional ? "optional" : "always",
            strict: `number`,
            loose: `number`,
        };
        case 16: return {
            packed: true,
            builtin: true,
            proto: `sfixed64`,
            presence: field.proto3Optional ? "optional" : "always",
            strict: `string`,
            loose: `(string | number)`,
            defaultRep: `decimal`,
        };
        case 17: return {
            packed: true,
            builtin: true,
            proto: `sint32`,
            presence: field.proto3Optional ? "optional" : "always",
            strict: `number`,
            loose: `number`,
        };
        case 18: return {
            packed: true,
            builtin: true,
            proto: `sint64`,
            presence: field.proto3Optional ? "optional" : "always",
            strict: `string`,
            loose: `(string | number)`,
            defaultRep: `decimal`,
        };
        default: {
            throw new Error(`Unimplemented field type code: ${fieldType}`)
        };
    }
}

export function protoMessageTypeToJs(protoTypeName: string, strict?: boolean) {
    return `${protoCustomTypeToJs(protoTypeName)}${(strict === undefined ? "" : strict ? ".Strict" : ".Value")}`;
}

function protoEnumTypeToJs(protoTypeName: string, strict?: boolean) {
    const jsType = protoCustomTypeToJs(protoTypeName);
    return strict === false ? `${jsType}.Value` : jsType;
}

function protoCustomTypeToJs(protoTypeName: string) {
    return protoTypeName.replace(/^\./, "");
}

export function nameOfBuiltInType(type: BuiltInFieldType, representationVariation: string | undefined) {
    const variation =
        representationVariation !== undefined ? representationVariation :
        type.defaultRep !== undefined ? type.defaultRep :
        "";
    return `${type.proto}${variation}`;
}

