const https = require('https');
const REPO = 'Ayamouine/pfa-devops-reservation';
const PATH = 'frontend/src/components/Sidebar.js';
const REF = 'main';
const opt = { hostname:'api.github.com', headers:{'User-Agent':'node','Accept':'application/vnd.github.raw+json'} };
https.get({...opt, path:'/repos/'+REPO+'/contents/'+PATH+'?ref='+REF}, r=>{
  let d=''; r.on('data',c=>d+=c); r.on('end',()=>{
    console.log('STATUS='+r.statusCode+' raw_len='+d.length);
    const L = d.split('\n');
    console.log('LIGNES='+L.length);
    const raw26 = L[25] || '';
    console.log('L26 len='+raw26.length+' endsSemi='+raw26.trimEnd().endsWith(';')+' tail=|'+raw26.slice(-16)+'|');
    const arr=[]; for(let j=0;j<raw26.length;j++){const ch=raw26[j];arr.push(j+(ch===' '?'\u00b7':ch));}
    console.log('CHARS: '+arr.join(' '));
    const raw27 = L[26] || '';
    console.log('L27 len='+raw27.length+' |'+raw27.slice(0,60)+'|');
  });
}).on('error',e=>{console.log('FETCH_ERR '+e.message);});
