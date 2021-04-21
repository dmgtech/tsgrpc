/* istanbul ignore file */
/**
 * @fileoverview tsgrpc-generated client stub for ex.ample.importable from importable/importMe.proto
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!

/* eslint-disable */
// @ts-nocheck

import {Enums as E, Messages as M, WriteField as W, KeyConverters as KC, Helpers as H, Reader, FieldTypes as F, Reducers, Types as T} from "protobuf-codec-ts";
import * as timelib from '@js-joda/core';
import * as Surrogates from "../surrogates";

export const Imported = {
    EnumForImport: {},
} as unknown as
    M.MessageDef<Imported.Strict, Imported.Value> & {
        EnumForImport: E.EnumDef<Imported.EnumForImport.ProtoName, Imported.EnumForImport.Def>,
    }

export const Args = {
} as unknown as
    M.MessageDef<Args.Strict, Args.Value>

export namespace Imported {
    export type ProtoName = "ex.ample.importable.Imported";

    export type Strict = {
        // string value = 1;
        readonly value: string,
    }

    export type Loose = {
        // string value = 1;
        readonly value?: string,
    }

    export type Value = Strict | Loose;

    export namespace EnumForImport {
        export type ProtoName = "ex.ample.importable.Imported.EnumForImport"
        export type Def = {
            "No": 0,
            "Yes": 1,
        }

        export type No = E.Value<ProtoName, Def, "No">
        export type Yes = E.Value<ProtoName, Def, "Yes">

        export type Strict = E.EnumValue<ProtoName, E.Literal<Def>>;
        export type Value = Strict | E.Literal<Def>;
    }
    export type EnumForImport = EnumForImport.Strict;
}

export namespace Args {
    export type ProtoName = "ex.ample.importable.Args";

    export type Strict = {
        // string value = 1;
        readonly value: string,
    }

    export type Loose = {
        // string value = 1;
        readonly value?: string,
    }

    export type Value = Strict | Loose;
}

M.define(Imported, {
    writeContents: (w, msg) => {
        W.string(w, msg.value, 1);
    },
    fields: [
        [1, "value", F.string],
    ],
})

E.define(Imported.EnumForImport, {
    "No": 0 as 0,
    "Yes": 1 as 1,
});

M.define(Args, {
    writeContents: (w, msg) => {
        W.string(w, msg.value, 1);
    },
    fields: [
        [1, "value", F.string],
    ],
})

const ServiceTwoService: T.GrpcService = {name: "ex.ample.importable.ServiceTwo"}

export namespace ServiceTwo {
}
