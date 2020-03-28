import {example} from "./example.manual"

const {Inner, Outer, EnumType} = example;

const hexOf: (buffer: number[] | ArrayBuffer) => string = (buffer) =>
Array.from(new Uint8Array(buffer))
    .map((b: number) => b.toString(16).padStart(2, "0"))
    .join("")

const fromHex: (hex: string) => Uint8Array = (hex) => {
    const length = hex.length / 2;
    const array = new Uint8Array(length);
    for (let i = 0; i < length; i++)
        array[i] = parseInt(hex.substr(i * 2, 2), 16);
    return array;
}

describe("meta test hexOf <-> fromHex", () => {
    it('converts to/from empty', () => {
        expect(fromHex("")).toEqual(Uint8Array.from([]));
        expect(hexOf([])).toBe("");
    })

    it('converts to/from non-empty', () => {
        expect(fromHex("012345")).toEqual(Uint8Array.from([0x1, 0x23, 0x45]));
        expect(hexOf([0x1, 0x23, 0x45])).toBe("012345");
    })
})

describe("Special enum handling", () => {
    test('encode outer with enum works', () => {
        const encoded = Outer.encode({enumVal: EnumType.One});
        expect(hexOf(encoded)).toBe("6001");
    })
    
    test('encode outer with invalid numeric enum throws', () => {
        expect(() => Outer.encode({doubleVal: 1, enumVal: 3 as any}))
            .toThrow(/invalid/i);
    })
    
    test('EnumType toString()', () => {
        const actual = EnumType.toString(2);
        expect(actual).toBe("Two");
    })
    
    test('EnumType toString(undefined)', () => {
        const actual = EnumType.toString(undefined);
        expect(actual).toBeUndefined();
    })
    
    test('EnumType toJson()', () => {
        const stringified = JSON.stringify({e: EnumType.from(2)});
        expect(stringified).toBe(`{"e":"Two"}`);
    })

    test('encode outer with string enum works', () => {
        const encoded = Outer.encode({enumVal: "Two"});
        expect(hexOf(encoded)).toBe("6002");
    })
})

describe("Reference encoding", () => {
    test('encode inner works', () => {
        const encoded = Inner.encode({zigzagLong: "12345678901"});
        expect(hexOf(encoded)).toBe("8001eaf0e0fd5b");
    })

    test('encode empty inner works', () => {
        const encoded = Inner.encode({});
        expect(hexOf(encoded)).toBe("");
    })

    test('encode outer with numeric enum works', () => {
        const encoded = Outer.encode({enumVal: 2});
        expect(hexOf(encoded)).toBe("6002");
    })

    test('encode outer with inner works', () => {
        const encoded = Outer.encode({inner: {zigzagLong: "12345678901"}});
        expect(hexOf(encoded)).toBe("8a01078001eaf0e0fd5b");
    })

    test('encode outer within outer works', () => {
        const encoded = Outer.encode({doubleVal: 1, recursive: {doubleVal: 2}});
        expect(hexOf(encoded)).toBe("09000000000000f03fc20109090000000000000040");
    })

    test('encode repeated scalar', () => {
        const encoded = Outer.encode({doubles: [1, 0, 3]});
        expect(hexOf(encoded)).toBe("920118000000000000f03f00000000000000000000000000000840");
    })

    test('encode repeated message', () => {
        const encoded = Outer.encode({inners: [{zigzagInt: 1}, {}, {zigzagInt: 2}]});
        expect(hexOf(encoded)).toBe("9a010278029a01009a01027804");
    })
})

describe("Reference decoding", () => {
    test('decode inner works', () => { 
        const decoded = Inner.decode(fromHex("8001eaf0e0fd5b"));
        expect(decoded.zigzagLong).toBe("12345678901");
    })

    test('decode empty inner works', () => {
        const decoded = Inner.decode(fromHex(""));
        expect(decoded.zigzagLong).toBe("0");
    })

    test('decode outer with enum works', () => {
        const decoded = Outer.decode(fromHex("6002"));
        expect(decoded.enumVal).toBe(2);
    })

    test('decode outer with inner works', () => {
        const decoded = Outer.decode(fromHex("8a01078001eaf0e0fd5b"));
        expect(decoded.inner?.zigzagLong).toBe("12345678901")
    })

    test('decode outer within outer works', () => {
        const decoded = Outer.decode(fromHex("09000000000000f03fc20109090000000000000040"));
        expect(decoded.doubleVal).toBe(1);
        expect(decoded.recursive?.doubleVal).toBe(2);
    })

    test('decode repeated scalar', () => {
        const decoded = Outer.decode(fromHex("920118000000000000f03f00000000000000000000000000000840"));
        expect(decoded.doubles).toStrictEqual([1, 0, 3]);
    })

    test('decode repeated message', () => {
        const decoded = Outer.decode(fromHex(`9a01056d010000009a01056d2a000000`));
        expect(decoded.inners.length).toBe(2);
        expect(decoded.inners[0].intFixed).toBe(1);
        expect(decoded.inners[1].intFixed).toBe(42);
    })
})

describe("map handling", () => {
    test('map of string:string works', () => {
        const encoded = Outer.encode({map: {one: "uno", two: "dos"}});
        expect(hexOf(encoded)).toBe("a2010a0a036f6e651203756e6fa2010a0a0374776f1203646f73");
    })

    test('map of string:message works', () => {
        const encoded = Outer.encode({mapInner: {one: {intFixed: 1}, two: {}}});
        expect(hexOf(encoded)).toBe("aa010c0a036f6e6512056d01000000aa01070a0374776f1200");
    })

    test('map of int64:int32 works', () => {
        const encoded = Outer.encode({mapInts: {1: 1, "12345678901": 999}});
        expect(hexOf(encoded)).toBe("b2010408011001b2010908b5b8f0fe2d10e707");
    })

    test('map of int64:int32 with default value works', () => {
        const encoded = Outer.encode({mapInts: {1: 0, 170: 1}});
        expect(hexOf(encoded)).toBe("b201020801b2010508aa011001");
    })

    test('map of int64:int32 with default key works', () => {
        const encoded = Outer.encode({mapInts: {0: 170, 1: 1}});
        expect(hexOf(encoded)).toBe("b2010310aa01b2010408011001");
    })

    test('map of boolean:string works', () => {
        const encoded = Outer.encode({mapBool: {true: "yep", false: "nope"}});
        expect(hexOf(encoded)).toBe("ba010708011203796570ba010612046e6f7065");
    })

    test('map of boolean:string only true case works', () => {
        const encoded = Outer.encode({mapBool: {true: "yep"}});
        expect(hexOf(encoded)).toBe("ba010708011203796570");
    })

    test('map of boolean:string with default value works', () => {
        const encoded = Outer.encode({mapBool: {true: "yep", false: ""}});
        expect(hexOf(encoded)).toBe("ba010708011203796570ba0100");
    })
})

describe("oneof handling", () => {
    test('no options writes nothing', () => {
        const encoded = Outer.encode({});
        expect(hexOf(encoded)).toBe("");
    })
    test('one option writes that option', () => {
        const encoded = Outer.encode({stringOption: "string value"});
        expect(hexOf(encoded)).toBe("d2010c737472696e672076616c7565");
    })
    test('other option writes that option', () => {
        const encoded = Outer.encode({innerOption: {}});
        expect(hexOf(encoded)).toBe("ca0100");
    })
    // Note: this is allowed to match either one of them
    //       you should not expect the order to be predictable
    //       this test is here to make sure that exactly one of them gets encoded and gets encoded correctly
    //       it should be considered a failure if we encode both or neither or either incorrectly
    test("both options writes only one", () => {
        const encoded = Outer.encode({innerOption: {}, stringOption: "string value"});
        expect(hexOf(encoded)).toMatch(/ca0100|d2010c737472696e672076616c7565/);
    })
})