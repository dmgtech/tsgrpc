import ts from 'typescript'
import {transformFileAsync, TransformOptions} from '@babel/core'
import fs from 'fs'
import path from 'path'

const refFolder = path.join(__dirname, 'reference');
const examplePath = path.join(refFolder, 'example.proto.gen.ts');
const importPath = path.join(refFolder, 'importable', 'importMe.proto.gen.ts');

describe("compilability of generated code", () => {
    it('can be compiled by tsc', () => {
        const compileOptions: ts.CompilerOptions = {
            strict: true,
            skipLibCheck: true,
            noEmit: true,
        }
        const files = [examplePath, importPath];
        const program = ts.createProgram(files, compileOptions);
        const diags = ts.getPreEmitDiagnostics(program);
        const errors = diags.filter(d => d.category === 1 /* Error */).map(d => d.messageText);
        expect(errors).toEqual([]);
    })

    it('can be compiled by babel', async () => {
        const options: TransformOptions = {
            presets: [[require.resolve('@babel/preset-typescript'), {
                // Currently create-react-app has this as false
                //   which means we have to generate code that compiles without it
                allowNamespaces: false,
            }]],
            babelrc: false,
            configFile: false,
            compact: false,
        }
        const output1 = await transformFileAsync(examplePath, options);
        const output2 = await transformFileAsync(importPath, options);
    })
})