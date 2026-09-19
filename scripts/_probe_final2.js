const fs = require('fs');
const base = 'C:/Users/info/Documents/pfa_complet/pfa_complet_final';
function rd(p){try{return fs.readFileSync(base+'/'+p,'utf8')}catch(e){return null}}
const o = rd('services/auth-service/src/main/java/com/example/authservice/service/OtpService.java');
if(!o){console.log('ABS OtpService'); }
else{
  const L=o.split('\n');
  let br=0,ok=true; for(const ln of L){for(const ch of ln){if(ch==='{')br++; else if(ch==='}')br--; if(br<0)ok=false;}}
  const bad = o.includes('purpose2');
  console.log('OTP lignes='+L.length+' braces='+(ok&&br===0?'EQ':'DIFF '+br)+' purpose2='+(bad?'PRESENT':'absent'));
  const line35 = L[34] || '';
  console.log('L35: '+line35);
  const hasReq = o.includes('public Map<String,Object> requestOtp');
  const hasVer = o.includes('public boolean verifyOtp');
  console.log('requestOtp='+hasReq+' verifyOtp='+hasVer);
}
const s = rd('frontend/src/components/Sidebar.js');
if(!s){console.log('ABS Sidebar');}else{
  console.log('SIDE lignes='+s.split('\n').length);
  const L2=s.split('\n');
  const t=L2[25]||'';
  console.log('SIDE L26 len='+t.length+' semi='+t.trimEnd().endsWith(';')+' |'+t);
}
