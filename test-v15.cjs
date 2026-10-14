'use strict';
const assert=require('node:assert/strict'),C=require('./assignments-core.js');
const team='11111111-1111-4111-8111-111111111111',user='22222222-2222-4222-8222-222222222222',other='33333333-3333-4333-8333-333333333333';
function server(){const x={a:{id:'a1',status:'assigned',allowStudentsToAddResourcesToSubmission:true},s:{id:'s1',status:'working',recipient:{'@odata.type':'#microsoft.graph.educationSubmissionIndividualRecipient',userId:user}},resources:[],requests:[]};
x.api=C.client(async(url,o)=>{x.requests.push({url,...o});assert.equal(o.headers.Authorization,'Bearer token');assert.equal(o.redirect,'error');const p=new URL(url).pathname,reply=v=>new Response(JSON.stringify(v));
if(o.method==='PUT'){if(x.failUpload)return new Response('',{status:403});assert.equal(o.headers['Content-Type'],'application/octet-stream');assert((await o.body.text()).includes('DB-Lab'));return reply({id:'file1',file:{}})}
if(p.endsWith('/setUpResourcesFolder')){assert.equal(o.body,'{}');x.s.resourcesFolderUrl='https://graph.microsoft.com/v1.0/drives/drive1/items/folder1';return reply(x.s)}
if(p.endsWith('/resources')){if(o.method==='POST'){const r={id:'r1',...JSON.parse(o.body)};x.resources.push(r);if(x.loseRegister){x.loseRegister=false;throw new TypeError('lost response')}return reply(r)}return reply({value:x.resources})}
if(p.endsWith('/submit')){assert.equal(o.body,undefined);x.s.status='submitted';if(x.loseSubmit){x.loseSubmit=false;throw new TypeError('lost response')}return reply(x.s)}
if(p.endsWith('/assignments'))return reply({value:[{...x.a,displayName:'Tema de test'}]});
if(p.endsWith('/submissions'))return reply({value:[{...x.s,recipient:{...x.s.recipient,userId:other}},x.s]});
if(p.endsWith('/s1'))return reply(x.s);if(p.endsWith('/a1'))return reply(x.a);throw Error('Unexpected '+url);
},async()=>'token');return x;}
if(require.main===module)(async()=>{
const packet=await C.prepare({format:'DB-Lab',version:1,name:'Proiect',sql:'SELECT 1;',bytes:[0,1,2]});
assert.equal(packet.name,(await C.prepare(JSON.parse(packet.text))).name);assert.notEqual(packet.name,(await C.prepare({...JSON.parse(packet.text),sql:'SELECT 2;'})).name);
for(const url of ['https://evil.invalid/v1.0/drives/a/items/b','https://graph.microsoft.com/v1.0/me','https://graph.microsoft.com/v1.0/drives/a/items/b?x=y'])assert.throws(()=>C.itemURL(url));
let network=0;await assert.rejects(C.client(async()=>{network++},async()=>'token')('https://evil.invalid/steal'));assert.equal(network,0);
const controller=new AbortController();controller.abort();await assert.rejects(C.client(async()=>{network++},async()=>'token')('/me',{signal:controller.signal}));assert.equal(network,0);
let x=server();await assert.rejects(C.submit(x.api,team,'a1',user),/Atașează/);assert.equal(x.requests.filter(r=>r.method==='POST').length,0);
x=server();await C.attach(x.api,team,'a1',user,packet);assert.equal(x.resources.length,1);assert.equal(x.resources[0].resource.fileUrl,'https://graph.microsoft.com/v1.0/drives/drive1/items/file1');assert.equal(x.s.status,'working');assert.deepEqual(x.requests.filter(r=>r.method!=='GET').map(r=>r.method),['POST','PUT','POST']);
await C.attach(x.api,team,'a1',user,packet);assert.equal(x.resources.length,1);assert.equal(x.requests.filter(r=>r.method==='PUT').length,1);
assert.equal((await C.submit(x.api,team,'a1',user)).status,'submitted');await C.submit(x.api,team,'a1',user);assert.equal(x.requests.filter(r=>r.url.endsWith('/submit')).length,1);await assert.rejects(C.attach(x.api,team,'a1',user,packet),/deschisă/);
x=server();x.loseRegister=true;await assert.rejects(C.attach(x.api,team,'a1',user,packet));await C.attach(x.api,team,'a1',user,packet);assert.equal(x.resources.length,1);
x.loseSubmit=true;await assert.rejects(C.submit(x.api,team,'a1',user));assert.equal((await C.submit(x.api,team,'a1',user)).status,'submitted');assert.equal(x.requests.filter(r=>r.url.endsWith('/submit')).length,1);
x=server();x.failUpload=true;await assert.rejects(C.attach(x.api,team,'a1',user,packet));assert.equal(x.resources.length,0);assert.equal(x.s.status,'working');
x=server();x.a.allowStudentsToAddResourcesToSubmission=false;await assert.rejects(C.attach(x.api,team,'a1',user,packet),/permită/);assert.equal(x.requests.filter(r=>r.method!=='GET').length,0);
x=server();x.a.closeDateTime='2020-01-01T00:00:00Z';await assert.rejects(C.attach(x.api,team,'a1',user,packet),/închidere/);
x=server();x.s.recipient.userId=other;await assert.rejects(C.attach(x.api,team,'a1',user,packet),/individuală/);assert.equal(x.requests.filter(r=>r.method!=='GET').length,0);
x=server();x.s.recipient={'@odata.type':'#microsoft.graph.educationSubmissionClassRecipient'};await assert.rejects(C.attach(x.api,team,'a1',user,packet),/individuală/);
await assert.rejects(C.prepare({format:'DB-Lab',version:1,bytes:[],sql:'x'.repeat(20*1024*1024)}),/20 MB/);
let pages=0;assert.deepEqual(await C.list(async()=>++pages===1?{value:[1],'@odata.nextLink':'https://graph.microsoft.com/v1.0/education/classes/'+team+'/assignments?$skiptoken=2'}:{value:[2]},C.base(team)),[1,2]);
await assert.rejects(C.list(async()=>({value:[],'@odata.nextLink':'https://evil.invalid/token'}),C.base(team)));
console.log('PASS V1.5: own submission, origin restriction, cancellation, snapshot, upload/register/submit, duplicate retries, uncertain response recovery, permissions/deadline/state guards, size limit, pagination.');
})().catch(e=>{console.error(e);process.exitCode=1});

module.exports={server,team,user};
