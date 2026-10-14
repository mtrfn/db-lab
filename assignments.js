'use strict';
(()=>{
 const el=id=>document.getElementById(id),C=AssignmentsCore;
 let session=null,api=null,working=false,controller=null,revision=0,assignments=[],detail=null;
 const stateNames={working:'În lucru · nepredată',submitted:'Predată',returned:'Returnată de profesor',reassigned:'Retrimisă pentru corectare',released:'Evaluată / publicată',excused:'Scutit',canceled:'Anulată'};
 function note(text){el('assignmentMessage').textContent=text}
 function controls(){const student=session&&!session.teacher;el('refreshAssignments').disabled=working||!session;el('assignmentPicker').disabled=working||!assignments.length;el('refreshSubmission').disabled=working||!student||!el('assignmentPicker').value;const can=student&&detail&&C.editable(detail.submission)&&detail.assignment.status==='assigned'&&(!detail.assignment.closeDateTime||Date.parse(detail.assignment.closeDateTime)>Date.now());el('attachAssignment').disabled=working||!can||!detail.assignment.allowStudentsToAddResourcesToSubmission;el('submitAssignment').disabled=working||!can||!C.projectResources(detail.resources).length;el('submitAssignment').textContent=detail?.submission.status==='submitted'?'✓ Tema este predată':'Predă tema';}
 function clearDetail(){detail=null;el('assignmentState').textContent='';el('assignmentDue').textContent='';el('assignmentFiles').replaceChildren();el('assignmentLink').hidden=true;controls()}
 function link(a){const target=el('assignmentLink');target.hidden=true;if(!a?.webUrl)return;try{const u=new URL(a.webUrl);if(u.protocol!=='https:')return;target.href=u.href;target.hidden=false}catch{}}
 function render(){if(!detail)return;const {assignment:a,submission:s,resources}=detail;el('assignmentState').textContent=stateNames[s.status]||('Stare Teams: '+s.status);el('assignmentState').classList.toggle('submitted',s.status==='submitted');el('assignmentDue').textContent=a.dueDateTime?'Termen de predare: '+new Date(a.dueDateTime).toLocaleString('ro-RO'):'';link(a);el('assignmentFiles').replaceChildren();for(const r of resources){const li=document.createElement('li');li.textContent=r.resource?.displayName||'Resursă';el('assignmentFiles').append(li)}controls()}
 async function run(action){if(working||!session)return;working=true;const rev=revision;controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),90000);controls();try{await action(controller.signal,()=>rev===revision)}catch(e){if(rev===revision)note(C.message(e))}finally{clearTimeout(timeout);working=false;controls()}}
 async function selected(signal,valid){clearDetail();const aid=el('assignmentPicker').value;if(!aid)return;const a=assignments.find(a=>a.id===aid);if(session.teacher){link(a);el('assignmentDue').textContent=a.dueDateTime?'Termen: '+new Date(a.dueDateTime).toLocaleString('ro-RO'):'';note('Mod profesor: deschide tema în Teams pentru lucrările elevilor. Descarcă fișierul .dblab.json și folosește Import în DB-Lab pentru a examina SQL-ul, datele și diagrama ERD.');return}note('Verific lucrarea și atașamentele…');const result=await C.detail(api,session.teamId,aid,session.userId,signal);if(!valid())return;detail=result;render();note(detail.submission.status==='submitted'?'Lucrarea este predată în Teams. Pentru corecturi, folosește Anulează predarea în Teams, apoi actualizează starea aici.':detail.assignment.allowStudentsToAddResourcesToSubmission?'Atașează proiectul curent, apoi apasă Predă tema. Fiecare versiune diferită este păstrată ca atașament separat.':'Această temă nu permite adăugarea de resurse. Profesorul trebuie să schimbe setarea în Teams.');}
 el('refreshAssignments').onclick=()=>run(async(signal,valid)=>{note('Încarc temele clasei…');clearDetail();const old=el('assignmentPicker').value;const items=await C.list(api,C.base(session.teamId),signal);if(!valid())return;assignments=items.filter(a=>a.status==='assigned').sort((a,b)=>String(a.dueDateTime||'9999').localeCompare(String(b.dueDateTime||'9999')));const picker=el('assignmentPicker');picker.replaceChildren();picker.add(new Option('Alege tema…',''));for(const a of assignments)picker.add(new Option(a.displayName||'Temă fără titlu',a.id));if(assignments.some(a=>a.id===old))picker.value=old;note(assignments.length?'Alege tema la care vrei să trimiți proiectul.':'Nu sunt teme publicate disponibile pentru acest cont în clasa curentă. Profesorul trebuie să creeze și să atribuie tema în Teams.');if(picker.value)await selected(signal,valid)});
 el('assignmentPicker').onchange=()=>run(selected);el('refreshSubmission').onclick=()=>run(selected);
 el('attachAssignment').onclick=()=>run(async(signal,valid)=>{
  const aid=el('assignmentPicker').value;
  // Capture synchronously before any network or authentication: this exact snapshot is uploaded.
  const project=DBLabWorkspace.snapshot();
  if(!confirm('Atașezi proiectul „'+project.name+'” la tema „'+detail.assignment.displayName+'”? Include baza de date și textul SQL curent. SQL-ul nu se execută automat.'))return;
  note('Pregătesc și atașez proiectul…');const packet=await C.prepare(project);await C.attach(api,session.teamId,aid,session.userId,packet,signal);if(!valid())return;
  detail=await C.detail(api,session.teamId,aid,session.userId,signal);if(!valid())return;render();note('✓ Proiect atașat: „'+project.name+'”. Tema nu este încă predată. Apasă Predă tema. Dacă modifici proiectul, atașează noua versiune înainte de predare.');
 });
 el('submitAssignment').onclick=()=>run(async(signal,valid)=>{
  const aid=el('assignmentPicker').value,packet=await C.prepare(DBLabWorkspace.snapshot());
  const matching=detail.resources.some(r=>r.resource?.displayName===packet.name);
  if(!matching){note('Proiectul curent diferă de atașamentele afișate. Apasă Atașează proiectul curent înainte de predare.');return}
  if(!confirm('Predai tema „'+detail.assignment.displayName+'” profesorului? Se trimit toate atașamentele din lista afișată.'))return;
  note('Trimit tema către profesor…');const result=await C.submit(api,session.teamId,aid,session.userId,signal);if(!valid())return;detail.submission=result;render();note('✓ Lucrarea a fost predată! Starea este confirmată de Microsoft Teams. Modificările locale ulterioare nu schimbă lucrarea predată.');
 });
 window.DBLabAssignments={
  get isBusy(){return working},
  disconnect(){revision++;controller?.abort();session=null;api=null;assignments=[];el('assignmentPicker').replaceChildren();clearDetail();note('Pentru predare, deschide DB-Lab în clasa Teams și conectează-te la Microsoft.');controls()},
  connect(info){this.disconnect();session=info;api=C.client(fetch,info.getToken);note(info.teacher?'Mod profesor: actualizează lista și deschide tema în Teams pentru evaluare.':'Cont verificat. Apasă Încarcă temele clasei.');controls()}
 };
 DBLabAssignments.disconnect();
})();
