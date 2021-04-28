#!/usr/bin/env node
// @ts-nocheck
try {
    require("./dist/protoc-gen-tsgrpc");
}
catch (e) {
    if (/Qualified path resolution failed/.test(e.message)) {
        console.error('-----------------------------------------------------------------------------------');
        console.error("WARN: Unable to 'require' protoc-gen-tsgrpc, perhaps you need to `yarn build` first");
        console.error("WARN: Perhaps you need to `yarn build` first");
        console.error('-----------------------------------------------------------------------------------');
        return;
    }
    throw e;
}
