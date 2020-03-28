import {CodeGeneratorRequest, CodeGeneratorResponse} from "protoc-plugin";

// we need to be able to parse a CodeGeneratorRequest from stdin

// not entirely sure the best way to do this given the generated code.

import fs from "fs"
const data = fs.readFileSync(0);

const request = CodeGeneratorRequest.deserializeBinary(data);

console.error(request.toObject());


const response = new CodeGeneratorResponse();
response.setError("Not implemented");
process.stdout.write(response.serializeBinary());
