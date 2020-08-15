import { FieldReader, WireType, Readable } from "./types";
import * as R from "./read-value";
import { EnumConstructor, EnumValue, EnumDef } from "./enums";
import { once } from './helpers';

const {fieldFromTag, wireTypeFromTag} = R;

export type FieldType<TVal, TDef = TVal> = {
    defVal: () => TDef,
    read: FieldReader<TVal, TDef>,
}

export type Deferrable<T extends {defVal: any}> = T | (() => T);

export function realize<T extends {defVal: any}>(deferrable: Deferrable<T>): T {
    return "defVal" in deferrable ? deferrable : deferrable();
}

export type RepeatableFieldType<TVal, TDef = TVal> = FieldType<TVal, TDef> & {
    wireType: WireType,
    readValue: FieldValueReader<TVal>,
}

export type OneofFieldType<TDef> = FieldType<OneOfValue, undefined> & {
    oneof: string,
    oneofDefVal: () => TDef
}

export type MessageFieldType<TStrict> = RepeatableFieldType<TStrict, undefined> & {readMessageValue: MessageValueReader<TStrict>}

type FieldValueReader<TVal> = (r: Readable) => TVal;

function primitive<T>({name, def, wt, read}: {name: string, def: T, wt: WireType, read: FieldValueReader<T>}): RepeatableFieldType<T> {
    return {
        defVal: () => def,
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

export function repeated<TVal>(item: Deferrable<RepeatableFieldType<TVal, any>>): FieldType<TVal[]> {
    const ft: FieldType<TVal[]> = {
        defVal: () => [],
        read: (r, wt, num, prev) => {
            const {wireType, read, readValue, defVal} = realize(item)
            // packed reading is only allowed for wire types that are not already length-delimited
            if (wireType !== WireType.LengthDelim && wt === WireType.LengthDelim) {
                const array: TVal[] = []
                const sub = R.sub(r);
                while (!sub.isDone()) {
                    const val = readValue(sub);
                    array.push(val);
                }
                return array;
            }
            else {
                const v = read(r, wt, num, defVal);
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

const oneofsDef = () => undefined;
export function oneof<TVal, TDef = TVal>(name: string, fieldType: Deferrable<RepeatableFieldType<TVal, TDef>>): OneofFieldType<TDef> {
    /* The implementation of the oneof is to share a single entry in the vtable among all fields defined with the same oneof name
       and the entry stores the field number of the member that is actually populated, plus the value of that member
       this is mostly handled by the "message" reader maker
    */
    const {defVal, read} = realize(fieldType);
    return {
        defVal: oneofsDef,
        oneof: name,
        oneofDefVal: defVal,
        read(r, wt, num, prev) {
            const thisPrev = () => {
                const oprev = prev();
                return (oprev?.populated === num) ? oprev.value : defVal();
            }
            const next = read(r, wt, num, thisPrev);
            return {populated: num, value: next};
        }
    };
}

type ProtoMap<TVal> = {[key: string]: TVal};
const mapsDef = () => ({});
export function map<TVal, TDef>(keyType: FieldType<string> | FieldType<number> | FieldType<boolean>, valueType: Deferrable<RepeatableFieldType<TVal, TDef>>): FieldType<ProtoMap<TVal>> {
    const recordDef = createMessage<{key: string, value: TVal}>([
        [1, "key", keyType],
        [2, "value", valueType],
    ])
    return {
        defVal: mapsDef,
        read(r, wt, num, prev) {
            const record = recordDef.read(r, wt, num, () => undefined);
            if (record instanceof Error)
                return record;
            const pval = prev();
            //pval[record.key] = record.value;
            return ({...pval, [record.key]: record.value});
        }
    }
}

const messagesDef = () => undefined;

export function message<TStrict>(getMessageDef: () => {readMessageValue: MessageValueReader<TStrict>}): MessageFieldType<TStrict> {
    const defVal = messagesDef;
    getMessageDef = once(getMessageDef);
    const readMessageValue: MessageValueReader<TStrict> = (r, prev) => getMessageDef().readMessageValue(r, prev);
    const read = makeMessageReader(readMessageValue);
    const readValue: FieldValueReader<MessageImpl<TStrict>> = (r) => readMessageValue(r, undefined);
    return {defVal, readMessageValue, readValue, read, wireType: WireType.LengthDelim};
}

export function createMessage<TStrict>(fields: ReadonlyArray<MessageFieldDef>): MessageFieldType<TStrict> {
    const defVal = messagesDef;
    const readMessageValue = makeMessageValueReader<TStrict>(fields);
    const read = makeMessageReader(readMessageValue);
    const readValue: FieldValueReader<MessageImpl<TStrict>> = (r) => readMessageValue(r, undefined);
    return {defVal, readMessageValue, readValue, read, wireType: WireType.LengthDelim}
}

export type MessageFieldDef = [number, string, Deferrable<FieldType<any> | OneofFieldType<any>>]

interface VTable {
    _vtable: readonly any[];
    _unknown: readonly UnknownField[];
}

type UnknownField = readonly [number, Uint8Array];

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

export type MessageImpl<T> = T & VTable & {
    new(vt: VTable): MessageImpl<T>
}

export type MessageValueReader<T> = (r: Readable, prev?: MessageImpl<T> | T) => MessageImpl<T>

export function makeMessageValueReader<T>(fields: ReadonlyArray<MessageFieldDef>): MessageValueReader<T> {
    // the following code is run once per type of message and sets up a function that can be called for every instance of the message

    // all fresh vtables are a clone of the template
    // the template vtable is populated with the defaults for all fields
    const MessageImpl = function(this: T & VTable, vt: VTable) {
        Object.defineProperty(this, "_vtable", {value: vt._vtable, enumerable: false})
        Object.defineProperty(this, "_unknown", {value: vt._unknown, enumerable: false})
    } as any as MessageImpl<T>;
    
    const create = once(() => {
        const numberToVtableIndex: number[] = [];
        const numberToField: MessageFieldDef[] = []
        const oneofToVtableIndex: Map<string, number> = new Map();

        const vtableTemplate: any[] = [];
        for (const field of fields) {
            const [number, name, type] = field;
            numberToField[number] = field;
            const fieldType = realize(type);
            const {defVal} = fieldType;
            const def = defVal();
            if ("oneof" in fieldType) {
                const {oneof} = fieldType;
                const vtableIndex = getOrAdd(oneofToVtableIndex, oneof, () => {
                    const vtableIndex = vtableTemplate.length;
                    vtableTemplate.push(def);
                    return vtableIndex;
                });
                numberToVtableIndex[number] = vtableIndex;
                Object.defineProperty(MessageImpl.prototype, name, {
                    get: function() { 
                        const ov: OneOfValue = this._vtable[vtableIndex];
                        return ov?.populated === number ? ov.value : fieldType.oneofDefVal();
                    },
                    enumerable: true,
                })
            }
            else {
                const vtableIndex = vtableTemplate.length;
                vtableTemplate.push(def);
                numberToVtableIndex[number] = vtableIndex;
                // the getter for each field is defined here
                // each field value is retrieved from the vtable at the same index it is declared in the fields array
                Object.defineProperty(MessageImpl.prototype, name, {
                    get: function() { return this._vtable[vtableIndex]; },
                    enumerable: true,
                })
            }
        }

        for (const oneof of oneofToVtableIndex) {
            const [name, index] = oneof;
            Object.defineProperty(MessageImpl.prototype, `${name}Case`, {
                get: function() {
                    return numberToField[this._vtable[index]?.populated]?.[1]
                },
                enumerable: false,
            })
        }

        Object.defineProperty(MessageImpl.prototype, "toJSON", {enumerable: false, value: function() {
            const obj: any = {};
            for (const name in this)
                obj[name] = this[name];
            return obj;
        }})

        const template: VTable = {_vtable: vtableTemplate, _unknown: []};
        const vtableReader = makeMessageVTableReader(numberToField, numberToVtableIndex);
        return {template, vtableReader};
    });
    return (r, prev) => {
        const {template, vtableReader} = create();
        const start = getVtable(prev) || template;
        const vtable = vtableReader(r, start)
        const instance = new MessageImpl(vtable);
        return instance;
    }
}

function getVtable<TStrict>(msg: MessageImpl<TStrict> | TStrict | undefined): VTable | undefined {
    // TODO: right now, you cannot use a previous message's state as a starting point when reading unless it is a MessageImpl (with a vtable)
    //       which they always will be when decoding from wire format
    //       and so we satisfy the requirement when decoding that a message can be broken into muliple blocks within the wire format and these will be merged together
    //       but the resulting message value reader acts as though it can take any TStrict in prev() and it currently cannot because we have not implemented a way to go from strict back to vtable below
    //       if we implement that, then this will also be possible, but so far there's no actual use case
    return (msg && "_vtable" in msg ? msg : undefined)
}

type VTableReader = (r: Readable, template: VTable) => VTable

function makeMessageVTableReader(numberToField: readonly MessageFieldDef[], numberToVtableIndex: readonly number[]): VTableReader {
    return (r, template) => {
        const vtable = template._vtable.slice();
        const unknown = template._unknown.slice();
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
            const type = realize(field[2]);
            const index = numberToVtableIndex[number];
            const result = type.read(r, wtype, number, () => vtable[index]);
            if (result instanceof Error)
                throw result;
            vtable[index] = result;
        }
        return {_vtable: vtable, _unknown: unknown}
    }

}

function makeMessageReader<TStrict>(contentReader: MessageValueReader<TStrict>): FieldReader<TStrict, undefined> {
    return (readable, wt, number, prev) => {
        if (wt !== WireType.LengthDelim) {
            return new Error(`Invalid wire type for message: ${wt}`);
        }
        const sub = R.sub(readable);
        const pval = prev();
        return contentReader(sub, pval);
    }
}
