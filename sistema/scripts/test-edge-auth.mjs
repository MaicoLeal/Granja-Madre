import ts from 'typescript';
import {readFileSync,writeFileSync,unlinkSync} from 'node:fs';
import assert from 'node:assert/strict';
const paths=['model','access'];
for(const name of paths)writeFileSync(new URL('../db/'+name+'.edge-test.mjs',import.meta.url),ts.transpileModule(readFileSync(new URL('../db/'+name+'.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
try{
const {applyCommand,emptyState}=await import('../db/model.edge-test.mjs');const {assertCommandAccess}=await import('../db/access.edge-test.mjs');
let valid=false,membership=null,row=null,dbCalls=0,writes=0,handler;
const query=table=>{
 dbCalls++;
 const q={select(){return q;},eq(){return q;},limit:async()=>({data:membership?[membership]:[],error:null}),maybeSingle:async()=>({data:row,error:null}),insert:async()=>{writes++;return {error:null};},update(){writes++;return q;},then(resolve){return Promise.resolve({data:[{revision:1}],error:null}).then(resolve);}};return q;
};
const createClient=()=>({auth:{getUser:async()=>({data:{user:valid?{id:'verified-user',email:'test@example.invalid'}:null},error:valid?null:{message:'invalid'}})},from:query});
const Deno={env:{get:key=>key==='SUPABASE_URL'?'https://nnlefxtchtfipjekmssx.supabase.co':'SERVER_TEST_ONLY'},serve:fn=>handler=fn};
const source=ts.transpileModule(readFileSync(new URL('../supabase/functions/production-api/index.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/^import .*;\s*$/gm,'');
new Function('createClient','applyCommand','emptyState','assertCommandAccess','Deno',source)(createClient,applyCommand,emptyState,assertCommandAccess,Deno);
const request=(body,token='test-token')=>new Request('https://edge.test/production-api',{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});
assert.equal((await handler(request({mode:'read'},''))).status,401);assert.equal(dbCalls,0);
assert.equal((await handler(request({mode:'read'}))).status,401);assert.equal(dbCalls,0);
valid=true;assert.equal((await handler(request({mode:'read'}))).status,403);assert.equal(writes,0);
membership={workspace_id:'workspace-test',role:'viewer',member_id:null};
const read=await handler(request({mode:'read'}));assert.equal(read.status,200);assert.equal((await read.json()).memberRole,'viewer');
assert.equal((await handler(request({mode:'command',revision:0,command:{type:'member',name:'Test',role:'Test'}}))).status,403);assert.equal(writes,0);
membership.role='admin';assert.equal((await handler(request({mode:'command',revision:3,command:{type:'member',name:'Test',role:'Test'}}))).status,409);assert.equal(writes,0);
const saved=await handler(request({mode:'command',revision:0,command:{type:'member',name:'Test',role:'Test'}}));assert.equal(saved.status,200);assert.equal(writes,1);const result=await saved.json();assert.equal(result.state.audit[0].actor,'test@example.invalid');
membership.member_id='inactive';assert.equal((await handler(request({mode:'command',revision:0,command:{type:'member',name:'Test',role:'Test'}}))).status,403);
console.log('PASS: Edge auth gate, invalid tokens before database access, membership, viewer write denial, revision conflicts, verified audit author and inactive profile. Mock services only.');
}finally{for(const name of paths)unlinkSync(new URL('../db/'+name+'.edge-test.mjs',import.meta.url));}
