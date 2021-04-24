
# protoc-gen-tsgrpc
An idiomatic typescript generator for protocol buffers (proto3) and gRPC

The goal of this project is to provide a protocol buffer experience tailor-made for Typescript developers, that feels natural to use without sacrificing any of its features.

```bash 
npm i @dmgtech/protoc-gen-tsgrpc
```

```json
/* package.json */
"scripts": {
    "gen":  "protoc-tsgrpc --recurse=./proto --tsgrpc_out=./src/generated"
}
```

```bash
# generate the typescript from .proto files
npm run gen
```

## Idiomatic Functional Typescript/Javascript
### Functional
This library uses functions that operate on plain old javascript objects.  Protocol buffer messages are not special objects with special methods.  There is no special message class to construct.  You encode from javascript literal to bytes using functions.

```protobuf
message Player {
    first_name: string = 1;
    last_name: string = 2;
    game: string = 3;
}
```

```typescript
const bytes = Player.encode({
    firstName: "Roger",
    lastName: "Federer",
    game: "Tennis",
})
```

### Idiomatic
In order to allow the most idiomatic experience within Typescript, there are two different representations of protobuf messages within this library called "strict" and "loose" that are designed for the two major sets of use cases.  This library will generate strict and loose type definitions for each protobuf message.

#### Loose Representation
The **Loose** representation of a protocol buffer message allows all fields to simply be omitted.  This is the most convenient representation for specifying a protocol buffer value as an object literal, and also for converting to JSON when necessary.  Typically, this is the representation that *you* will use when constructing a message in the code.

Because the types for the loose representation are generated for you, you get the benefit of having Typescript type validation when providing object literals and will get warned if you specify a non-existent field, misspell a field, or provide an out-of-range value (such as a string in a non-string field, or an enumeration value that doesn't exist).  And you get this validation with plain old javascript object literal syntax.

The loose representation also allows specifying the numeric, or string value of an `enum`, but restricts the allowed values to those that are defined by the proto.

`map` fields can be either a `Map` or an object literal, or omitted when empty.

Even `oneof`s are supported correctly so that if you specify a literal with more than one of a `oneof`'s options present, it is recognized as a typescript type error.

#### Strict Representation
The **Strict** representation of a protocol buffer message represents all fields of primitive types as non-nullable as in the proto3 spec.  Fields not populated return their default values, e.g. `int32` fields are `0` and `string` fields are `""`.  `repeated` and `map` fields are also present even if empty.  This matches the proto3 specification and is also the most convenient representation to use.  So this is the type of object that a the protocol buffers are decoded into.

`enum` values in the strict format are instances of special enumeration objects.

`map` fields are represented with javascript `Map`s in this representation.
  
### Immutable
All fields are typescript-declared `readonly`.

## Modular
The gRPC implementation is provided by other packages allowing the same code here to work in a browser, or in node.js, or a mobile environment (like React Native), or in fact any custom implementation.