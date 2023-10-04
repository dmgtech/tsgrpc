#!/usr/bin/env node
'use strict';
const path = require('path');
const fs = require('fs');
const {execFile} = require('child_process');
const {platform} = process;
const exe = platform === 'win32' ? '.exe' : '';
const cmd = platform === 'win32' ? '.cmd' : '';
const grpcToolsPath = path.dirname(require.resolve("grpc-tools"));
const pnpApi = process.versions.pnp ? require('pnpapi') : undefined;
const protoc = path.join(grpcToolsPath, "bin", `protoc${exe}`);
const plugin = path.join(__dirname, '..', '.bin', `protoc-gen-tsgrpc${cmd}`);
function recurse(entry) {
  const stat = fs.statSync(entry);
  if (stat.isDirectory()) {
    const names = fs.readdirSync(entry);
    return names.flatMap(name => recurse(path.join(entry, name)))
  }
  else if (stat.isFile() && /\.proto$/.test(entry)) {
    return [entry];
  }
  return [];
}
const inArgs = process.argv.slice(2).flatMap(f => {
  if (/^--recurse=/.test(f)) {
    const folder = path.normalize(f.replace(/^--recurse=/, ""));
    const allFiles = recurse(folder)
    return ["-I", folder, allFiles].flat();
  }
  return f;
})
const args = ['--plugin=protoc-gen-tsgrpc=' + plugin].concat(inArgs);

// attempt to create any output folders
// (because it is annoying that protoc doesn't try to do this for you)
const outFolders = args
  .filter(a => /^--tsgrpc_out=/.test(a))
  .map(a => path.normalize(a.replace(/^--tsgrpc_out=/, "")))
for (const outFolder of outFolders) {
  if (!fs.existsSync(outFolder)) {
    fs.mkdirSync(outFolder, {recursive: true});
    fs.writeFileSync(path.join(outFolder, '.gitignore'), "**/*\n!.gitignore\n!surrogates.ts\n");
  }
}

const child = execFile(protoc, args, function(error, stdout, stderr) {
  if (error) {
    throw error;
  }
});

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
