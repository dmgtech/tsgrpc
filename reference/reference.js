const { join } = require('path');
const { load } = require('protobufjs');

const protoPath = join(__dirname, "../protoc-gen-wsgrpc/test/example.proto");
console.log("proto:", protoPath);

const testCases = [
    {
        message: "Inner",
        title: "encode inner works",
        decoded: `{zigzagLong: '12345678901'}`,
    },    
    {
        message: "Inner",
        title: "encode empty inner works",
        decoded: `{}`,
    },    
    {
        message: "Outer",
        title: "encode outer with numeric enum works",
        decoded: `{enumVal: 2}`,
    },    
    {
        message: "Outer",
        title: "encode outer with inner works",
        decoded: `{inner: {zigzagLong: '12345678901'}}`,
    },    
    {
        message: "Outer",
        title: "encode outer within outer works",
        decoded: `{doubleVal: 1, recursive: {doubleVal: 2}}`,
    },
    {
        message: "Outer",
        title: "encode repeated scalar",
        decoded: `{doubles: [1, 0, 3]}`,
    },
    {
        message: "Outer",
        title: "encode repeated message",
        decoded: `{inners: [{zigzagInt: 1}, {}, {zigzagInt: 2}]}`,
    },
    {
        message: "Outer",
        title: "map of strings works",
        decoded: `{map: {one: "uno", two: "dos"}}`,
    },
    {
        message: "Outer",
        title: "invalid",
        decoded: `{doubles: 1.0}`,
    },
]

const hexOf = (buffer) =>
Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

function toLiteral(obj) {
    if (typeof obj === "string" || typeof obj === "number" || obj === undefined || obj === null)
        return JSON.stringify(obj);
    if (Array.isArray(obj))
        return `[${obj.map(v => toLiteral(v)).join(", ")}]`
    return `{${Object.keys(obj).map(k => `${k}: ${toLiteral(obj[k])}`).join(", ")}}`
}

function dumpTest(root, testCase) {
    const namespace = "example";
    const fqname =`${(namespace && `${namespace}.`)}${testCase.message}`;
    const Message = root.lookupType(fqname);
    const decoded = eval(`(${testCase.decoded})`);
    const encoded = Message.encode(decoded).finish();

    const validate = false;
    const err = Message.verify(decoded);

    if (validate && err) {
        console.log(`
        test('${testCase.title}', () => {
            expect(() => ${testCase.message}.encode(${testCase.decoded} as any)).toThrow(/${err}/);
        })`)
    }
    else {
        console.log(`
        test('${testCase.title}', () => {
            const encoded = ${testCase.message}.encode(${testCase.decoded});
            expect(hexOf(encoded)).toBe("${hexOf(encoded)}");
        })`)
    }
}

load(protoPath, function(err, root) {
    if (err) {
        console.error(err);
        return;
    }
    console.log("proto: Loaded");

    if (process.argv.length > 2) {
        const testCase = {
            message: process.argv[2],
            title: "<<TODO>>",
            decoded: process.argv[3],
        }
        dumpTest(root, testCase);
        return;
    }
    
    for (const testCase of testCases) {
        dumpTest(root, testCase);
    }

})