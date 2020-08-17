import { FieldTypes, Types } from '../src/protobuf-codec-ts';
import { fromHex } from './functions';
import { MessageFieldDef, createMessage } from '../src/messages';

const { WireType } = Types;

describe('primitive field reader', () => {
    it('can read from a stream', () => {
        const readString = FieldTypes.string.read;
        const r = fromHex("11746865207261696e20696e20737061696e");
        const actual = readString(r, WireType.LengthDelim, 1, () => "");
        expect(actual).toBe("the rain in spain");
    })

    it('skips invalid wire types', () => {
        const readString = FieldTypes.string.read;
        const r = fromHex(`
            87ad4b
            11746865207261696e20696e20737061696e`);
        // if we encounter a varint wiretype on a string field...
        const first = readString(r, WireType.Varint, 1, () => "prev");
        // then it should return an error instead of the string
        expect(first).toEqual(new Error("Invalid wire type for string: 0"));
        // and should have skipped it so that the next value can be read
        const second = readString(r, WireType.LengthDelim, 1, () => "prev");
        expect(second).toBe("the rain in spain")
    })
})

describe('maybe field reader', () => {
    it('returns undefined when absent', () => {
        expect(FieldTypes.maybeString.defVal()).toBeUndefined();
    })

    it('returns empty string when empty', () => {
        const read = FieldTypes.maybeString.read;
        const r = fromHex("00");
        const actual = read(r, WireType.LengthDelim, 5, () => undefined)
        expect(actual).toBe("");
    })

    it('returns value when present', () => {
        const read = FieldTypes.maybeString.read;
        const r = fromHex("040a023130");
        const actual = read(r, WireType.LengthDelim, 5, () => undefined)
        expect(actual).toBe("10");
    })

    it('returns previous when empty', () => {
        const read = FieldTypes.maybeString.read;
        const r = fromHex("00");
        const actual = read(r, WireType.LengthDelim, 5, () => "prev")
        expect(actual).toBe("prev");
    })

    it('overrides previous when present', () => {
        const read = FieldTypes.maybeString.read;
        const r = fromHex("040a023130");
        const actual = read(r, WireType.LengthDelim, 5, () => "prev")
        expect(actual).toBe("10");
    })

    it('ignores unknown tags', () => {
        const read = FieldTypes.maybeString.read;
        const r = fromHex("060a0231302a00");
        const actual = read(r, WireType.LengthDelim, 5, () => undefined)
        expect(actual).toBe("10");
    })

    it('returns an error for invalid wire type', () => {
        const read = FieldTypes.maybeString.read;
        const r = fromHex("0a");
        const value = read(r, WireType.Varint, 5, () => undefined);
        expect(value).toBeInstanceOf(Error);
    })

    it('throws on invalid wire type of internal field', () => {
        const read = FieldTypes.maybeString.read;
        const r = fromHex("02080a");
        expect(() => {
            read(r, WireType.LengthDelim, 5, () => undefined)
        }).toThrowError();
    })

    describe('readValue', () => {
        const readValue = FieldTypes.maybeString.readValue;
        it('returns a value when present', () => {
            const r = fromHex("040a023130");
            const actual = readValue(r);
            expect(actual).toBe("10");
        })
    })
})

describe('repeated', () => {
    it('works for non-packed', () => {
        const readRepeated = FieldTypes.repeated(FieldTypes.int32);
        expect(readRepeated.defVal()).toEqual([]);
        const r = fromHex(`
            9601
            01`);
        // Note: normally for non-packed, these would be separated (prefix by) tags
        // but for this test we're just simulating the tags
        const first = readRepeated.read(r, WireType.Varint, 1, () => readRepeated.defVal());
        if (first instanceof Error)
            fail(first);
        expect(first).toEqual([150]);
        const second = readRepeated.read(r, WireType.Varint, 1, () => first);
        // the second should be appended to the first
        expect(second).toEqual([150, 1]);
        // make sure this hasn't modified the default value
        expect(readRepeated.defVal()).toEqual([]);
    })

    it('skips wire type errors in non-packed', () => {
        const readRepeated = FieldTypes.repeated(FieldTypes.int32);
        expect(readRepeated.defVal()).toEqual([]);
        const r = fromHex(`
            9601
            01`);
        // Note: normally for non-packed, these would be separated (prefix by) tags
        // but for this test we're just simulating the tags
        const first = readRepeated.read(r, WireType.Varint, 1, () => readRepeated.defVal());
        if (first instanceof Error)
            fail(first);
        expect(first).toEqual([150]);
        const second = readRepeated.read(r, WireType.Double, 1, () => first);
        // the second should be appended to the first
        expect(second).toEqual([150]);
        // make sure this hasn't modified the default value
        expect(readRepeated.defVal()).toEqual([]);
    })

    it('works for packed', () => {
        const readRepeated = FieldTypes.repeated(FieldTypes.int32);
        expect(readRepeated.defVal()).toEqual([]);
        const r = fromHex(`
            10
            9601
            01
            87ad4b
            ffffffffffffffffff01`);
        const result = readRepeated.read(r, WireType.LengthDelim, 1, () => readRepeated.defVal());
        if (result instanceof Error)
            fail(result);
        // this should have read everything in sequence
        expect(result).toEqual([150, 1, 1234567, -1]);
        // make sure this hasn't modified the default value
        expect(readRepeated.defVal()).toEqual([]);
    })

    it('works for length delimited elements', () => {
        const readRepeated = FieldTypes.repeated(FieldTypes.string);
        let value = readRepeated.defVal();
        expect(value).toEqual([]);
        const r = fromHex(`
            036f6e65
            0374776f`);
        const r1 = readRepeated.read(r, WireType.LengthDelim, 1, () => value);
        if (r1 instanceof Error)
            fail(r1);
        value = r1;
        expect(value).toEqual(["one"]);
        const r2 = readRepeated.read(r, WireType.LengthDelim, 1, () => value);
        if (r2 instanceof Error)
            fail(r2);
        value = r2;
        expect(value).toEqual(["one", "two"]);
    })

    it('can handle deferred item types', () => {
        const readRepeated = FieldTypes.repeated(() => FieldTypes.string);
        const r = fromHex(`
            036f6e65
            0374776f`);
        const r1 = readRepeated.read(r, WireType.LengthDelim, 1, () => []);
        if (r1 instanceof Error)
            fail (r1);
        expect(r1).toEqual(["one"]);
    })
})

describe('oneof', () => {
    const oneof = [
        FieldTypes.oneof("test", FieldTypes.string),
        FieldTypes.oneof("test", FieldTypes.int32),
    ]
    type Msg = {
        readonly strVal: string,
        readonly intVal: number,
        readonly testCase: "strVal" | "intVal" | undefined
    };
    const fields: MessageFieldDef[] = [
        [1, "strVal", oneof[0]],
        [2, "intVal", oneof[1]],
    ]
    const msgField = createMessage<Msg>(fields);

    it('has a default value of undefined', () => {
        expect(oneof[0].defVal()).toBeUndefined();
        expect(oneof[1].defVal()).toBeUndefined();
    })

    it('knows what oneof it belongs to', () => {
        expect(oneof[0].oneof).toBe("test");
        expect(oneof[1].oneof).toBe("test");
    })

    it('can read its underlying value type', () => {
        const r = fromHex(`09646f632062726f776e 58`);
        const strval = oneof[0].read(r, WireType.LengthDelim, 1, () => undefined);
        if (strval instanceof Error)
            fail(strval);
        expect(strval.populated).toBe(1);
        expect(strval.value).toBe("doc brown");

        const intval = oneof[1].read(r, WireType.Varint, 2, () => undefined);
        if (intval instanceof Error)
            fail(intval);
        expect(intval.populated).toBe(2);
        expect(intval.value).toBe(88);
    })

    it('has the correct default values', () => {
        let value: Msg | undefined = msgField.defVal();
        const r = fromHex(`00`)
        let result = msgField.read(r, WireType.LengthDelim, 1, () => value);
        if (result instanceof Error)
            fail(result);
        value = result;
        expect(value.strVal).toBe("");
        expect(value.intVal).toBe(0);
    })

    it('clears one when it populates the other', () => {
        const r = fromHex(`0b0a09646f632062726f776e 021058`)
        let value: Msg | undefined = msgField.defVal();
        let result = msgField.read(r, WireType.LengthDelim, 1, () => value);
        if (result instanceof Error)
            fail(result);
        value = result;
        expect(value.strVal).toBe("doc brown");
        expect(value.intVal).toBe(0);
        result = msgField.read(r, WireType.LengthDelim, 1, () => value);
        if (result instanceof Error)
            fail(result);
        value = result;
        expect(value.intVal).toBe(88);
        expect(value.strVal).toBe("");
    })

    it('sets the "case" value when populated', () => {
        const r = fromHex(`00 0b0a09646f632062726f776e 021058`)
        let value: Msg | undefined = msgField.defVal();
        let result = msgField.read(r, WireType.LengthDelim, 1, () => value);
        if (result instanceof Error)
            fail(result);
        value = result;
        expect(value.testCase).toBeUndefined();
        result = msgField.read(r, WireType.LengthDelim, 1, () => value);
        if (result instanceof Error)
            fail(result);
        value = result;
        expect(value.testCase).toBe("strVal");
        result = msgField.read(r, WireType.LengthDelim, 1, () => value);
        if (result instanceof Error)
            fail(result);
        value = result;
        expect(value.testCase).toBe("intVal");
    })

    it('receives previous field value of the same number', () => {
        // note: this is so that you can merge messages even if they are part of a oneof
        //       the spec doesn't say what to do in this case, but we've added a test so that our own behavior doesn't change accidentally
        //       here we just merge some strings which isn't a real use case, but it demonstrates that the previous value is being received

        const o = FieldTypes.oneof<string>("test", {
            defVal: () => "default",
            wireType: WireType.LengthDelim,
            readValue: (r) => "test",
            read: (r, w, n, p) => {
                const s = FieldTypes.string.readValue(r);
                return `${p()} -> ${s}`
            }
        })

        // first read when there is no previous value for field 1
        const r = fromHex(`0864656c6f7265616e 09646f632062726f776e`)
        const v1 = o.read(r, WireType.LengthDelim, 1, () => undefined);
        if (v1 instanceof Error)
            fail(v1);
        expect(v1.populated).toBe(1);
        // should have merged with the default value
        expect(v1.value).toBe("default -> delorean");

        // next read when there is a value for field 1
        const v2 = o.read(r, WireType.LengthDelim, 1, () => v1);
        if (v2 instanceof Error)
            fail(v2);
        expect(v2.populated).toBe(1);
        // should have merged with the previous value
        expect(v2.value).toBe("default -> delorean -> doc brown");
    })

    it('does not merge messages with different field numbers', () => {
        const o = FieldTypes.oneof<string>("test", {
            defVal: () => "default",
            wireType: WireType.LengthDelim,
            readValue: (r) => "test",
            read: (r, w, n, p) => {
                const s = FieldTypes.string.readValue(r);
                return `${p()} -> ${s}`
            }
        })

        const r = fromHex(`09646f632062726f776e`)
        const v = o.read(r, WireType.LengthDelim, 1, () => ({populated: 2, value: "orig"}));
        if (v instanceof Error)
            fail(v);
        expect(v.populated).toBe(1);
        // this is "default -> ..." instead of "orig -> ..." because "orig" was number 2 and this was discovered under 1
        expect(v.value).toBe("default -> doc brown");
    })
})

describe('map', () => {
    it('can do string -> string', () => {
        const m = FieldTypes.map(FieldTypes.string, FieldTypes.string);

        // the mock reader contains only the records (the tag and wire type are simulated)
        // these are the record length, key tag:wire 0a = 1:length-delim ; 12 = 2:length-delim
        const r = fromHex(`
            0a 0a036f6e65 1203756e6f
            0a 0a0374776f 1203646f73
        `);

        const v1 = m.read(r, WireType.LengthDelim, 3, () => ({}));
        if (v1 instanceof Error)
            fail(v1);
        expect(v1["one"]).toBe("uno");

        const v2 = m.read(r, WireType.LengthDelim, 3, () => v1);
        if (v2 instanceof Error)
            fail(v2);
        expect(v2["two"]).toBe("dos");
        expect(v2["one"]).toBe("uno");
    })

    it('can do int32 -> string', () => {
        const m = FieldTypes.map(FieldTypes.int32, FieldTypes.string);
        // the mock reader contains only the records (the tag and wire type are simulated)
        // these are the record length, key tag:wire 08 = 1:varint ; 12 = 2:length-delim
        const r = fromHex(`
            07 0801 1203756e6f
            07 0802 1203646f73
        `)

        const v1 = m.read(r, WireType.LengthDelim, 3, () => ({}));
        if (v1 instanceof Error)
            fail(v1);
        expect(v1).toStrictEqual({"1": "uno"});

        const v2 = m.read(r, WireType.LengthDelim, 3, () => v1);
        if (v2 instanceof Error)
            fail(v2);
        expect(v2).toStrictEqual({"1": "uno", "2": "dos"});
    })

    it('can do bool -> string', () => {
        const m = FieldTypes.map(FieldTypes.bool, FieldTypes.string);
        // the following is missing the key for the second record because it is "false"
        // therefore this also tests to see if default keys work
        const r = fromHex(`
            07 0801 1203756e6f
            05      1203646f73
        `)

        const v1 = m.read(r, WireType.LengthDelim, 3, () => ({}));
        if (v1 instanceof Error)
            fail(v1);
        expect(v1).toStrictEqual({"true": "uno"});
        
        const v2 = m.read(r, WireType.LengthDelim, 3, () => v1);
        if (v2 instanceof Error)
            fail(v2);
        expect(v2).toStrictEqual({"true": "uno", "false": "dos"});
    })

    it('can handle int64 -> string', () => {
        const m = FieldTypes.map(FieldTypes.int64decimal, FieldTypes.string);
        // the mock reader contains only the records (the tag and wire type are simulated)
        // these are the record length, key tag:wire 08 = 1:varint ; 12 = 2:length-delim
        const r = fromHex(`
            0d 0880b8c9e5ae8004 1203756e6f
            07 0802 1203646f73
        `)

        const v1 = m.read(r, WireType.LengthDelim, 3, () => ({}));
        if (v1 instanceof Error)
            fail(v1);
        expect(v1).toStrictEqual({"17604747090944": "uno"})

        const v2 = m.read(r, WireType.LengthDelim, 3, () => v1);
        if (v2 instanceof Error)
            fail(v2);
        expect(v2).toStrictEqual({"17604747090944": "uno", "2": "dos"});
    });

    it('can handle fixed64hexpad -> string', () => {
        const m = FieldTypes.map(FieldTypes.fixed64hexpad, FieldTypes.string);
        // the mock reader contains only the records (the tag and wire type are simulated)
        // these are the record length, key tag:wire 08 = 1:varint ; 12 = 2:length-delim
        const r = fromHex(`
            0e 09005cb2ec02100000 1203756e6f
            0e 090200000000000000 1203646f73
        `)

        const v1 = m.read(r, WireType.LengthDelim, 3, () => ({}));
        if (v1 instanceof Error)
            fail(v1);
        expect(v1).toStrictEqual({"00001002ecb25c00": "uno"})

        const v2 = m.read(r, WireType.LengthDelim, 3, () => v1);
        if (v2 instanceof Error)
            fail(v2);
        expect(v2).toStrictEqual({"00001002ecb25c00": "uno", "0000000000000002": "dos"});
    });

    it('can handle an empty string key correctly', () => {
        const m = FieldTypes.map(FieldTypes.string, FieldTypes.string);
        // the mock reader contains only the records (the tag and wire type are simulated)
        // these are the record length, key tag:wire 08 = 1:varint ; 12 = 2:length-delim
        const r = fromHex(`
            05 1203756e6f
            0a 0a0374776f 1203646f73
        `)

        const v1 = m.read(r, WireType.LengthDelim, 3, () => ({}));
        if (v1 instanceof Error)
            fail(v1);
        expect(v1).toStrictEqual({"": "uno"})

        const v2 = m.read(r, WireType.LengthDelim, 3, () => v1);
        if (v2 instanceof Error)
            fail(v2);
        expect(v2).toStrictEqual({"": "uno", "two": "dos"});
    });

    it('can handle default value correctly', () => {
        const m = FieldTypes.map(FieldTypes.string, FieldTypes.string);
        // the mock reader contains only the records (the tag and wire type are simulated)
        // these are the record length, key tag:wire 08 = 1:varint ; 12 = 2:length-delim
        const r = fromHex(`
            05 0a036f6e65
            0a 0a0374776f 1203646f73
        `)

        const v1 = m.read(r, WireType.LengthDelim, 3, () => ({}));
        if (v1 instanceof Error)
            fail(v1);
        expect(v1).toStrictEqual({"one": ""})

        const v2 = m.read(r, WireType.LengthDelim, 3, () => v1);
        if (v2 instanceof Error)
            fail(v2);
        expect(v2).toStrictEqual({"one": "", "two": "dos"});
    });

    it('gives invalid wire type if not length delim', () => {
        const m = FieldTypes.map(FieldTypes.string, FieldTypes.string);
        const r = fromHex(`03`);
        const v = m.read(r, WireType.Varint, 3, () => ({}));
        if (!(v instanceof Error))
            fail(`expected failure but received: ${v}`);
        expect(v.message).toMatch(/invalid wire type/i);
    });

    it('does not accidentally modify its default value', () => {
        const m = FieldTypes.map(FieldTypes.string, FieldTypes.string);

        // the mock reader contains only the records (the tag and wire type are simulated)
        // these are the record length, key tag:wire 08 = 1:varint ; 12 = 2:length-delim
        const r = fromHex(`
            0a 0a036f6e65 1203756e6f
            0a 0a0374776f 1203646f73
        `);

        const d = m.defVal();

        const jsonOrig = JSON.stringify(d);

        const v1 = m.read(r, WireType.LengthDelim, 3, () => d);
        if (v1 instanceof Error)
            fail(v1);
        expect(v1).toStrictEqual({"one": "uno"})

        // this better not have changed
        expect(JSON.stringify(d)).toBe(jsonOrig);
    })

})