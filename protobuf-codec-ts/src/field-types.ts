import { FieldReader, WireType, Readable } from "./types";
import * as R from "./read-value";

const {fieldFromTag, wireTypeFromTag} = R;

export type FieldType<TVal, TDef = TVal> = {
    def: TDef,
    read: FieldReader<TVal, TDef>,
}

export type RepeatableFieldType<TVal, TDef = TVal> = FieldType<TVal, TDef> & {
    wireType: WireType,
    readValue: FieldValueReader<TVal>,
}

export type OneofFieldType<TDef> = FieldType<OneOfValue, undefined> & {
    oneof: string,
    oneofDef: TDef
}

type FieldValueReader<TVal> = (r: Readable) => TVal;

function primitive<T>({name, def, wt, read}: {name: string, def: T, wt: WireType, read: FieldValueReader<T>}): RepeatableFieldType<T> {
    return {
        def,
        read: makePrimitiveFieldReader({name, wireType: wt, readValue: read}),
        wireType: wt,
        readValue: read,
    }
}

function makePrimitiveFieldReader<TVal>({name, wireType, readValue}: {name: string, wireType: WireType, readValue: (r: Readable) => TVal}): FieldReader<TVal> {
    return (r, wt, prev) => {
        if (wt != wireType) {
            R.skip(r, wt);
            return new Error(`Invalid wire type for ${name}: ${wt}`);
        }
        return readValue(r);
    }
}

const emptyBytes = new Uint8Array(0);

export const bool              = primitive<boolean>({    name: "bool"              , def: false                  , wt: WireType.Varint      , read: R.bool              });
export const bytes             = primitive<Uint8Array>({ name: "bytes"             , def: emptyBytes             , wt: WireType.LengthDelim , read: R.bytes             });
export const double            = primitive<number>({     name: "double"            , def: 0                      , wt: WireType.Double      , read: R.double            });
export const fixed32           = primitive<number>({     name: "fixed32"           , def: 0                      , wt: WireType.Single      , read: R.fixed32           });
export const fixed64decimal    = primitive<string>({     name: "fixed64decimal"    , def: "0"                    , wt: WireType.Double      , read: R.fixed64decimal    });
export const fixed64decimalpad = primitive<string>({     name: "fixed64decimalpad" , def: "00000000000000000000" , wt: WireType.Double      , read: R.fixed64decimalpad });
export const fixed64hexpad     = primitive<string>({     name: "fixed64hexpad"     , def: "0000000000000000"     , wt: WireType.Double      , read: R.fixed64hexpad     });
export const float             = primitive<number>({     name: "float"             , def: 0                      , wt: WireType.Single      , read: R.float             });
export const int32             = primitive<number>({     name: "int32"             , def: 0                      , wt: WireType.Varint      , read: R.int32             });
export const int64decimal      = primitive<string>({     name: "int64decimal"      , def: "0"                    , wt: WireType.Varint      , read: R.int64decimal      });
export const sfixed32          = primitive<number>({     name: "sfixed32"          , def: 0                      , wt: WireType.Single      , read: R.sfixed32          });
export const sfixed64decimal   = primitive<string>({     name: "sfixed64decimal"   , def: "0"                    , wt: WireType.Double      , read: R.sfixed64decimal   });
export const sint32            = primitive<number>({     name: "sint32"            , def: 0                      , wt: WireType.Varint      , read: R.sint32            });
export const sint64decimal     = primitive<string>({     name: "sint64decimal"     , def: "0"                    , wt: WireType.Varint      , read: R.sint64decimal     });
export const string            = primitive<string>({     name: "string"            , def: ""                     , wt: WireType.LengthDelim , read: R.string            });
export const uint32            = primitive<number>({     name: "uint32"            , def: 0                      , wt: WireType.Varint      , read: R.uint32            });
export const uint64decimal     = primitive<string>({     name: "uint64decimal"     , def: "0"                    , wt: WireType.Varint      , read: R.uint64decimal     });
export const uint64hex         = primitive<string>({     name: "uint64hex"         , def: "0"                    , wt: WireType.Varint      , read: R.uint64hex         });
//export const enumv             = {WireType.Varint}
//export const map               = {def: emptyMap     }
//export const message           = {def: undefined    }
//export const repeated          = {def: emptyArray   }

export function repeated<TVal>(item: RepeatableFieldType<TVal, any>): FieldType<TVal[]> {
    const ft: FieldType<TVal[]> = {
        def: [],
        read: (r, wt, num, prev) => {
            // packed reading is only allowed for wire types that are not already length-delimited
            if (item.wireType !== WireType.LengthDelim && wt === WireType.LengthDelim) {
                const array: TVal[] = []
                const sub = R.sub(r);
                while (!sub.isDone()) {
                    const val = item.readValue(sub);
                    array.push(val);
                }
                return array;
            }
            else {
                const v = item.read(r, wt, num, () => item.def);
                const p = prev();
                if (!(v instanceof Error)) {
                    if (p.length > 0)
                        p.push(v);
                    else
                        return [v];
                }
                return p;
            }
        }
    }
    return ft;
}

type OneOfValue = {
    populated: number,
    value: any,
}

export function oneof<TVal, TDef = TVal>(name: string, fieldType: RepeatableFieldType<TVal, TDef>): OneofFieldType<TDef> {
    /* The implementation of the oneof is to share a single entry in the vtable among all fields defined with the same oneof name
       and the entry stores the field number of the member that is actually populated, plus the value of that member
       this is mostly handled by the "message" reader maker
    */
    const {def, read} = fieldType;
    return {
        def: undefined,
        oneof: name,
        oneofDef: def,
        read(r, wt, num, prev) {
            const thisPrev = () => {
                const oprev = prev();
                return (oprev?.populated === num) ? oprev.value : def;
            }
            const next = read(r, wt, num, thisPrev);
            return {populated: num, value: next};
        }
    };
}

export function message<TStrict>(fields: ReadonlyArray<FieldInfo>): RepeatableFieldType<TStrict, undefined> {
    const def: TStrict|undefined = undefined;
    const readValue: FieldValueReader<TStrict> = makeMessageValueReader(fields);
    const read = makeDelimitedReader<TStrict, undefined>(readValue);
    return {def, readValue, read, wireType: WireType.LengthDelim}
}

export type FieldInfo = [number, string, FieldType<any> | OneofFieldType<any>]

interface VTable {
    _vtable: any[];
    new(vt: any[], unknown: UnknownField[]): VTable;
}

type UnknownField = [number, Uint8Array];

function getOrAdd<K,V>(map: Map<K, V>, key: K, add: () => V): V {
    const existing = map.get(key);
    if (existing === undefined) {
        const set = add();
        map.set(key, set);
        return set;
    }
    else {
        return existing;
    }
}

function makeMessageValueReader<T>(fields: ReadonlyArray<FieldInfo>): FieldValueReader<T> {
    // the following code is run once per type of message and sets up a function that can be called for every instance of the message

    type Impl = {new(vt: any[], unknown: UnknownField[]): VTable & T}

    // all fresh vtables are a clone of the template
    // the template vtable is populated with the defaults for all fields
    const vtableTemplate: any[] = [];
    const Impl = function(this: T & VTable, vt: any[], unknown: UnknownField[]) {
        Object.defineProperty(this, "_vtable", {value: vt, enumerable: false})
        Object.defineProperty(this, "_unknown", {value: unknown, enumerable: false})
    } as any as Impl;
    
    const numberToVtableIndex: number[] = [];
    const numberToField: FieldInfo[] = []
    const oneofToVtableIndex: Map<string, number> = new Map();

    for (const field of fields) {
        const [number, name, type] = field;
        numberToField[number] = field;
        if ("oneof" in type) {
            const {oneof} = type;
            const vtableIndex = getOrAdd(oneofToVtableIndex, oneof, () => {
                const vtableIndex = vtableTemplate.length;
                vtableTemplate.push(type.def);
                return vtableIndex;
            });
            numberToVtableIndex[number] = vtableIndex;
            Object.defineProperty(Impl.prototype, name, {
                get: function() { 
                    const ov: OneOfValue = this._vtable[vtableIndex];
                    return ov?.populated === number ? ov.value : type.oneofDef;
                },
                enumerable: true,
            })
        }
        else {
            const vtableIndex = vtableTemplate.length;
            vtableTemplate.push(type.def);
            numberToVtableIndex[number] = vtableIndex;
            // the getter for each field is defined here
            // each field value is retrieved from the vtable at the same index it is declared in the fields array
            Object.defineProperty(Impl.prototype, name, {
                get: function() { return this._vtable[vtableIndex]; },
                enumerable: true,
            })
        }
    }

    for (const oneof of oneofToVtableIndex) {
        // TODO: Object.defineProperty for oneof case
    }

    Object.defineProperty(Impl.prototype, "toJSON", {enumerable: false, value: function() {
        const obj: any = {};
        for (const name in this)
            obj[name] = this[name];
        return obj;
    }})
    return (r) => {
        const vtable = vtableTemplate.slice();
        const unknown: UnknownField[] = [];
        const instance = new Impl(vtable, unknown);
        for (;;) {
            const t = R.tag(r);
            if (t === undefined)
                break;
            const number = fieldFromTag(t);
            const wtype = wireTypeFromTag(t);
            const field = numberToField[number];
            if (field === undefined) {
                // this field isn't something we had in our proto, so just stash the raw bytes
                unknown.push([number, R.skip(r, wtype)]);
                continue;
            }
            const type = field[2];
            const index = numberToVtableIndex[number];
            const result = type.read(r, wtype, number, () => vtable[index]);
            if (result instanceof Error)
                throw result;
            vtable[index] = result;
        }
        return instance;
    }
}

function makeDelimitedReader<TVal, TDef>(contentReader: (r: Readable) => TVal): FieldReader<TVal, TDef> {
    return (readable, wt, prev) => {
        if (wt !== WireType.LengthDelim) {
            return new Error(`Invalid wire type for message: ${wt}`);
        }
        const sub = R.sub(readable);
        return contentReader(sub);
    }
}
