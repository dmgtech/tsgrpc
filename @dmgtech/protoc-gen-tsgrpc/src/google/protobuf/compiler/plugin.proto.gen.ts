/* istanbul ignore file */
/**
 * @fileoverview tsgrpc-generated client stub for google.protobuf.compiler from google/protobuf/compiler/plugin.proto
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!

/* eslint-disable */
// @ts-nocheck

import {Enums as E, Messages as M, Services as S, WriteField as W, KeyConverters as KC, Helpers as H, Reader, FieldTypes as F, Reducers, Types as T} from "@dmgtech/tsgrpc-protobuf-codec";
import * as googleProtobufDescriptorProto from "../descriptor.proto.gen";

export const Version = {
} as unknown as
    M.MessageDef<Version.Strict, Version.Value>

export const CodeGeneratorRequest = {
} as unknown as
    M.MessageDef<CodeGeneratorRequest.Strict, CodeGeneratorRequest.Value>

export const CodeGeneratorResponse = {
    Feature: {},
    File: {},
} as unknown as
    M.MessageDef<CodeGeneratorResponse.Strict, CodeGeneratorResponse.Value> & {
        Feature: E.EnumDef<CodeGeneratorResponse.Feature.ProtoName, CodeGeneratorResponse.Feature.Def>,
        File: M.MessageDef<CodeGeneratorResponse.File.Strict, CodeGeneratorResponse.File.Value>,
    }

export namespace Version {
    export type ProtoName = "google.protobuf.compiler.Version";

    export type Strict = {
        // int32 major = 1;
        readonly major: number,
        // int32 minor = 2;
        readonly minor: number,
        // int32 patch = 3;
        readonly patch: number,
        // string suffix = 4;
        readonly suffix: string,
    }

    export type Loose = {
        // int32 major = 1;
        readonly major?: number,
        // int32 minor = 2;
        readonly minor?: number,
        // int32 patch = 3;
        readonly patch?: number,
        // string suffix = 4;
        readonly suffix?: string,
    }

    export type Value = Strict | Loose;
}

export namespace CodeGeneratorRequest {
    export type ProtoName = "google.protobuf.compiler.CodeGeneratorRequest";

    export type Strict = {
        // repeated string files_to_generate = 1;
        readonly filesToGenerate: string[],
        // string parameter = 2;
        readonly parameter: string,
        // repeated FileDescriptorProto proto_files = 15;
        readonly protoFiles: googleProtobufDescriptorProto.FileDescriptorProto.Strict[],
        // Version compiler_version = 3;
        readonly compilerVersion: Version.Strict | undefined,
    }

    export type Loose = {
        // repeated string files_to_generate = 1;
        readonly filesToGenerate?: string[],
        // string parameter = 2;
        readonly parameter?: string,
        // repeated FileDescriptorProto proto_files = 15;
        readonly protoFiles?: googleProtobufDescriptorProto.FileDescriptorProto.Value[],
        // Version compiler_version = 3;
        readonly compilerVersion?: Version.Value,
    }

    export type Value = Strict | Loose;
}

export namespace CodeGeneratorResponse {
    export type ProtoName = "google.protobuf.compiler.CodeGeneratorResponse";

    export type Strict = {
        // string error = 1;
        readonly error: string,
        // uint64 supported_features = 2;
        readonly supportedFeatures: string,
        // repeated File files = 15;
        readonly files: File.Strict[],
    }

    export type Loose = {
        // string error = 1;
        readonly error?: string,
        // uint64 supported_features = 2;
        readonly supportedFeatures?: (string | number),
        // repeated File files = 15;
        readonly files?: File.Value[],
    }

    export type Value = Strict | Loose;

    export namespace Feature {
        export type ProtoName = "google.protobuf.compiler.CodeGeneratorResponse.Feature"
        export type Def = {
            "None": 0,
            "Proto3Optional": 1,
        }

        export type None = E.Value<ProtoName, Def, "None">
        export type Proto3Optional = E.Value<ProtoName, Def, "Proto3Optional">

        export type Strict = E.EnumValue<ProtoName, E.Literal<Def>>;
        export type Value = Strict | E.Literal<Def>;
    }
    export type Feature = Feature.Strict;

    export namespace File {
        export type ProtoName = "google.protobuf.compiler.CodeGeneratorResponse.File";

        export type Strict = {
            // string name = 1;
            readonly name: string,
            // string insertion_point = 2;
            readonly insertionPoint: string,
            // string content = 15;
            readonly content: string,
        }

        export type Loose = {
            // string name = 1;
            readonly name?: string,
            // string insertion_point = 2;
            readonly insertionPoint?: string,
            // string content = 15;
            readonly content?: string,
        }

        export type Value = Strict | Loose;
    }
}

M.define(Version, {
    writeContents: (w, msg) => {
        if ('major' in msg) { W.int32(w, msg.major, 1); }
        if ('minor' in msg) { W.int32(w, msg.minor, 2); }
        if ('patch' in msg) { W.int32(w, msg.patch, 3); }
        if ('suffix' in msg) { W.string(w, msg.suffix, 4); }
    },
    fields: [
        [1, "major", F.int32],
        [2, "minor", F.int32],
        [3, "patch", F.int32],
        [4, "suffix", F.string],
    ],
})

M.define(CodeGeneratorRequest, {
    writeContents: (w, msg) => {
        if ('filesToGenerate' in msg) { W.repeated(w, W.string, msg.filesToGenerate, 1); }
        if ('parameter' in msg) { W.string(w, msg.parameter, 2); }
        if ('protoFiles' in msg) { W.repeated(w, googleProtobufDescriptorProto.FileDescriptorProto.write, msg.protoFiles, 15); }
        if ('compilerVersion' in msg) { Version.write(w, msg.compilerVersion, 3); }
    },
    fields: [
        [1, "filesToGenerate", F.repeated(F.string)],
        [2, "parameter", F.string],
        [15, "protoFiles", F.repeated(() => googleProtobufDescriptorProto.FileDescriptorProto)],
        [3, "compilerVersion", () => Version],
    ],
})

M.define(CodeGeneratorResponse, {
    writeContents: (w, msg) => {
        if ('error' in msg) { W.string(w, msg.error, 1); }
        if ('supportedFeatures' in msg) { W.uint64decimal(w, msg.supportedFeatures, 2); }
        if ('files' in msg) { W.repeated(w, CodeGeneratorResponse.File.write, msg.files, 15); }
    },
    fields: [
        [1, "error", F.string],
        [2, "supportedFeatures", F.uint64decimal],
        [15, "files", F.repeated(() => CodeGeneratorResponse.File)],
    ],
})

E.define(CodeGeneratorResponse.Feature, {
    "None": 0 as 0,
    "Proto3Optional": 1 as 1,
});

M.define(CodeGeneratorResponse.File, {
    writeContents: (w, msg) => {
        if ('name' in msg) { W.string(w, msg.name, 1); }
        if ('insertionPoint' in msg) { W.string(w, msg.insertionPoint, 2); }
        if ('content' in msg) { W.string(w, msg.content, 15); }
    },
    fields: [
        [1, "name", F.string],
        [2, "insertionPoint", F.string],
        [15, "content", F.string],
    ],
})
