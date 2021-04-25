/* istanbul ignore file */
/**
 * @fileoverview tsgrpc-generated client stub for google.protobuf from google/protobuf/descriptor.proto
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!

/* eslint-disable */
// @ts-nocheck

import {Enums as E, Messages as M, Services as S, WriteField as W, KeyConverters as KC, Helpers as H, Reader, FieldTypes as F, Reducers, Types as T} from "@dmgtech/protobuf-codec-ts";

export const FileDescriptorSet = {
} as unknown as
    M.MessageDef<FileDescriptorSet.Strict, FileDescriptorSet.Value>

export const FileDescriptorProto = {
} as unknown as
    M.MessageDef<FileDescriptorProto.Strict, FileDescriptorProto.Value>

export const DescriptorProto = {
    ExtensionRange: {},
    ReservedRange: {},
} as unknown as
    M.MessageDef<DescriptorProto.Strict, DescriptorProto.Value> & {
        ExtensionRange: M.MessageDef<DescriptorProto.ExtensionRange.Strict, DescriptorProto.ExtensionRange.Value>,
        ReservedRange: M.MessageDef<DescriptorProto.ReservedRange.Strict, DescriptorProto.ReservedRange.Value>,
    }

export const ExtensionRangeOptions = {
} as unknown as
    M.MessageDef<ExtensionRangeOptions.Strict, ExtensionRangeOptions.Value>

export const FieldDescriptorProto = {
    Type: {},
    Label: {},
} as unknown as
    M.MessageDef<FieldDescriptorProto.Strict, FieldDescriptorProto.Value> & {
        Type: E.EnumDef<FieldDescriptorProto.Type.ProtoName, FieldDescriptorProto.Type.Def>,
        Label: E.EnumDef<FieldDescriptorProto.Label.ProtoName, FieldDescriptorProto.Label.Def>,
    }

export const OneofDescriptorProto = {
} as unknown as
    M.MessageDef<OneofDescriptorProto.Strict, OneofDescriptorProto.Value>

export const EnumDescriptorProto = {
    EnumReservedRange: {},
} as unknown as
    M.MessageDef<EnumDescriptorProto.Strict, EnumDescriptorProto.Value> & {
        EnumReservedRange: M.MessageDef<EnumDescriptorProto.EnumReservedRange.Strict, EnumDescriptorProto.EnumReservedRange.Value>,
    }

export const EnumValueDescriptorProto = {
} as unknown as
    M.MessageDef<EnumValueDescriptorProto.Strict, EnumValueDescriptorProto.Value>

export const ServiceDescriptorProto = {
} as unknown as
    M.MessageDef<ServiceDescriptorProto.Strict, ServiceDescriptorProto.Value>

export const MethodDescriptorProto = {
} as unknown as
    M.MessageDef<MethodDescriptorProto.Strict, MethodDescriptorProto.Value>

export const FileOptions = {
    OptimizeMode: {},
} as unknown as
    M.MessageDef<FileOptions.Strict, FileOptions.Value> & {
        OptimizeMode: E.EnumDef<FileOptions.OptimizeMode.ProtoName, FileOptions.OptimizeMode.Def>,
    }

export const MessageOptions = {
} as unknown as
    M.MessageDef<MessageOptions.Strict, MessageOptions.Value>

export const FieldOptions = {
    CType: {},
    JSType: {},
} as unknown as
    M.MessageDef<FieldOptions.Strict, FieldOptions.Value> & {
        CType: E.EnumDef<FieldOptions.CType.ProtoName, FieldOptions.CType.Def>,
        JSType: E.EnumDef<FieldOptions.JSType.ProtoName, FieldOptions.JSType.Def>,
    }

export const OneofOptions = {
} as unknown as
    M.MessageDef<OneofOptions.Strict, OneofOptions.Value>

export const EnumOptions = {
} as unknown as
    M.MessageDef<EnumOptions.Strict, EnumOptions.Value>

export const EnumValueOptions = {
} as unknown as
    M.MessageDef<EnumValueOptions.Strict, EnumValueOptions.Value>

export const ServiceOptions = {
} as unknown as
    M.MessageDef<ServiceOptions.Strict, ServiceOptions.Value>

export const MethodOptions = {
    IdempotencyLevel: {},
} as unknown as
    M.MessageDef<MethodOptions.Strict, MethodOptions.Value> & {
        IdempotencyLevel: E.EnumDef<MethodOptions.IdempotencyLevel.ProtoName, MethodOptions.IdempotencyLevel.Def>,
    }

export const UninterpretedOption = {
    NamePart: {},
} as unknown as
    M.MessageDef<UninterpretedOption.Strict, UninterpretedOption.Value> & {
        NamePart: M.MessageDef<UninterpretedOption.NamePart.Strict, UninterpretedOption.NamePart.Value>,
    }

export const SourceCodeInfo = {
    Location: {},
} as unknown as
    M.MessageDef<SourceCodeInfo.Strict, SourceCodeInfo.Value> & {
        Location: M.MessageDef<SourceCodeInfo.Location.Strict, SourceCodeInfo.Location.Value>,
    }

export const GeneratedCodeInfo = {
    Annotation: {},
} as unknown as
    M.MessageDef<GeneratedCodeInfo.Strict, GeneratedCodeInfo.Value> & {
        Annotation: M.MessageDef<GeneratedCodeInfo.Annotation.Strict, GeneratedCodeInfo.Annotation.Value>,
    }

export namespace FileDescriptorSet {
    export type ProtoName = "google.protobuf.FileDescriptorSet";

    export type Strict = {
        // repeated FileDescriptorProto files = 1;
        readonly files: FileDescriptorProto.Strict[],
    }

    export type Loose = {
        // repeated FileDescriptorProto files = 1;
        readonly files?: FileDescriptorProto.Value[],
    }

    export type Value = Strict | Loose;
}

export namespace FileDescriptorProto {
    export type ProtoName = "google.protobuf.FileDescriptorProto";

    export type Strict = {
        // string name = 1;
        readonly name: string,
        // string package = 2;
        readonly package: string,
        // repeated string dependencies = 3;
        readonly dependencies: string[],
        // repeated int32 public_dependencies = 10;
        readonly publicDependencies: number[],
        // repeated int32 weak_dependencies = 11;
        readonly weakDependencies: number[],
        // repeated DescriptorProto message_types = 4;
        readonly messageTypes: DescriptorProto.Strict[],
        // repeated EnumDescriptorProto enum_types = 5;
        readonly enumTypes: EnumDescriptorProto.Strict[],
        // repeated ServiceDescriptorProto services = 6;
        readonly services: ServiceDescriptorProto.Strict[],
        // repeated FieldDescriptorProto extensions = 7;
        readonly extensions: FieldDescriptorProto.Strict[],
        // FileOptions options = 8;
        readonly options: FileOptions.Strict | undefined,
        // SourceCodeInfo source_code_info = 9;
        readonly sourceCodeInfo: SourceCodeInfo.Strict | undefined,
        // string syntax = 12;
        readonly syntax: string,
    }

    export type Loose = {
        // string name = 1;
        readonly name?: string,
        // string package = 2;
        readonly package?: string,
        // repeated string dependencies = 3;
        readonly dependencies?: string[],
        // repeated int32 public_dependencies = 10;
        readonly publicDependencies?: number[],
        // repeated int32 weak_dependencies = 11;
        readonly weakDependencies?: number[],
        // repeated DescriptorProto message_types = 4;
        readonly messageTypes?: DescriptorProto.Value[],
        // repeated EnumDescriptorProto enum_types = 5;
        readonly enumTypes?: EnumDescriptorProto.Value[],
        // repeated ServiceDescriptorProto services = 6;
        readonly services?: ServiceDescriptorProto.Value[],
        // repeated FieldDescriptorProto extensions = 7;
        readonly extensions?: FieldDescriptorProto.Value[],
        // FileOptions options = 8;
        readonly options?: FileOptions.Value,
        // SourceCodeInfo source_code_info = 9;
        readonly sourceCodeInfo?: SourceCodeInfo.Value,
        // string syntax = 12;
        readonly syntax?: string,
    }

    export type Value = Strict | Loose;
}

export namespace DescriptorProto {
    export type ProtoName = "google.protobuf.DescriptorProto";

    export type Strict = {
        // string name = 1;
        readonly name: string,
        // repeated FieldDescriptorProto fields = 2;
        readonly fields: FieldDescriptorProto.Strict[],
        // repeated FieldDescriptorProto extensions = 6;
        readonly extensions: FieldDescriptorProto.Strict[],
        // repeated DescriptorProto nested_types = 3;
        readonly nestedTypes: DescriptorProto.Strict[],
        // repeated EnumDescriptorProto enum_types = 4;
        readonly enumTypes: EnumDescriptorProto.Strict[],
        // repeated ExtensionRange extension_ranges = 5;
        readonly extensionRanges: ExtensionRange.Strict[],
        // repeated OneofDescriptorProto oneof_decls = 8;
        readonly oneofDecls: OneofDescriptorProto.Strict[],
        // MessageOptions options = 7;
        readonly options: MessageOptions.Strict | undefined,
        // repeated ReservedRange reserved_ranges = 9;
        readonly reservedRanges: ReservedRange.Strict[],
        // repeated string reserved_names = 10;
        readonly reservedNames: string[],
    }

    export type Loose = {
        // string name = 1;
        readonly name?: string,
        // repeated FieldDescriptorProto fields = 2;
        readonly fields?: FieldDescriptorProto.Value[],
        // repeated FieldDescriptorProto extensions = 6;
        readonly extensions?: FieldDescriptorProto.Value[],
        // repeated DescriptorProto nested_types = 3;
        readonly nestedTypes?: DescriptorProto.Value[],
        // repeated EnumDescriptorProto enum_types = 4;
        readonly enumTypes?: EnumDescriptorProto.Value[],
        // repeated ExtensionRange extension_ranges = 5;
        readonly extensionRanges?: ExtensionRange.Value[],
        // repeated OneofDescriptorProto oneof_decls = 8;
        readonly oneofDecls?: OneofDescriptorProto.Value[],
        // MessageOptions options = 7;
        readonly options?: MessageOptions.Value,
        // repeated ReservedRange reserved_ranges = 9;
        readonly reservedRanges?: ReservedRange.Value[],
        // repeated string reserved_names = 10;
        readonly reservedNames?: string[],
    }

    export type Value = Strict | Loose;

    export namespace ExtensionRange {
        export type ProtoName = "google.protobuf.DescriptorProto.ExtensionRange";

        export type Strict = {
            // int32 start = 1;
            readonly start: number,
            // int32 end = 2;
            readonly end: number,
            // ExtensionRangeOptions options = 3;
            readonly options: ExtensionRangeOptions.Strict | undefined,
        }

        export type Loose = {
            // int32 start = 1;
            readonly start?: number,
            // int32 end = 2;
            readonly end?: number,
            // ExtensionRangeOptions options = 3;
            readonly options?: ExtensionRangeOptions.Value,
        }

        export type Value = Strict | Loose;
    }

    export namespace ReservedRange {
        export type ProtoName = "google.protobuf.DescriptorProto.ReservedRange";

        export type Strict = {
            // int32 start = 1;
            readonly start: number,
            // int32 end = 2;
            readonly end: number,
        }

        export type Loose = {
            // int32 start = 1;
            readonly start?: number,
            // int32 end = 2;
            readonly end?: number,
        }

        export type Value = Strict | Loose;
    }
}

export namespace ExtensionRangeOptions {
    export type ProtoName = "google.protobuf.ExtensionRangeOptions";

    export type Strict = {
        // repeated UninterpretedOption uninterpreted_options = 999;
        readonly uninterpretedOptions: UninterpretedOption.Strict[],
    }

    export type Loose = {
        // repeated UninterpretedOption uninterpreted_options = 999;
        readonly uninterpretedOptions?: UninterpretedOption.Value[],
    }

    export type Value = Strict | Loose;
}

export namespace FieldDescriptorProto {
    export type ProtoName = "google.protobuf.FieldDescriptorProto";

    type IsoneofStrict = { isoneofCase: "" }
        // int32 oneof_index = 9;
        | { isoneofCase: "oneofIndex", oneofIndex: number }

    export type Strict = {
        // string name = 1;
        readonly name: string,
        // int32 number = 3;
        readonly number: number,
        // Label label = 4;
        readonly label: Label,
        // Type type = 5;
        readonly type: Type,
        // string type_name = 6;
        readonly typeName: string,
        // string extendee = 2;
        readonly extendee: string,
        // string default_value = 7;
        readonly defaultValue: string,
        // string json_name = 10;
        readonly jsonName: string,
        // FieldOptions options = 8;
        readonly options: FieldOptions.Strict | undefined,
    } & IsoneofStrict

    type IsoneofLoose = {}
        // int32 oneof_index = 9;
        | { oneofIndex: number | undefined }

    export type Loose = {
        // string name = 1;
        readonly name?: string,
        // int32 number = 3;
        readonly number?: number,
        // Label label = 4;
        readonly label?: Label.Value,
        // Type type = 5;
        readonly type?: Type.Value,
        // string type_name = 6;
        readonly typeName?: string,
        // string extendee = 2;
        readonly extendee?: string,
        // string default_value = 7;
        readonly defaultValue?: string,
        // string json_name = 10;
        readonly jsonName?: string,
        // FieldOptions options = 8;
        readonly options?: FieldOptions.Value,
    } & IsoneofLoose

    export type Value = Strict | Loose;

    export namespace Type {
        export type ProtoName = "google.protobuf.FieldDescriptorProto.Type"
        export type Def = {
            "Unspecified": 0,
            "Double": 1,
            "Float": 2,
            "Int64": 3,
            "Uint64": 4,
            "Int32": 5,
            "Fixed64": 6,
            "Fixed32": 7,
            "Bool": 8,
            "String": 9,
            "Group": 10,
            "Message": 11,
            "Bytes": 12,
            "Uint32": 13,
            "Enum": 14,
            "Sfixed32": 15,
            "Sfixed64": 16,
            "Sint32": 17,
            "Sint64": 18,
        }

        export type Unspecified = E.Value<ProtoName, Def, "Unspecified">
        export type Double = E.Value<ProtoName, Def, "Double">
        export type Float = E.Value<ProtoName, Def, "Float">
        export type Int64 = E.Value<ProtoName, Def, "Int64">
        export type Uint64 = E.Value<ProtoName, Def, "Uint64">
        export type Int32 = E.Value<ProtoName, Def, "Int32">
        export type Fixed64 = E.Value<ProtoName, Def, "Fixed64">
        export type Fixed32 = E.Value<ProtoName, Def, "Fixed32">
        export type Bool = E.Value<ProtoName, Def, "Bool">
        export type String = E.Value<ProtoName, Def, "String">
        export type Group = E.Value<ProtoName, Def, "Group">
        export type Message = E.Value<ProtoName, Def, "Message">
        export type Bytes = E.Value<ProtoName, Def, "Bytes">
        export type Uint32 = E.Value<ProtoName, Def, "Uint32">
        export type Enum = E.Value<ProtoName, Def, "Enum">
        export type Sfixed32 = E.Value<ProtoName, Def, "Sfixed32">
        export type Sfixed64 = E.Value<ProtoName, Def, "Sfixed64">
        export type Sint32 = E.Value<ProtoName, Def, "Sint32">
        export type Sint64 = E.Value<ProtoName, Def, "Sint64">

        export type Strict = E.EnumValue<ProtoName, E.Literal<Def>>;
        export type Value = Strict | E.Literal<Def>;
    }
    export type Type = Type.Strict;

    export namespace Label {
        export type ProtoName = "google.protobuf.FieldDescriptorProto.Label"
        export type Def = {
            "Unspecified": 0,
            "Optional": 1,
            "Required": 2,
            "Repeated": 3,
        }

        export type Unspecified = E.Value<ProtoName, Def, "Unspecified">
        export type Optional = E.Value<ProtoName, Def, "Optional">
        export type Required = E.Value<ProtoName, Def, "Required">
        export type Repeated = E.Value<ProtoName, Def, "Repeated">

        export type Strict = E.EnumValue<ProtoName, E.Literal<Def>>;
        export type Value = Strict | E.Literal<Def>;
    }
    export type Label = Label.Strict;
}

export namespace OneofDescriptorProto {
    export type ProtoName = "google.protobuf.OneofDescriptorProto";

    export type Strict = {
        // string name = 1;
        readonly name: string,
        // OneofOptions options = 2;
        readonly options: OneofOptions.Strict | undefined,
    }

    export type Loose = {
        // string name = 1;
        readonly name?: string,
        // OneofOptions options = 2;
        readonly options?: OneofOptions.Value,
    }

    export type Value = Strict | Loose;
}

export namespace EnumDescriptorProto {
    export type ProtoName = "google.protobuf.EnumDescriptorProto";

    export type Strict = {
        // string name = 1;
        readonly name: string,
        // repeated EnumValueDescriptorProto values = 2;
        readonly values: EnumValueDescriptorProto.Strict[],
        // EnumOptions options = 3;
        readonly options: EnumOptions.Strict | undefined,
        // repeated EnumReservedRange reserved_ranges = 4;
        readonly reservedRanges: EnumReservedRange.Strict[],
        // repeated string reserved_names = 5;
        readonly reservedNames: string[],
    }

    export type Loose = {
        // string name = 1;
        readonly name?: string,
        // repeated EnumValueDescriptorProto values = 2;
        readonly values?: EnumValueDescriptorProto.Value[],
        // EnumOptions options = 3;
        readonly options?: EnumOptions.Value,
        // repeated EnumReservedRange reserved_ranges = 4;
        readonly reservedRanges?: EnumReservedRange.Value[],
        // repeated string reserved_names = 5;
        readonly reservedNames?: string[],
    }

    export type Value = Strict | Loose;

    export namespace EnumReservedRange {
        export type ProtoName = "google.protobuf.EnumDescriptorProto.EnumReservedRange";

        export type Strict = {
            // int32 start = 1;
            readonly start: number,
            // int32 end = 2;
            readonly end: number,
        }

        export type Loose = {
            // int32 start = 1;
            readonly start?: number,
            // int32 end = 2;
            readonly end?: number,
        }

        export type Value = Strict | Loose;
    }
}

export namespace EnumValueDescriptorProto {
    export type ProtoName = "google.protobuf.EnumValueDescriptorProto";

    export type Strict = {
        // string name = 1;
        readonly name: string,
        // int32 number = 2;
        readonly number: number,
        // EnumValueOptions options = 3;
        readonly options: EnumValueOptions.Strict | undefined,
    }

    export type Loose = {
        // string name = 1;
        readonly name?: string,
        // int32 number = 2;
        readonly number?: number,
        // EnumValueOptions options = 3;
        readonly options?: EnumValueOptions.Value,
    }

    export type Value = Strict | Loose;
}

export namespace ServiceDescriptorProto {
    export type ProtoName = "google.protobuf.ServiceDescriptorProto";

    export type Strict = {
        // string name = 1;
        readonly name: string,
        // repeated MethodDescriptorProto methods = 2;
        readonly methods: MethodDescriptorProto.Strict[],
        // ServiceOptions options = 3;
        readonly options: ServiceOptions.Strict | undefined,
    }

    export type Loose = {
        // string name = 1;
        readonly name?: string,
        // repeated MethodDescriptorProto methods = 2;
        readonly methods?: MethodDescriptorProto.Value[],
        // ServiceOptions options = 3;
        readonly options?: ServiceOptions.Value,
    }

    export type Value = Strict | Loose;
}

export namespace MethodDescriptorProto {
    export type ProtoName = "google.protobuf.MethodDescriptorProto";

    export type Strict = {
        // string name = 1;
        readonly name: string,
        // string input_type = 2;
        readonly inputType: string,
        // string output_type = 3;
        readonly outputType: string,
        // MethodOptions options = 4;
        readonly options: MethodOptions.Strict | undefined,
        // bool client_streaming = 5;
        readonly clientStreaming: boolean,
        // bool server_streaming = 6;
        readonly serverStreaming: boolean,
    }

    export type Loose = {
        // string name = 1;
        readonly name?: string,
        // string input_type = 2;
        readonly inputType?: string,
        // string output_type = 3;
        readonly outputType?: string,
        // MethodOptions options = 4;
        readonly options?: MethodOptions.Value,
        // bool client_streaming = 5;
        readonly clientStreaming?: boolean,
        // bool server_streaming = 6;
        readonly serverStreaming?: boolean,
    }

    export type Value = Strict | Loose;
}

export namespace FileOptions {
    export type ProtoName = "google.protobuf.FileOptions";

    export type Strict = {
        // string java_package = 1;
        readonly javaPackage: string,
        // string java_outer_classname = 8;
        readonly javaOuterClassname: string,
        // bool java_multiple_files = 10;
        readonly javaMultipleFiles: boolean,
        // bool java_generate_equals_and_hash = 20;
        readonly javaGenerateEqualsAndHash: boolean,
        // bool java_string_check_utf8 = 27;
        readonly javaStringCheckUtf8: boolean,
        // OptimizeMode optimize_for = 9;
        readonly optimizeFor: OptimizeMode,
        // string go_package = 11;
        readonly goPackage: string,
        // bool cc_generic_services = 16;
        readonly ccGenericServices: boolean,
        // bool java_generic_services = 17;
        readonly javaGenericServices: boolean,
        // bool py_generic_services = 18;
        readonly pyGenericServices: boolean,
        // bool php_generic_services = 42;
        readonly phpGenericServices: boolean,
        // bool deprecated = 23;
        readonly deprecated: boolean,
        // bool cc_enable_arenas = 31;
        readonly ccEnableArenas: boolean,
        // string objc_class_prefix = 36;
        readonly objcClassPrefix: string,
        // string csharp_namespace = 37;
        readonly csharpNamespace: string,
        // string swift_prefix = 39;
        readonly swiftPrefix: string,
        // string php_class_prefix = 40;
        readonly phpClassPrefix: string,
        // string php_namespace = 41;
        readonly phpNamespace: string,
        // string php_metadata_namespace = 44;
        readonly phpMetadataNamespace: string,
        // string ruby_package = 45;
        readonly rubyPackage: string,
        // repeated UninterpretedOption uninterpreted_options = 999;
        readonly uninterpretedOptions: UninterpretedOption.Strict[],
    }

    export type Loose = {
        // string java_package = 1;
        readonly javaPackage?: string,
        // string java_outer_classname = 8;
        readonly javaOuterClassname?: string,
        // bool java_multiple_files = 10;
        readonly javaMultipleFiles?: boolean,
        // bool java_generate_equals_and_hash = 20;
        readonly javaGenerateEqualsAndHash?: boolean,
        // bool java_string_check_utf8 = 27;
        readonly javaStringCheckUtf8?: boolean,
        // OptimizeMode optimize_for = 9;
        readonly optimizeFor?: OptimizeMode.Value,
        // string go_package = 11;
        readonly goPackage?: string,
        // bool cc_generic_services = 16;
        readonly ccGenericServices?: boolean,
        // bool java_generic_services = 17;
        readonly javaGenericServices?: boolean,
        // bool py_generic_services = 18;
        readonly pyGenericServices?: boolean,
        // bool php_generic_services = 42;
        readonly phpGenericServices?: boolean,
        // bool deprecated = 23;
        readonly deprecated?: boolean,
        // bool cc_enable_arenas = 31;
        readonly ccEnableArenas?: boolean,
        // string objc_class_prefix = 36;
        readonly objcClassPrefix?: string,
        // string csharp_namespace = 37;
        readonly csharpNamespace?: string,
        // string swift_prefix = 39;
        readonly swiftPrefix?: string,
        // string php_class_prefix = 40;
        readonly phpClassPrefix?: string,
        // string php_namespace = 41;
        readonly phpNamespace?: string,
        // string php_metadata_namespace = 44;
        readonly phpMetadataNamespace?: string,
        // string ruby_package = 45;
        readonly rubyPackage?: string,
        // repeated UninterpretedOption uninterpreted_options = 999;
        readonly uninterpretedOptions?: UninterpretedOption.Value[],
    }

    export type Value = Strict | Loose;

    export namespace OptimizeMode {
        export type ProtoName = "google.protobuf.FileOptions.OptimizeMode"
        export type Def = {
            "Unspecified": 0,
            "Speed": 1,
            "CodeSize": 2,
            "LiteRuntime": 3,
        }

        export type Unspecified = E.Value<ProtoName, Def, "Unspecified">
        export type Speed = E.Value<ProtoName, Def, "Speed">
        export type CodeSize = E.Value<ProtoName, Def, "CodeSize">
        export type LiteRuntime = E.Value<ProtoName, Def, "LiteRuntime">

        export type Strict = E.EnumValue<ProtoName, E.Literal<Def>>;
        export type Value = Strict | E.Literal<Def>;
    }
    export type OptimizeMode = OptimizeMode.Strict;
}

export namespace MessageOptions {
    export type ProtoName = "google.protobuf.MessageOptions";

    export type Strict = {
        // bool message_set_wire_format = 1;
        readonly messageSetWireFormat: boolean,
        // bool no_standard_descriptor_accessor = 2;
        readonly noStandardDescriptorAccessor: boolean,
        // bool deprecated = 3;
        readonly deprecated: boolean,
        // bool map_entry = 7;
        readonly mapEntry: boolean,
        // repeated UninterpretedOption uninterpreted_options = 999;
        readonly uninterpretedOptions: UninterpretedOption.Strict[],
    }

    export type Loose = {
        // bool message_set_wire_format = 1;
        readonly messageSetWireFormat?: boolean,
        // bool no_standard_descriptor_accessor = 2;
        readonly noStandardDescriptorAccessor?: boolean,
        // bool deprecated = 3;
        readonly deprecated?: boolean,
        // bool map_entry = 7;
        readonly mapEntry?: boolean,
        // repeated UninterpretedOption uninterpreted_options = 999;
        readonly uninterpretedOptions?: UninterpretedOption.Value[],
    }

    export type Value = Strict | Loose;
}

export namespace FieldOptions {
    export type ProtoName = "google.protobuf.FieldOptions";

    export type Strict = {
        // CType ctype = 1;
        readonly ctype: CType,
        // bool packed = 2;
        readonly packed: boolean,
        // JSType jstype = 6;
        readonly jstype: JSType,
        // bool lazy = 5;
        readonly lazy: boolean,
        // bool deprecated = 3;
        readonly deprecated: boolean,
        // bool weak = 10;
        readonly weak: boolean,
        // repeated UninterpretedOption uninterpreted_options = 999;
        readonly uninterpretedOptions: UninterpretedOption.Strict[],
    }

    export type Loose = {
        // CType ctype = 1;
        readonly ctype?: CType.Value,
        // bool packed = 2;
        readonly packed?: boolean,
        // JSType jstype = 6;
        readonly jstype?: JSType.Value,
        // bool lazy = 5;
        readonly lazy?: boolean,
        // bool deprecated = 3;
        readonly deprecated?: boolean,
        // bool weak = 10;
        readonly weak?: boolean,
        // repeated UninterpretedOption uninterpreted_options = 999;
        readonly uninterpretedOptions?: UninterpretedOption.Value[],
    }

    export type Value = Strict | Loose;

    export namespace CType {
        export type ProtoName = "google.protobuf.FieldOptions.CType"
        export type Def = {
            "String": 0,
            "Cord": 1,
            "StringPiece": 2,
        }

        export type String = E.Value<ProtoName, Def, "String">
        export type Cord = E.Value<ProtoName, Def, "Cord">
        export type StringPiece = E.Value<ProtoName, Def, "StringPiece">

        export type Strict = E.EnumValue<ProtoName, E.Literal<Def>>;
        export type Value = Strict | E.Literal<Def>;
    }
    export type CType = CType.Strict;

    export namespace JSType {
        export type ProtoName = "google.protobuf.FieldOptions.JSType"
        export type Def = {
            "JsNormal": 0,
            "JsString": 1,
            "JsNumber": 2,
        }

        export type JsNormal = E.Value<ProtoName, Def, "JsNormal">
        export type JsString = E.Value<ProtoName, Def, "JsString">
        export type JsNumber = E.Value<ProtoName, Def, "JsNumber">

        export type Strict = E.EnumValue<ProtoName, E.Literal<Def>>;
        export type Value = Strict | E.Literal<Def>;
    }
    export type JSType = JSType.Strict;
}

export namespace OneofOptions {
    export type ProtoName = "google.protobuf.OneofOptions";

    export type Strict = {
        // repeated UninterpretedOption uninterpreted_options = 999;
        readonly uninterpretedOptions: UninterpretedOption.Strict[],
    }

    export type Loose = {
        // repeated UninterpretedOption uninterpreted_options = 999;
        readonly uninterpretedOptions?: UninterpretedOption.Value[],
    }

    export type Value = Strict | Loose;
}

export namespace EnumOptions {
    export type ProtoName = "google.protobuf.EnumOptions";

    export type Strict = {
        // bool allow_alias = 2;
        readonly allowAlias: boolean,
        // bool deprecated = 3;
        readonly deprecated: boolean,
        // repeated UninterpretedOption uninterpreted_options = 999;
        readonly uninterpretedOptions: UninterpretedOption.Strict[],
    }

    export type Loose = {
        // bool allow_alias = 2;
        readonly allowAlias?: boolean,
        // bool deprecated = 3;
        readonly deprecated?: boolean,
        // repeated UninterpretedOption uninterpreted_options = 999;
        readonly uninterpretedOptions?: UninterpretedOption.Value[],
    }

    export type Value = Strict | Loose;
}

export namespace EnumValueOptions {
    export type ProtoName = "google.protobuf.EnumValueOptions";

    export type Strict = {
        // bool deprecated = 1;
        readonly deprecated: boolean,
        // repeated UninterpretedOption uninterpreted_options = 999;
        readonly uninterpretedOptions: UninterpretedOption.Strict[],
    }

    export type Loose = {
        // bool deprecated = 1;
        readonly deprecated?: boolean,
        // repeated UninterpretedOption uninterpreted_options = 999;
        readonly uninterpretedOptions?: UninterpretedOption.Value[],
    }

    export type Value = Strict | Loose;
}

export namespace ServiceOptions {
    export type ProtoName = "google.protobuf.ServiceOptions";

    export type Strict = {
        // bool deprecated = 33;
        readonly deprecated: boolean,
        // repeated UninterpretedOption uninterpreted_options = 999;
        readonly uninterpretedOptions: UninterpretedOption.Strict[],
    }

    export type Loose = {
        // bool deprecated = 33;
        readonly deprecated?: boolean,
        // repeated UninterpretedOption uninterpreted_options = 999;
        readonly uninterpretedOptions?: UninterpretedOption.Value[],
    }

    export type Value = Strict | Loose;
}

export namespace MethodOptions {
    export type ProtoName = "google.protobuf.MethodOptions";

    export type Strict = {
        // bool deprecated = 33;
        readonly deprecated: boolean,
        // IdempotencyLevel idempotency_level = 34;
        readonly idempotencyLevel: IdempotencyLevel,
        // repeated UninterpretedOption uninterpreted_options = 999;
        readonly uninterpretedOptions: UninterpretedOption.Strict[],
    }

    export type Loose = {
        // bool deprecated = 33;
        readonly deprecated?: boolean,
        // IdempotencyLevel idempotency_level = 34;
        readonly idempotencyLevel?: IdempotencyLevel.Value,
        // repeated UninterpretedOption uninterpreted_options = 999;
        readonly uninterpretedOptions?: UninterpretedOption.Value[],
    }

    export type Value = Strict | Loose;

    export namespace IdempotencyLevel {
        export type ProtoName = "google.protobuf.MethodOptions.IdempotencyLevel"
        export type Def = {
            "IdempotencyUnknown": 0,
            "NoSideEffects": 1,
            "Idempotent": 2,
        }

        export type IdempotencyUnknown = E.Value<ProtoName, Def, "IdempotencyUnknown">
        export type NoSideEffects = E.Value<ProtoName, Def, "NoSideEffects">
        export type Idempotent = E.Value<ProtoName, Def, "Idempotent">

        export type Strict = E.EnumValue<ProtoName, E.Literal<Def>>;
        export type Value = Strict | E.Literal<Def>;
    }
    export type IdempotencyLevel = IdempotencyLevel.Strict;
}

export namespace UninterpretedOption {
    export type ProtoName = "google.protobuf.UninterpretedOption";

    type ValueStrict = { valueCase: "" }
        // string identifier_value = 3;
        | { valueCase: "identifierValue", identifierValue: string }
        // uint64 positive_int_value = 4;
        | { valueCase: "positiveIntValue", positiveIntValue: string }
        // int64 negative_int_value = 5;
        | { valueCase: "negativeIntValue", negativeIntValue: string }
        // double double_value = 6;
        | { valueCase: "doubleValue", doubleValue: number }
        // bytes string_value = 7;
        | { valueCase: "stringValue", stringValue: ArrayBuffer }
        // string aggregate_value = 8;
        | { valueCase: "aggregateValue", aggregateValue: string }

    export type Strict = {
        // repeated NamePart names = 2;
        readonly names: NamePart.Strict[],
    } & ValueStrict

    type ValueLoose = {}
        // string identifier_value = 3;
        | { identifierValue: string | undefined }
        // uint64 positive_int_value = 4;
        | { positiveIntValue: (string | number) | undefined }
        // int64 negative_int_value = 5;
        | { negativeIntValue: (string | number) | undefined }
        // double double_value = 6;
        | { doubleValue: number | undefined }
        // bytes string_value = 7;
        | { stringValue: ArrayBuffer | undefined }
        // string aggregate_value = 8;
        | { aggregateValue: string | undefined }

    export type Loose = {
        // repeated NamePart names = 2;
        readonly names?: NamePart.Value[],
    } & ValueLoose

    export type Value = Strict | Loose;

    export namespace NamePart {
        export type ProtoName = "google.protobuf.UninterpretedOption.NamePart";

        export type Strict = {
            // string name_part = 1;
            readonly namePart: string,
            // bool is_extension = 2;
            readonly isExtension: boolean,
        }

        export type Loose = {
            // string name_part = 1;
            readonly namePart?: string,
            // bool is_extension = 2;
            readonly isExtension?: boolean,
        }

        export type Value = Strict | Loose;
    }
}

export namespace SourceCodeInfo {
    export type ProtoName = "google.protobuf.SourceCodeInfo";

    export type Strict = {
        // repeated Location location = 1;
        readonly location: Location.Strict[],
    }

    export type Loose = {
        // repeated Location location = 1;
        readonly location?: Location.Value[],
    }

    export type Value = Strict | Loose;

    export namespace Location {
        export type ProtoName = "google.protobuf.SourceCodeInfo.Location";

        export type Strict = {
            // repeated int32 paths = 1;
            readonly paths: number[],
            // repeated int32 spans = 2;
            readonly spans: number[],
            // string leading_comments = 3;
            readonly leadingComments: string,
            // string trailing_comments = 4;
            readonly trailingComments: string,
            // repeated string leading_detached_comments = 6;
            readonly leadingDetachedComments: string[],
        }

        export type Loose = {
            // repeated int32 paths = 1;
            readonly paths?: number[],
            // repeated int32 spans = 2;
            readonly spans?: number[],
            // string leading_comments = 3;
            readonly leadingComments?: string,
            // string trailing_comments = 4;
            readonly trailingComments?: string,
            // repeated string leading_detached_comments = 6;
            readonly leadingDetachedComments?: string[],
        }

        export type Value = Strict | Loose;
    }
}

export namespace GeneratedCodeInfo {
    export type ProtoName = "google.protobuf.GeneratedCodeInfo";

    export type Strict = {
        // repeated Annotation annotations = 1;
        readonly annotations: Annotation.Strict[],
    }

    export type Loose = {
        // repeated Annotation annotations = 1;
        readonly annotations?: Annotation.Value[],
    }

    export type Value = Strict | Loose;

    export namespace Annotation {
        export type ProtoName = "google.protobuf.GeneratedCodeInfo.Annotation";

        export type Strict = {
            // repeated int32 paths = 1;
            readonly paths: number[],
            // string source_file = 2;
            readonly sourceFile: string,
            // int32 begin = 3;
            readonly begin: number,
            // int32 end = 4;
            readonly end: number,
        }

        export type Loose = {
            // repeated int32 paths = 1;
            readonly paths?: number[],
            // string source_file = 2;
            readonly sourceFile?: string,
            // int32 begin = 3;
            readonly begin?: number,
            // int32 end = 4;
            readonly end?: number,
        }

        export type Value = Strict | Loose;
    }
}

M.define(FileDescriptorSet, {
    writeContents: (w, msg) => {
        if ('files' in msg) { W.repeated(w, FileDescriptorProto.write, msg.files, 1); }
    },
    fields: [
        [1, "files", F.repeated(() => FileDescriptorProto)],
    ],
})

M.define(FileDescriptorProto, {
    writeContents: (w, msg) => {
        if ('name' in msg) { W.string(w, msg.name, 1); }
        if ('package' in msg) { W.string(w, msg.package, 2); }
        if ('dependencies' in msg) { W.repeated(w, W.string, msg.dependencies, 3); }
        if ('publicDependencies' in msg) { W.packed(w, W.int32, msg.publicDependencies, 10); }
        if ('weakDependencies' in msg) { W.packed(w, W.int32, msg.weakDependencies, 11); }
        if ('messageTypes' in msg) { W.repeated(w, DescriptorProto.write, msg.messageTypes, 4); }
        if ('enumTypes' in msg) { W.repeated(w, EnumDescriptorProto.write, msg.enumTypes, 5); }
        if ('services' in msg) { W.repeated(w, ServiceDescriptorProto.write, msg.services, 6); }
        if ('extensions' in msg) { W.repeated(w, FieldDescriptorProto.write, msg.extensions, 7); }
        if ('options' in msg) { FileOptions.write(w, msg.options, 8); }
        if ('sourceCodeInfo' in msg) { SourceCodeInfo.write(w, msg.sourceCodeInfo, 9); }
        if ('syntax' in msg) { W.string(w, msg.syntax, 12); }
    },
    fields: [
        [1, "name", F.string],
        [2, "package", F.string],
        [3, "dependencies", F.repeated(F.string)],
        [10, "publicDependencies", F.repeated(F.int32)],
        [11, "weakDependencies", F.repeated(F.int32)],
        [4, "messageTypes", F.repeated(() => DescriptorProto)],
        [5, "enumTypes", F.repeated(() => EnumDescriptorProto)],
        [6, "services", F.repeated(() => ServiceDescriptorProto)],
        [7, "extensions", F.repeated(() => FieldDescriptorProto)],
        [8, "options", () => FileOptions],
        [9, "sourceCodeInfo", () => SourceCodeInfo],
        [12, "syntax", F.string],
    ],
})

M.define(DescriptorProto, {
    writeContents: (w, msg) => {
        if ('name' in msg) { W.string(w, msg.name, 1); }
        if ('fields' in msg) { W.repeated(w, FieldDescriptorProto.write, msg.fields, 2); }
        if ('extensions' in msg) { W.repeated(w, FieldDescriptorProto.write, msg.extensions, 6); }
        if ('nestedTypes' in msg) { W.repeated(w, DescriptorProto.write, msg.nestedTypes, 3); }
        if ('enumTypes' in msg) { W.repeated(w, EnumDescriptorProto.write, msg.enumTypes, 4); }
        if ('extensionRanges' in msg) { W.repeated(w, DescriptorProto.ExtensionRange.write, msg.extensionRanges, 5); }
        if ('oneofDecls' in msg) { W.repeated(w, OneofDescriptorProto.write, msg.oneofDecls, 8); }
        if ('options' in msg) { MessageOptions.write(w, msg.options, 7); }
        if ('reservedRanges' in msg) { W.repeated(w, DescriptorProto.ReservedRange.write, msg.reservedRanges, 9); }
        if ('reservedNames' in msg) { W.repeated(w, W.string, msg.reservedNames, 10); }
    },
    fields: [
        [1, "name", F.string],
        [2, "fields", F.repeated(() => FieldDescriptorProto)],
        [6, "extensions", F.repeated(() => FieldDescriptorProto)],
        [3, "nestedTypes", F.repeated(() => DescriptorProto)],
        [4, "enumTypes", F.repeated(() => EnumDescriptorProto)],
        [5, "extensionRanges", F.repeated(() => DescriptorProto.ExtensionRange)],
        [8, "oneofDecls", F.repeated(() => OneofDescriptorProto)],
        [7, "options", () => MessageOptions],
        [9, "reservedRanges", F.repeated(() => DescriptorProto.ReservedRange)],
        [10, "reservedNames", F.repeated(F.string)],
    ],
})

M.define(DescriptorProto.ExtensionRange, {
    writeContents: (w, msg) => {
        if ('start' in msg) { W.int32(w, msg.start, 1); }
        if ('end' in msg) { W.int32(w, msg.end, 2); }
        if ('options' in msg) { ExtensionRangeOptions.write(w, msg.options, 3); }
    },
    fields: [
        [1, "start", F.int32],
        [2, "end", F.int32],
        [3, "options", () => ExtensionRangeOptions],
    ],
})

M.define(DescriptorProto.ReservedRange, {
    writeContents: (w, msg) => {
        if ('start' in msg) { W.int32(w, msg.start, 1); }
        if ('end' in msg) { W.int32(w, msg.end, 2); }
    },
    fields: [
        [1, "start", F.int32],
        [2, "end", F.int32],
    ],
})

M.define(ExtensionRangeOptions, {
    writeContents: (w, msg) => {
        if ('uninterpretedOptions' in msg) { W.repeated(w, UninterpretedOption.write, msg.uninterpretedOptions, 999); }
    },
    fields: [
        [999, "uninterpretedOptions", F.repeated(() => UninterpretedOption)],
    ],
})

M.define(FieldDescriptorProto, {
    writeContents: (w, msg) => {
        if ('name' in msg) { W.string(w, msg.name, 1); }
        if ('number' in msg) { W.int32(w, msg.number, 3); }
        if ('label' in msg) { FieldDescriptorProto.Label.write(w, msg.label, 4); }
        if ('type' in msg) { FieldDescriptorProto.Type.write(w, msg.type, 5); }
        if ('typeName' in msg) { W.string(w, msg.typeName, 6); }
        if ('extendee' in msg) { W.string(w, msg.extendee, 2); }
        if ('defaultValue' in msg) { W.string(w, msg.defaultValue, 7); }
        if ('jsonName' in msg) { W.string(w, msg.jsonName, 10); }
        if ('options' in msg) { FieldOptions.write(w, msg.options, 8); }
        if ("oneofIndex" in msg) { W.int32(w, msg.oneofIndex, 9); }
    },
    fields: [
        [1, "name", F.string],
        [3, "number", F.int32],
        [4, "label", () => FieldDescriptorProto.Label],
        [5, "type", () => FieldDescriptorProto.Type],
        [6, "typeName", F.string],
        [2, "extendee", F.string],
        [7, "defaultValue", F.string],
        [9, "oneofIndex", F.oneof("isoneof", F.int32)],
        [10, "jsonName", F.string],
        [8, "options", () => FieldOptions],
    ],
})

E.define(FieldDescriptorProto.Type, {
    "Unspecified": 0 as 0,
    "Double": 1 as 1,
    "Float": 2 as 2,
    "Int64": 3 as 3,
    "Uint64": 4 as 4,
    "Int32": 5 as 5,
    "Fixed64": 6 as 6,
    "Fixed32": 7 as 7,
    "Bool": 8 as 8,
    "String": 9 as 9,
    "Group": 10 as 10,
    "Message": 11 as 11,
    "Bytes": 12 as 12,
    "Uint32": 13 as 13,
    "Enum": 14 as 14,
    "Sfixed32": 15 as 15,
    "Sfixed64": 16 as 16,
    "Sint32": 17 as 17,
    "Sint64": 18 as 18,
});

E.define(FieldDescriptorProto.Label, {
    "Unspecified": 0 as 0,
    "Optional": 1 as 1,
    "Required": 2 as 2,
    "Repeated": 3 as 3,
});

M.define(OneofDescriptorProto, {
    writeContents: (w, msg) => {
        if ('name' in msg) { W.string(w, msg.name, 1); }
        if ('options' in msg) { OneofOptions.write(w, msg.options, 2); }
    },
    fields: [
        [1, "name", F.string],
        [2, "options", () => OneofOptions],
    ],
})

M.define(EnumDescriptorProto, {
    writeContents: (w, msg) => {
        if ('name' in msg) { W.string(w, msg.name, 1); }
        if ('values' in msg) { W.repeated(w, EnumValueDescriptorProto.write, msg.values, 2); }
        if ('options' in msg) { EnumOptions.write(w, msg.options, 3); }
        if ('reservedRanges' in msg) { W.repeated(w, EnumDescriptorProto.EnumReservedRange.write, msg.reservedRanges, 4); }
        if ('reservedNames' in msg) { W.repeated(w, W.string, msg.reservedNames, 5); }
    },
    fields: [
        [1, "name", F.string],
        [2, "values", F.repeated(() => EnumValueDescriptorProto)],
        [3, "options", () => EnumOptions],
        [4, "reservedRanges", F.repeated(() => EnumDescriptorProto.EnumReservedRange)],
        [5, "reservedNames", F.repeated(F.string)],
    ],
})

M.define(EnumDescriptorProto.EnumReservedRange, {
    writeContents: (w, msg) => {
        if ('start' in msg) { W.int32(w, msg.start, 1); }
        if ('end' in msg) { W.int32(w, msg.end, 2); }
    },
    fields: [
        [1, "start", F.int32],
        [2, "end", F.int32],
    ],
})

M.define(EnumValueDescriptorProto, {
    writeContents: (w, msg) => {
        if ('name' in msg) { W.string(w, msg.name, 1); }
        if ('number' in msg) { W.int32(w, msg.number, 2); }
        if ('options' in msg) { EnumValueOptions.write(w, msg.options, 3); }
    },
    fields: [
        [1, "name", F.string],
        [2, "number", F.int32],
        [3, "options", () => EnumValueOptions],
    ],
})

M.define(ServiceDescriptorProto, {
    writeContents: (w, msg) => {
        if ('name' in msg) { W.string(w, msg.name, 1); }
        if ('methods' in msg) { W.repeated(w, MethodDescriptorProto.write, msg.methods, 2); }
        if ('options' in msg) { ServiceOptions.write(w, msg.options, 3); }
    },
    fields: [
        [1, "name", F.string],
        [2, "methods", F.repeated(() => MethodDescriptorProto)],
        [3, "options", () => ServiceOptions],
    ],
})

M.define(MethodDescriptorProto, {
    writeContents: (w, msg) => {
        if ('name' in msg) { W.string(w, msg.name, 1); }
        if ('inputType' in msg) { W.string(w, msg.inputType, 2); }
        if ('outputType' in msg) { W.string(w, msg.outputType, 3); }
        if ('options' in msg) { MethodOptions.write(w, msg.options, 4); }
        if ('clientStreaming' in msg) { W.bool(w, msg.clientStreaming, 5); }
        if ('serverStreaming' in msg) { W.bool(w, msg.serverStreaming, 6); }
    },
    fields: [
        [1, "name", F.string],
        [2, "inputType", F.string],
        [3, "outputType", F.string],
        [4, "options", () => MethodOptions],
        [5, "clientStreaming", F.bool],
        [6, "serverStreaming", F.bool],
    ],
})

M.define(FileOptions, {
    writeContents: (w, msg) => {
        if ('javaPackage' in msg) { W.string(w, msg.javaPackage, 1); }
        if ('javaOuterClassname' in msg) { W.string(w, msg.javaOuterClassname, 8); }
        if ('javaMultipleFiles' in msg) { W.bool(w, msg.javaMultipleFiles, 10); }
        if ('javaGenerateEqualsAndHash' in msg) { W.bool(w, msg.javaGenerateEqualsAndHash, 20); }
        if ('javaStringCheckUtf8' in msg) { W.bool(w, msg.javaStringCheckUtf8, 27); }
        if ('optimizeFor' in msg) { FileOptions.OptimizeMode.write(w, msg.optimizeFor, 9); }
        if ('goPackage' in msg) { W.string(w, msg.goPackage, 11); }
        if ('ccGenericServices' in msg) { W.bool(w, msg.ccGenericServices, 16); }
        if ('javaGenericServices' in msg) { W.bool(w, msg.javaGenericServices, 17); }
        if ('pyGenericServices' in msg) { W.bool(w, msg.pyGenericServices, 18); }
        if ('phpGenericServices' in msg) { W.bool(w, msg.phpGenericServices, 42); }
        if ('deprecated' in msg) { W.bool(w, msg.deprecated, 23); }
        if ('ccEnableArenas' in msg) { W.bool(w, msg.ccEnableArenas, 31); }
        if ('objcClassPrefix' in msg) { W.string(w, msg.objcClassPrefix, 36); }
        if ('csharpNamespace' in msg) { W.string(w, msg.csharpNamespace, 37); }
        if ('swiftPrefix' in msg) { W.string(w, msg.swiftPrefix, 39); }
        if ('phpClassPrefix' in msg) { W.string(w, msg.phpClassPrefix, 40); }
        if ('phpNamespace' in msg) { W.string(w, msg.phpNamespace, 41); }
        if ('phpMetadataNamespace' in msg) { W.string(w, msg.phpMetadataNamespace, 44); }
        if ('rubyPackage' in msg) { W.string(w, msg.rubyPackage, 45); }
        if ('uninterpretedOptions' in msg) { W.repeated(w, UninterpretedOption.write, msg.uninterpretedOptions, 999); }
    },
    fields: [
        [1, "javaPackage", F.string],
        [8, "javaOuterClassname", F.string],
        [10, "javaMultipleFiles", F.bool],
        [20, "javaGenerateEqualsAndHash", F.bool],
        [27, "javaStringCheckUtf8", F.bool],
        [9, "optimizeFor", () => FileOptions.OptimizeMode],
        [11, "goPackage", F.string],
        [16, "ccGenericServices", F.bool],
        [17, "javaGenericServices", F.bool],
        [18, "pyGenericServices", F.bool],
        [42, "phpGenericServices", F.bool],
        [23, "deprecated", F.bool],
        [31, "ccEnableArenas", F.bool],
        [36, "objcClassPrefix", F.string],
        [37, "csharpNamespace", F.string],
        [39, "swiftPrefix", F.string],
        [40, "phpClassPrefix", F.string],
        [41, "phpNamespace", F.string],
        [44, "phpMetadataNamespace", F.string],
        [45, "rubyPackage", F.string],
        [999, "uninterpretedOptions", F.repeated(() => UninterpretedOption)],
    ],
})

E.define(FileOptions.OptimizeMode, {
    "Unspecified": 0 as 0,
    "Speed": 1 as 1,
    "CodeSize": 2 as 2,
    "LiteRuntime": 3 as 3,
});

M.define(MessageOptions, {
    writeContents: (w, msg) => {
        if ('messageSetWireFormat' in msg) { W.bool(w, msg.messageSetWireFormat, 1); }
        if ('noStandardDescriptorAccessor' in msg) { W.bool(w, msg.noStandardDescriptorAccessor, 2); }
        if ('deprecated' in msg) { W.bool(w, msg.deprecated, 3); }
        if ('mapEntry' in msg) { W.bool(w, msg.mapEntry, 7); }
        if ('uninterpretedOptions' in msg) { W.repeated(w, UninterpretedOption.write, msg.uninterpretedOptions, 999); }
    },
    fields: [
        [1, "messageSetWireFormat", F.bool],
        [2, "noStandardDescriptorAccessor", F.bool],
        [3, "deprecated", F.bool],
        [7, "mapEntry", F.bool],
        [999, "uninterpretedOptions", F.repeated(() => UninterpretedOption)],
    ],
})

M.define(FieldOptions, {
    writeContents: (w, msg) => {
        if ('ctype' in msg) { FieldOptions.CType.write(w, msg.ctype, 1); }
        if ('packed' in msg) { W.bool(w, msg.packed, 2); }
        if ('jstype' in msg) { FieldOptions.JSType.write(w, msg.jstype, 6); }
        if ('lazy' in msg) { W.bool(w, msg.lazy, 5); }
        if ('deprecated' in msg) { W.bool(w, msg.deprecated, 3); }
        if ('weak' in msg) { W.bool(w, msg.weak, 10); }
        if ('uninterpretedOptions' in msg) { W.repeated(w, UninterpretedOption.write, msg.uninterpretedOptions, 999); }
    },
    fields: [
        [1, "ctype", () => FieldOptions.CType],
        [2, "packed", F.bool],
        [6, "jstype", () => FieldOptions.JSType],
        [5, "lazy", F.bool],
        [3, "deprecated", F.bool],
        [10, "weak", F.bool],
        [999, "uninterpretedOptions", F.repeated(() => UninterpretedOption)],
    ],
})

E.define(FieldOptions.CType, {
    "String": 0 as 0,
    "Cord": 1 as 1,
    "StringPiece": 2 as 2,
});

E.define(FieldOptions.JSType, {
    "JsNormal": 0 as 0,
    "JsString": 1 as 1,
    "JsNumber": 2 as 2,
});

M.define(OneofOptions, {
    writeContents: (w, msg) => {
        if ('uninterpretedOptions' in msg) { W.repeated(w, UninterpretedOption.write, msg.uninterpretedOptions, 999); }
    },
    fields: [
        [999, "uninterpretedOptions", F.repeated(() => UninterpretedOption)],
    ],
})

M.define(EnumOptions, {
    writeContents: (w, msg) => {
        if ('allowAlias' in msg) { W.bool(w, msg.allowAlias, 2); }
        if ('deprecated' in msg) { W.bool(w, msg.deprecated, 3); }
        if ('uninterpretedOptions' in msg) { W.repeated(w, UninterpretedOption.write, msg.uninterpretedOptions, 999); }
    },
    fields: [
        [2, "allowAlias", F.bool],
        [3, "deprecated", F.bool],
        [999, "uninterpretedOptions", F.repeated(() => UninterpretedOption)],
    ],
})

M.define(EnumValueOptions, {
    writeContents: (w, msg) => {
        if ('deprecated' in msg) { W.bool(w, msg.deprecated, 1); }
        if ('uninterpretedOptions' in msg) { W.repeated(w, UninterpretedOption.write, msg.uninterpretedOptions, 999); }
    },
    fields: [
        [1, "deprecated", F.bool],
        [999, "uninterpretedOptions", F.repeated(() => UninterpretedOption)],
    ],
})

M.define(ServiceOptions, {
    writeContents: (w, msg) => {
        if ('deprecated' in msg) { W.bool(w, msg.deprecated, 33); }
        if ('uninterpretedOptions' in msg) { W.repeated(w, UninterpretedOption.write, msg.uninterpretedOptions, 999); }
    },
    fields: [
        [33, "deprecated", F.bool],
        [999, "uninterpretedOptions", F.repeated(() => UninterpretedOption)],
    ],
})

M.define(MethodOptions, {
    writeContents: (w, msg) => {
        if ('deprecated' in msg) { W.bool(w, msg.deprecated, 33); }
        if ('idempotencyLevel' in msg) { MethodOptions.IdempotencyLevel.write(w, msg.idempotencyLevel, 34); }
        if ('uninterpretedOptions' in msg) { W.repeated(w, UninterpretedOption.write, msg.uninterpretedOptions, 999); }
    },
    fields: [
        [33, "deprecated", F.bool],
        [34, "idempotencyLevel", () => MethodOptions.IdempotencyLevel],
        [999, "uninterpretedOptions", F.repeated(() => UninterpretedOption)],
    ],
})

E.define(MethodOptions.IdempotencyLevel, {
    "IdempotencyUnknown": 0 as 0,
    "NoSideEffects": 1 as 1,
    "Idempotent": 2 as 2,
});

M.define(UninterpretedOption, {
    writeContents: (w, msg) => {
        if ('names' in msg) { W.repeated(w, UninterpretedOption.NamePart.write, msg.names, 2); }
        if ("identifierValue" in msg) { W.string(w, msg.identifierValue, 3); }
        else if ("positiveIntValue" in msg) { W.uint64decimal(w, msg.positiveIntValue, 4); }
        else if ("negativeIntValue" in msg) { W.int64decimal(w, msg.negativeIntValue, 5); }
        else if ("doubleValue" in msg) { W.double(w, msg.doubleValue, 6); }
        else if ("stringValue" in msg) { W.bytes(w, msg.stringValue, 7); }
        else if ("aggregateValue" in msg) { W.string(w, msg.aggregateValue, 8); }
    },
    fields: [
        [2, "names", F.repeated(() => UninterpretedOption.NamePart)],
        [3, "identifierValue", F.oneof("value", F.string)],
        [4, "positiveIntValue", F.oneof("value", F.uint64decimal)],
        [5, "negativeIntValue", F.oneof("value", F.int64decimal)],
        [6, "doubleValue", F.oneof("value", F.double)],
        [7, "stringValue", F.oneof("value", F.bytes)],
        [8, "aggregateValue", F.oneof("value", F.string)],
    ],
})

M.define(UninterpretedOption.NamePart, {
    writeContents: (w, msg) => {
        if ('namePart' in msg) { W.string(w, msg.namePart, 1); }
        if ('isExtension' in msg) { W.bool(w, msg.isExtension, 2); }
    },
    fields: [
        [1, "namePart", F.string],
        [2, "isExtension", F.bool],
    ],
})

M.define(SourceCodeInfo, {
    writeContents: (w, msg) => {
        if ('location' in msg) { W.repeated(w, SourceCodeInfo.Location.write, msg.location, 1); }
    },
    fields: [
        [1, "location", F.repeated(() => SourceCodeInfo.Location)],
    ],
})

M.define(SourceCodeInfo.Location, {
    writeContents: (w, msg) => {
        if ('paths' in msg) { W.packed(w, W.int32, msg.paths, 1); }
        if ('spans' in msg) { W.packed(w, W.int32, msg.spans, 2); }
        if ('leadingComments' in msg) { W.string(w, msg.leadingComments, 3); }
        if ('trailingComments' in msg) { W.string(w, msg.trailingComments, 4); }
        if ('leadingDetachedComments' in msg) { W.repeated(w, W.string, msg.leadingDetachedComments, 6); }
    },
    fields: [
        [1, "paths", F.repeated(F.int32)],
        [2, "spans", F.repeated(F.int32)],
        [3, "leadingComments", F.string],
        [4, "trailingComments", F.string],
        [6, "leadingDetachedComments", F.repeated(F.string)],
    ],
})

M.define(GeneratedCodeInfo, {
    writeContents: (w, msg) => {
        if ('annotations' in msg) { W.repeated(w, GeneratedCodeInfo.Annotation.write, msg.annotations, 1); }
    },
    fields: [
        [1, "annotations", F.repeated(() => GeneratedCodeInfo.Annotation)],
    ],
})

M.define(GeneratedCodeInfo.Annotation, {
    writeContents: (w, msg) => {
        if ('paths' in msg) { W.packed(w, W.int32, msg.paths, 1); }
        if ('sourceFile' in msg) { W.string(w, msg.sourceFile, 2); }
        if ('begin' in msg) { W.int32(w, msg.begin, 3); }
        if ('end' in msg) { W.int32(w, msg.end, 4); }
    },
    fields: [
        [1, "paths", F.repeated(F.int32)],
        [2, "sourceFile", F.string],
        [3, "begin", F.int32],
        [4, "end", F.int32],
    ],
})
