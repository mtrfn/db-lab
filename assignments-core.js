'use strict';
const AssignmentsCore=(()=>{
 const T=typeof TeamsCore!=='undefined'?TeamsCore:require('./teams-core.js');
 const ROOT='https://graph.microsoft.com/v1.0',LIMIT=20*1024*1024;
 const segment=x=>{if(typeof x!=='string'||!x||/[\x00-\x20/\\?#]/.test(x)||x==='.'||x==='..')throw Error('Identificator de resursă invalid.');return encodeURIComponent(x)};
 function itemURL(value){const u=new URL(T.endpoint(value));if(u.search||u.hash||!/^\/v1\.0\/drives\/[^/]+\/items\/[^/:]+$/.test(u.pathname))throw Error('Adresa fișierului Microsoft este invalidă.');return u.href}
 function client(fetcher,getToken){return async(path,{method='GET',body,raw=false,signal}={})=>{
  const url=T.endpoint(path.startsWith('/')?ROOT+path:path),token=await getToken();signal?.throwIfAborted();
  const headers={Authorization:'Bearer '+token};if(body!==undefined)headers['Content-Type']=raw?'application/octet-stream':'application/json';
  const r=await fetcher(url,{method,headers,body:body===undefined?undefined:raw?body:JSON.stringify(body),credentials:'omit',redirect:'error',cache:'no-store',signal});
  if(!r.ok){const e=new Error('Microsoft Graph: HTTP '+r.status);e.status=r.status;throw e}return r.status===204?null:T.limitedJSON(r);
 }}
 const list=(api,path,signal)=>T.list((p,s)=>api(p,{signal:s}),path,signal);
 const base=team=>'/education/classes/'+T.id(team)+'/assignments';
 const assignmentPath=(team,aid)=>base(team)+'/'+segment(aid);
 const submissionPath=(team,aid,sid)=>assignmentPath(team,aid)+'/submissions/'+segment(sid);
 function owns(s,user){return s?.recipient?.['@odata.type']==='#microsoft.graph.educationSubmissionIndividualRecipient'&&s.recipient.userId?.toLowerCase()===T.id(user)}
 function editable(s){return ['working','returned','reassigned'].includes(s?.status)}
 function check(a,s,user){if(!owns(s,user))throw Error('Lucrarea nu aparține contului conectat.');if(!editable(s))throw Error('Lucrarea nu este deschisă pentru modificări. Verifică starea în Teams.');if(a.status!=='assigned')throw Error('Tema nu este publicată sau este închisă.');if(a.closeDateTime&&Date.parse(a.closeDateTime)<=Date.now())throw Error('Termenul de închidere al temei a trecut.');}
 async function detail(api,team,aid,user,signal){const path=assignmentPath(team,aid);const a=await api(path,{signal});const subs=await list(api,path+'/submissions',signal);const matches=subs.filter(s=>owns(s,user));if(matches.length!==1)throw Error('Nu am identificat o lucrare individuală pentru acest cont. Verifică tema în Teams.');const s=matches[0];const resources=await list(api,submissionPath(team,aid,s.id)+'/resources',signal);return {assignment:a,submission:s,resources}}
 async function digest(text){const hash=await globalThis.crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return Array.from(new Uint8Array(hash),x=>x.toString(16).padStart(2,'0')).join('')}
 async function prepare(project){if(project?.format!=='DB-Lab'||project.version!==1||!Array.isArray(project.bytes))throw Error('Proiect invalid.');const text=JSON.stringify(project);const blob=new Blob([text],{type:'application/json'});if(blob.size>LIMIT)throw Error('Proiectul depășește limita de 20 MB.');const hash=await digest(text);return {text,blob,name:'DB-Lab-'+hash+'.dblab.json',projectName:project.name,hash}}
 function projectResources(resources){return resources.filter(r=>typeof r.resource?.displayName==='string'&&/^DB-Lab-[a-f0-9]{64}\.dblab\.json$/.test(r.resource.displayName)&&r.resource.fileUrl)}
 async function attach(api,team,aid,user,packet,signal){
  const d=await detail(api,team,aid,user,signal);check(d.assignment,d.submission,user);
  if(!d.assignment.allowStudentsToAddResourcesToSubmission)throw Error('Profesorul trebuie să permită adăugarea de resurse la această temă.');
  const existing=d.resources.find(r=>r.resource?.displayName===packet.name);if(existing)return {resource:existing,duplicate:true};
  const path=submissionPath(team,aid,d.submission.id);
  let s=d.submission;if(!s.resourcesFolderUrl)s=await api(path+'/setUpResourcesFolder',{method:'POST',body:{},signal});
  const folder=itemURL(s.resourcesFolderUrl),file=await api(folder+':/'+encodeURIComponent(packet.name)+':/content',{method:'PUT',body:packet.blob,raw:true,signal});
  if(!file?.id||!file.file)throw Error('Microsoft nu a confirmat încărcarea fișierului. Actualizează starea înainte de reîncercare.');
  const folderURL=new URL(folder),drive=folderURL.pathname.split('/')[3];
  const fileUrl=ROOT+'/drives/'+drive+'/items/'+segment(file.id);
  // Read again before registering: retries must not create a second resource for the same snapshot.
  const current=await list(api,path+'/resources',signal);const match=current.find(r=>r.resource?.fileUrl===fileUrl||r.resource?.displayName===packet.name);if(match)return {resource:match,duplicate:true};
  const resource=await api(path+'/resources',{method:'POST',body:{resource:{'@odata.type':'#microsoft.graph.educationFileResource',displayName:packet.name,fileUrl}},signal});
  if(!resource?.id)throw Error('Atașarea nu este confirmată. Actualizează starea temei.');return {resource,duplicate:false};
 }
 async function submit(api,team,aid,user,signal){const d=await detail(api,team,aid,user,signal);if(!owns(d.submission,user))throw Error('Lucrarea nu aparține contului conectat.');if(d.submission.status==='submitted')return d.submission;check(d.assignment,d.submission,user);if(!projectResources(d.resources).length)throw Error('Atașează mai întâi un proiect DB-Lab.');const path=submissionPath(team,aid,d.submission.id);const result=await api(path+'/submit',{method:'POST',signal});if(result?.status==='submitted')return result;const confirmed=await api(path,{signal});if(confirmed.status!=='submitted')throw Error('Predarea nu este încă confirmată. Apasă Actualizează starea sau verifică în Teams.');return confirmed}
 function message(e){if(e.name==='AbortError'||e.name==='TimeoutError')return 'Operația a fost întreruptă sau a expirat. Actualizează starea înainte de reîncercare; Microsoft poate să fi procesat cererea.';if(e.status===403)return 'Acces refuzat. Administratorul trebuie să aprobe EduAssignments.ReadWrite și Files.ReadWrite.All (permisiuni delegate). Verifică și accesul la tema clasei.';if(e.status===401)return 'Sesiunea Microsoft a expirat. Reconectează-te.';if(e.status===404)return 'Tema sau lucrarea nu mai este disponibilă. Actualizează lista temelor.';if(e.status===429)return 'Microsoft limitează temporar cererile. Așteaptă puțin, apoi actualizează starea.';if(e.status===400)return 'Microsoft a refuzat operația. Verifică în Teams dacă tema este deschisă și permite atașamente.';if(e.status>=500||e instanceof TypeError)return 'Conexiunea cu Microsoft nu a fost finalizată. Actualizează starea înainte de reîncercare.';return e.message||'Operația nu a reușit.'}
 return {client,list,base,detail,prepare,attach,submit,editable,owns,check,itemURL,projectResources,message};
})();
if(typeof module!=='undefined')module.exports=AssignmentsCore;
