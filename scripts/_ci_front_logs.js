const https = require('https');
const REPO = 'Ayamouine/pfa-devops-reservation';
const RUN = '35440112110';
const opt = { hostname:'api.github.com', headers:{'User-Agent':'node','Accept':'application/vnd.github+json'} };
function get(p){return new Promise((res,rej)=>{https.get({...opt,path:p},r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>{try{res(JSON.parse(d))}catch(e){rej({p,err:e.message,head:d.slice(0,200)})}})}).on('error',rej)})}
(async()=>{
  const jobs = await get('/repos/'+REPO+'/actions/runs/'+RUN+'/jobs');
  const jf = (jobs.jobs||[]).find(j=>j.name==='Build frontend');
  if(!jf){ console.log('JOB_FRONTEND_ABS'); return; }
  console.log('JOB found id='+jf.id+' conclusion='+jf.conclusion);
  const logs = await get('/repos/'+REPO+'/actions/jobs/'+jf.id+'/logs');
  let text = typeof logs==='string' ? logs : JSON.stringify(logs).slice(0,200);
  console.log('LOGS_LEN='+text.length);
  const L = text.split(/\r?\n/);
  // find the tail and the error region
  console.log('--- LAST 40 ---');
  for(const l of L.slice(-40)){ if(l.trim()) console.log('L> '+l.slice(0,300)); }
  console.log('--- ERR grep ---');
  for(const l of L){ if(/error|Error|failed|Failed|Cannot find|TS\d+|Cannot resolve|Module not found/i.test(l)){ console.log('E> '+l.slice(0,300)); } }
})();
