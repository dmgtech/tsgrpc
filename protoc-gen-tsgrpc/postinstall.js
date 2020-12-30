// right now this is just here to force a post install because this must generate an single executable command to function
// i.e. yarn run protoc-gen-tsgrpc can't work because the protoc compiler won't call a thing with arguments
// So as long as this is true, we have a post install script to make sure that yarn will unplug it and generate that

const path = require('path');
const fs = require('fs');

const pnpApi = process.versions.pnp ? require('pnpapi') : undefined;
if (pnpApi) {
    const dotbin = path.join(__dirname, '..', '.bin');
    const posix = path.join(dotbin, `protoc-gen-tsgrpc`);
    const win = path.join(dotbin, `protoc-gen-tsgrpc.cmd`);
    if (!fs.existsSync(dotbin)) {
        fs.mkdirSync(dotbin);
    }
    fs.writeFileSync(posix, `#!/bin/sh\nyarn run protoc-gen-tsgrpc "$@"`, {mode: 0o755});
    fs.writeFileSync(win, `@yarn run protoc-gen-tsgrpc %*`);
}
