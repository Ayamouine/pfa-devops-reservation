const https = require('https');
const REPO = 'Ayamouine/pfa-devops-reservation';
const RUN = '35440112110';
const opt = { hostname:'api.github.com', headers:{'User-Agent':'node','Accept':'application/vnd.github+json'} };
function raw(p){return new Promise((res,rej)=>{https.get({...opt,path:p},r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>res({code:r.statusCode,d}))}).on('error',rej)})}
function json(p){return raw(p).then(x=>{try{return JSON.parse(x.d)}catch(e){return {ERR:x.code,head:x.d.slice(0,120)}}})}
(async()=>{
  const runs = await json('/repos/'+REPO+'/actions/runs?per_page=10&event=push');
  const r = (runs.workflow_runs||[]).find(x=>x.head_sha.startsWith('51414596')) || (runs.workflow_runs||[])[0];
  console.log('RUN='+(r&&r.id)+' sha='+(r&&r.head_sha&&r.head_sha.slice(0,8)));
  const jobs = await json('/repos/'+REPO+'/actions/runs/'+(r&&r.id)+'/jobs');
  for(const j of (jobs.jobs||[])){
    console.log('J '+(j.name||'')+' ['+(j.conclusion||'')+'] id='+j.id);
  }
  const jf = (jobs.jobs||[]).find(j=>/front|Front/.test(j.name||''));
  if(jf){
    const lg = await raw('/repos/'+REPO+'/actions/jobs/'+jf.id+'/logs');
    const lines = lg.d.split(/\r?\n/);
    console.log('JOB_FRONT_LOG code='+lg.code+' lignes='+lines.length);
    for(const l of lines.slice(-90)){ if(l.trim()){ console.log('L> '+l.slice(0,260)); } }
  } else { console.log('JOB_FRONT_NON_TROUVE'); }
})();
