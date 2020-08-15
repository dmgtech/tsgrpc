import {Helpers as H, WriteField as F} from '../src/protobuf-codec-ts'
import { writable } from "./mock";
import { ValueWriter } from '../src/helpers';

describe('writers', () => {

    const writeContents: ValueWriter<string> = (w, value) => {
        F.string(w, value, 5);
    }

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

describe('once', () => {
    it('only runs a function once', () => {
        const fn = jest.fn(() => "value");
        const o = H.once(fn);
        expect(fn).toBeCalledTimes(0);
        const result1 = o();
        expect(result1).toBe("value");
        expect(fn).toBeCalledTimes(1);
        const result2 = o();
        expect(result2).toBe("value");
        expect(fn).toBeCalledTimes(1);
    })
})