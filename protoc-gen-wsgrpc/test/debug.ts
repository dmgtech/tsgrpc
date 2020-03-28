import {example} from "./example.manual"
const {Inner, Outer, EnumType} = example;

const fromHex: (hex: string) => Uint8Array = (hex) => {
    const length = hex.length / 2;
    const array = new Uint8Array(length);
    for (let i = 0; i < length; i++)
        array[i] = parseInt(hex.substr(i * 2, 2), 16);
    return array;
}

const decoded = Outer.decode(fromHex("09000000000000f03fc20109090000000000000040"));


console.log(JSON.stringify(decoded, null, 4));
console.log(JSON.stringify(decoded, ["zigzagLong"], 4));
console.log(decoded.enumVal)
for (const x in decoded) {
    console.log("property", x, (decoded as any)[x]);
}