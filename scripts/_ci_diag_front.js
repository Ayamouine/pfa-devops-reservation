const https = require('https');
const REPO = 'Ayamouine/pfa-devops-reservation';
const SHA = '51414596';
const opt = { hostname:'api.github.com', headers:{'User-Agent':'node','Accept':'application/vnd.github+json'} };
function get(p){return new Promise((res,rej)=>{https.get({...opt,path:p},r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>{try{res(JSON.parse(d))}catch(e){rej({p,err:e,raw:d.slice(0,300)})}})}).on('error',rej)})}
(async()=>{
  const j = await get('/repos/'+REPO+'/actions/runs?per_page=15');
  const runs = (j.workflow_runs||[]).filter(r=>r.head_sha.startsWith(SHA));
  if(!runs.length){ console.log('AUCUN_RUN_SHA '+SHA); console.log(JSON.stringify(j.workflow_runs&&j.workflow_runs.map(r=>r.head_sha.slice(0,7)+' '+r.status+'/'+(r.conclusion||'')),null,0)); return; }
  const run = runs[0];
  console.log('RUN='+run.id+' sha='+run.head_sha+' name='+run.name+' status='+run.status+'/'+run.conclusion);
  const jobs = await get('/repos/'+REPO+'/actions/runs/'+run.id+'/jobs');
  for(const jb of jobs.jobs||[]){
    console.log('JOB ['+jb.conclusion+'] '+jb.name);
    if(jb.conclusion==='failure'){
      for(const st of jb.steps||[]){
        if(st.conclusion==='failure'){
          console.log('  STEP_FAIL: '+st.name);
          try{
            const lg = await get('/repos/'+REPO+'/actions/jobs/'+jb.id+'/logs');
            const lines = (typeof lg==='string')?lg.split('\n'):[];
            console.log('  LOG_LIGNES='+lines.length);
            const tail = lines.slice(-60);
            for(const l of tail){ console.log('    L> '+l); }
          }catch(e){ console.log('  LOG_ERR '+JSON.stringify(e)); }
        }
      }
    }
  }
})();
