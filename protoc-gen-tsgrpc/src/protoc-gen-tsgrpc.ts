import {runPlugin} from "./codegen";
import {CodeGeneratorRequest} from "protoc-plugin";

const debug = (process.env["DEBUG"] !== undefined) ? console.error : () => {}

let data = '';
const stdin = process.stdin;
stdin.setEncoding('binary');
stdin.once('error', err => {
    debug("Error", err);
})
stdin.on('data', chunk => {
    if (data.length === 0) {
        debug("Stream start");
    }
    data += chunk;
});
stdin.on('end', () => {
    debug(`Stream end ${data.length} bytes`);
    const bytes = Buffer.from(data, 'binary');
    var request = CodeGeneratorRequest.deserializeBinary(bytes);
    const response = runPlugin(request);
    const output = response.serializeBinary();
    debug(`Output ${output.length} bytes`);
    process.stdout.write(output);
    debug(`Output complete`);
})

process.on('exit', () => {
    debug(`Finish`);
})
