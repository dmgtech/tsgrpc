import ts from 'typescript'
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
})