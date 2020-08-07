import {runPlugin} from "./codegen";
import {CodeGeneratorRequest} from "protoc-plugin";
import fs from "fs"

const data = fs.readFileSync(0);
const request = CodeGeneratorRequest.deserializeBinary(data);

const response = runPlugin(request);

process.stdout.write(response.serializeBinary());