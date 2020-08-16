/* istanbul ignore file */
/**
 * @fileoverview tsgrpc-generated client stub for ex.ample.importable from importable/importMe.proto
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!

/* eslint-disable */
/* @ts-nocheck */

import * as grpcWeb from "grpc-web";
import {Enums as E, Messages as M, WriteField as W, KeyConverters as KC, Helpers as H, Reader, FieldTypes as F, Reducers, Types as T} from "protobuf-codec-ts";

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

export const Imported = {
    EnumForImport: {},
} as unknown as
    M.MessageDef<Imported.Strict, Imported.Value> & {
        EnumForImport: E.EnumDef<Imported.EnumForImport.ProtoName, Imported.EnumForImport.Def>,
    }

export const Args = {
} as unknown as
    M.MessageDef<Args.Strict, Args.Value>

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

export class ServiceTwoClient {
    client_: grpcWeb.AbstractClientBase;
    hostname_: string;
    credentials_: null | { [index: string]: string; };
    options_: null | { [index: string]: string; };

    constructor (hostname: string, credentials?: null | { [index: string]: string; }, options?: null | { [index: string]: string; }) {
        if (!options)
            options = {};
        if (!credentials)
            credentials = {};
        options['format'] = 'text';

        this.client_ = new grpcWeb.GrpcWebClientBase(options);
        this.hostname_ = hostname;
        this.credentials_ = credentials;
        this.options_ = options;
    }
}

export namespace ServiceTwo {
    const client = ServiceTwoClient;
    const {prototype} = client;
}
