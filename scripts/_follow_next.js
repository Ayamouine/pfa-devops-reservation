const https = require('https');
const REPO = 'Ayamouine/pfa-devops-reservation';
const RUN = '35440112110';
const opt = { hostname: 'api.github.com', headers: { 'User-Agent': 'node', 'Accept': 'application/vnd.github+json' } };
function get(p){return new Promise((res,rej)=>{https.get({...opt,path:p},r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>{try{res(JSON.parse(d))}catch(e){rej(e)}})}).on('error',rej)})}
(async()=>{
  for(let i=0;i<30;i++){
    const r = await get('/repos/'+REPO+'/actions/runs/'+RUN);
    const s = r.status + (r.conclusion?('/'+r.conclusion):'');
    console.log('POLL '+i+' ['+s+'] sha='+r.head_sha);
    if(r.status==='completed'){
      const jobs = await get('/repos/'+REPO+'/actions/runs/'+RUN+'/jobs');
      for(const j of jobs.jobs||[]){ console.log('JOB '+j.name+' ['+j.status+'/'+j.conclusion+']') }
      return;
    }
    await new Promise(res=>setTimeout(res,15000));
  }
  console.log('TIMEOUT');
})();
