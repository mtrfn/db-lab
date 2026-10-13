importScripts('./vendor/sql-wasm.js');
let SQL,db;
const ready=initSqlJs({locateFile:f=>'./vendor/'+f}).then(s=>SQL=s);
const quote=x=>'"'+String(x).replaceAll('"','""')+'"';
function rows(sql){const r=db.exec(sql)[0];return r?r.values.map(v=>Object.fromEntries(r.columns.map((k,i)=>[k,v[i]]))):[]}
function snapshot(){return rows("SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").map(t=>({name:t.name,columns:rows('PRAGMA table_xinfo('+quote(t.name)+')'),foreign:rows('PRAGMA foreign_key_list('+quote(t.name)+')'),data:db.exec('SELECT * FROM '+quote(t.name)+' LIMIT 200')[0]||{columns:[],values:[]}}))}
onmessage=async e=>{let old;try{await ready;const m=e.data;if(m.kind==='load'){const candidate=m.bytes?new SQL.Database(new Uint8Array(m.bytes)):new SQL.Database();if(candidate.exec('PRAGMA integrity_check')[0]?.values[0][0]!=='ok'){candidate.close();throw Error('Bază SQLite deteriorată.')}old=db;db=candidate;db.exec('PRAGMA foreign_keys=ON');}else{old=db;db=new SQL.Database(old.export());db.exec('PRAGMA foreign_keys=ON');if(m.params)db.run(m.sql,m.params);else var result=db.exec(m.sql);if(db.exec('PRAGMA foreign_key_check')[0]?.values.length)throw Error('Relațiile dintre tabele sunt încălcate.');}
const state=snapshot(),bytes=db.export();db.exec('PRAGMA foreign_keys=ON');old?.close();postMessage({id:e.data.id,state,bytes,result:result||[]});}catch(err){if(old){db?.close();db=old;db.exec('PRAGMA foreign_keys=ON');}postMessage({id:e.data.id,error:err.message});}};
