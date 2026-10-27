import ts from 'typescript';
import {readFileSync,writeFileSync,unlinkSync} from 'node:fs';
import assert from 'node:assert/strict';
const file=new URL('../db/access.test-runtime.mjs',import.meta.url);
writeFileSync(file,ts.transpileModule(readFileSync(new URL('../db/access.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
try{
const {canCommand,assertCommandAccess}=await import(file.href);
assert.equal(canCommand('viewer','production'),false);
assert.equal(canCommand('operator','review'),false);
assert.equal(canCommand('operator','member'),false);
assert.equal(canCommand('reviewer','production'),false);
assert.equal(canCommand('reviewer','review'),true);
assert.equal(canCommand('admin','member'),true);
assert.equal(canCommand('unknown','member'),false);
assert.throws(()=>assertCommandAccess('viewer',{type:'adjust'},null),/permiso/);
assert.throws(()=>assertCommandAccess('operator',{type:'step',operator:'someone-else'},'self'),/perfil/);
assert.throws(()=>assertCommandAccess('reviewer',{type:'review',reviewer:'self'},null),/perfil/);
assert.doesNotThrow(()=>assertCommandAccess('operator',{type:'step',operator:'self'},'self'));
assert.doesNotThrow(()=>assertCommandAccess('reviewer',{type:'review',reviewer:'self'},'self'));
console.log('PASS: role permissions, denied roles, linked operator identity and reviewer identity.');
}finally{unlinkSync(file);}
