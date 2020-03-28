import { FieldTypes, WireType } from '../src/protobuf-codec-ts';
import { fromHex } from './functions';

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

describe('repeated', () => {
    it('works for non-packed', () => {
        const readRepeated = FieldTypes.repeated(FieldTypes.int32);
        expect(readRepeated.def).toEqual([]);
        const r = fromHex(`
            9601
            01`);
        // Note: normally for non-packed, these would be separated (prefix by) tags
        // but for this test we're just simulating the tags
        const first = readRepeated.read(r, WireType.Varint, 1, () => readRepeated.def);
        if (first instanceof Error)
            fail(first);
        expect(first).toEqual([150]);
        const second = readRepeated.read(r, WireType.Varint, 1, () => first);
        // the second should be appended to the first
        expect(second).toEqual([150, 1]);
        // make sure this hasn't modified the default value
        expect(readRepeated.def).toEqual([]);
    })

    it('skips wire type errors in non-packed', () => {
        const readRepeated = FieldTypes.repeated(FieldTypes.int32);
        expect(readRepeated.def).toEqual([]);
        const r = fromHex(`
            9601
            01`);
        // Note: normally for non-packed, these would be separated (prefix by) tags
        // but for this test we're just simulating the tags
        const first = readRepeated.read(r, WireType.Varint, 1, () => readRepeated.def);
        if (first instanceof Error)
            fail(first);
        expect(first).toEqual([150]);
        const second = readRepeated.read(r, WireType.Double, 1, () => first);
        // the second should be appended to the first
        expect(second).toEqual([150]);
        // make sure this hasn't modified the default value
        expect(readRepeated.def).toEqual([]);
    })

    it('works for packed', () => {
        const readRepeated = FieldTypes.repeated(FieldTypes.int32);
        expect(readRepeated.def).toEqual([]);
        const r = fromHex(`
            10
            9601
            01
            87ad4b
            ffffffffffffffffff01`);
        const result = readRepeated.read(r, WireType.LengthDelim, 1, () => readRepeated.def);
        if (result instanceof Error)
            fail(result);
        // this should have read everything in sequence
        expect(result).toEqual([150, 1, 1234567, -1]);
        // make sure this hasn't modified the default value
        expect(readRepeated.def).toEqual([]);
    })

    it('works for length delimited elements', () => {
        const readRepeated = FieldTypes.repeated(FieldTypes.string);
        let value = readRepeated.def;
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
})

describe('message', () => {
    type Msg = {readonly strVal: string};
    const fields: FieldTypes.FieldInfo[] = [
        [2, "wrongType", FieldTypes.string],
        [13, "strVal", FieldTypes.string],
    ]
    const msgField = FieldTypes.message<Msg>(fields);
    
    it('has undefined for a default', () => {
        expect(msgField.def).toBe(undefined);
    })
    
    it('has all of the expected parts', () => {
        expect(msgField.readValue).toBeDefined();
        expect(msgField.read).toBeDefined();
    })

    it('can read an empty message', () => {
        const r = fromHex(``);
        const value = msgField.readValue(r);
        expect(value.strVal).toBe("");
    })

    it('can read a populated message', () => {
        const r = fromHex(`6a09646f632062726f776e`);
        const value = msgField.readValue(r);
        expect(value.strVal).toBe("doc brown");
    })

    it('can dump correct json', () => {
        const r = fromHex(`6a09646f632062726f776e`);
        const value = msgField.readValue(r);
        expect(JSON.stringify(value)).toBe(`{"wrongType":"","strVal":"doc brown"}`);
    })

    it('handles unknown fields', () => {
        const r = fromHex(`0a07756e6b6e6f776e6a09646f632062726f776e`);
        const value = msgField.readValue(r);
        expect(value.strVal).toBe("doc brown");
        expect(JSON.stringify(value)).toBe(`{"wrongType":"","strVal":"doc brown"}`);
    })

    it('throws on bad wire types of fields', () => {
        const r = fromHex(`102a6a09646f632062726f776e`);
        expect(() => { msgField.readValue(r); }).toThrow(/invalid wire type/i);
    })

    it('can do delimited reads', () => {
        const r = fromHex(`0B6a09646f632062726f776e`);
        const value = msgField.read(r, WireType.LengthDelim, 1, () => msgField.def);
        if (value instanceof Error)
            fail(value);
        expect(value.strVal).toBe("doc brown");
    })

    it('returns error for bad wire type of whole message', () => {
        const r = fromHex(`0b6a09646f632062726f776e`);
        const value = msgField.read(r, WireType.Varint, 1, () => msgField.def);
        expect(value).toEqual(new Error("Invalid wire type for message: 0"));
    })

    it('has a hidden but accessible _vtable', () => {
        const r = fromHex(`6a09646f632062726f776e`);
        const value = msgField.readValue(r);
        expect((value as any)._vtable).toBeDefined();
    })

    it('can be repeated', () => {
        const repeated = FieldTypes.repeated(msgField);
        // Note: this stream is missing the tags, we'll just simulate them
        //       we don't need a field number for the repeated itself
        //       and we know the wire type will be LengthDelim
        const r = fromHex(`0b6a09646f632062726f776e 076a056d61727479`);
        let value = repeated.def;
        let result = repeated.read(r, WireType.LengthDelim, 1, () => value);
        if (result instanceof Error)
            fail(result);
        value = result;
        expect(value.length).toBe(1);
        expect(value[0].strVal).toBe("doc brown");
        result = repeated.read(r, WireType.LengthDelim, 1, () => value);
        if (result instanceof Error)
            fail(result);
        value = result;
        expect(value.length).toBe(2);
        expect(value[0].strVal).toBe("doc brown");
        expect(value[1].strVal).toBe("marty");
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
    const fields: FieldTypes.FieldInfo[] = [
        [1, "strVal", FieldTypes.oneof("test", FieldTypes.string)],
        [2, "intVal", FieldTypes.oneof("test", FieldTypes.int32)],
    ]
    const msgField = FieldTypes.message<Msg>(fields);

    it('has a default value of undefined', () => {
        expect(oneof[0].def).toBeUndefined();
        expect(oneof[1].def).toBeUndefined();
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
        let value = msgField.def;
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
        let value = msgField.def;
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
})