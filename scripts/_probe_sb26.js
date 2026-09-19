const fs = require('fs');
const repo = 'C:/Users/info/Documents/pfa_complet/pfa_complet_final';
function lit(p) {
  const f = repo + '/' + p;
  let s = '';
  try { s = fs.readFileSync(f, 'utf8'); } catch (e) { console.log('ABS ' + p); return null; }
  return s.split('\n');
}
console.log('===1) Sidebar.js ligne 24-30 (autour de 26:78) DISQUE===');
let S = lit('frontend/src/components/Sidebar.js');
if (S) {
  for (let i = 23; i < Math.min(31, S.length); i++) {
    const t = S[i] || '';
    const arr = t.length;
    console.log(' L' + (i + 1) + ' len=' + arr + ' |' + t);
  }
}
console.log('===2) OtpService.java ligne 32-38 DISQUE===');
let O = lit('services/auth-service/src/main/java/com/example/authservice/service/OtpService.java');
if (O) {
  for (let i = 31; i < Math.min(39, O.length); i++) {
    console.log(' L' + (i + 1) + ' |' + (O[i] || ''));
  }
}
console.log('===BRACES===');
function bra(p, s) {
  const o = (s.match(/{/g) || []).length, c = (s.match(/}/g) || []).length;
  console.log((p.split('/').pop()) + ' {' + o + '}=' + c + (o === c ? ' OK' : ' BAD'));
}
if (S) bra('Sidebar.js', S.join('\n'));
if (O) bra('OtpService.java', O.join('\n'));
