const { fusebox } = require('fuse-box');
const { join } = require('path');

const fuse = fusebox({
  compilerOptions: {
    tsConfig: './tsconfig.json',
  },
  entry: './src/protoc-gen-wsgrpc.ts',
  target: 'server',
});

fuse.runProd({
    bundles: {
        app: {path: 'protoc-gen-wsgrpc.js'}
    }
});
