import {Helpers as H, WriteField as F} from '../src/protobuf-codec-ts'
import { writable } from "./mock";
import { EnumValue, EnumToNumber } from '../src/helpers';


describe('writers', () => {

    const writeContents: H.WriteMessage<string> = (w, value) => {
        F.string(w, value, 5);
    }

    describe('makeEnumWriter', () => {
        it('should call toNumber() and write the result', () => {
            const toNumber = ((v: string | EnumValue<"name"> | undefined) => parseInt(`${v}`)) as EnumToNumber<string, "name">;
            const writer = H.makeEnumWriter<"name", string>(toNumber)
            const w = writable();
            writer(w, "10");
            expect(w.toHexString()).toBe("0a");
        })
    })

    describe('makeDelimitedWriter', () => {
        it('should write a delimited message', () => {
            const writer = H.makeDelimitedWriter(writeContents)
            const w = writable();
            writer(w, "mattel aquarius");
            expect(w.toHexString()).toBe("112a0f6d617474656c206171756172697573");
        })
    })

    describe('makeFieldWriter', () => {
        it('should write tag and wire type', () => {
            const writer = H.makeFieldWriter(writeContents);
            const w = writable();
            writer(w, "mattel aquarius", 7);
            expect(w.toHexString()).toBe("3a2a0f6d617474656c206171756172697573");
        })
        it('should write raw data when no field is given', () => {
            const writer = H.makeFieldWriter(writeContents);
            const w = writable();
            writer(w, "mattel aquarius");
            expect(w.toHexString()).toBe("2a0f6d617474656c206171756172697573");
        })
        it('should write nothing for undefined values', () => {
            const writer = H.makeFieldWriter(writeContents);
            const w = writable();
            writer(w, undefined, 7);
            expect(w.toHexString()).toBe("");
        })
    })

    describe('makeEncoder', () => {
        it('should return raw encoded bytes', () => {
            const encoder = H.makeEncoder(writeContents);
            const output = encoder("XY");
            expect(output).toEqual(new Uint8Array([42, 2, 88, 89]));
        })
    })
})

namespace CoolEnum {
    type Value = H.EnumValue<"CoolEnum">;
    export const None = H.enumValue<"CoolEnum">(0, "None");
    export const Groovy = H.enumValue<"CoolEnum">(1, "Groovy");
    export const Rad = H.enumValue<"CoolEnum">(2, "Rad");
    type None = typeof None | "None" | 0;
    type Groovy = typeof Groovy | "Groovy" | 1;
    type Rad = typeof Rad | "Rad" | 2;

    export const map = new Map<string|number, H.EnumValue<"CoolEnum">>([
        ["none", CoolEnum.None],
        [0, CoolEnum.None],
        ["groovy", CoolEnum.Groovy],
        [1, CoolEnum.Groovy],
        ["rad", CoolEnum.Rad],
        [2, CoolEnum.Rad],
    ]);
}

describe('enum helpers', () => {
    describe('enumValue', () => {
        const e1 = H.enumValue<"CoolEnum">(1, "Groovy");

        it('should implement toString', () => {
            expect(`${e1}`).toBe("Groovy");
        })

        it('should implement toNumber', () => {
            expect(e1.toNumber()).toBe(1);
        })

        it('should implement toJson', () => {
            expect(JSON.stringify({e1: e1})).toBe(`{"e1":"Groovy"}`);
        })
    })

    describe('makeEnumConstructor', () => {
        const coolEnumFrom = H.makeEnumConstructor(CoolEnum.map);

        it('should be constructable from a number', () => {
            const actual = coolEnumFrom(2);
            expect(`${actual}`).toBe("Rad");
        })

        it('should be constructable from a string', () => {
            const actual = coolEnumFrom("Groovy");
            expect(actual.toNumber()).toBe(1);
        })

        it('should be constructable from another enum', () => {
            const actual = coolEnumFrom(CoolEnum.Groovy);
            expect(actual.toNumber()).toBe(1);
        })

        it('should fail for number out of range', () => {
            expect(() => coolEnumFrom(3)).toThrow(/invalid/i);
        })

        it('should fail for string out of domain', () => {
            expect(() => coolEnumFrom("Gnarly")).toThrow(/invalid/i);
        })

        describe('makeToNumber', () => {
            const toNumber = H.makeToNumber(coolEnumFrom);
            it('should convert to number', () => {
                expect(toNumber("Groovy")).toBe(1);
            })
            it('should fail to convert invalid string to number', () => {
                expect(() => toNumber("Gnarly")).toThrow(/invalid/i);
            })
            it('should pass undefined through', () => {
                expect(toNumber(undefined)).toBeUndefined();
            })
        })

        describe('makeToString', () => {
            const toString = H.makeToString(coolEnumFrom);
            it('should convert to string', () => {
                expect(toString(2)).toBe("Rad");
            })
            it('should fail to convert invalid number to string', () => {
                expect(() => toString("3")).toThrow(/invalid/i);
            })
            it('should pass undefined through', () => {
                expect(toString(undefined)).toBeUndefined();
            })
        })

    })
})