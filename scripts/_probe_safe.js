const fs = require('fs');
const repo = 'C:/Users/info/Documents/pfa_complet/pfa_complet_final';
function lire(p) {
  let s = null;
  try { s = fs.readFileSync(repo + '/' + p, 'utf8'); } catch (e) { return null; }
  return s;
}
let s1 = lire('services/auth-service/src/main/java/com/example/authservice/service/OtpService.java');
if (!s1) { console.log('ABS OtpService.java'); return; }
console.log('OTP lignes=' + s1.split('\n').length);
const L1 = s1.split('\n');
for (let i = 32; i < Math.min(38, L1.length); i++) {
  const t = L1[i] || '';
  console.log('  L' + (i + 1) + ' len=' + t.length + ' |' + t);
}
let s2 = lire('frontend/src/components/Sidebar.js');
if (!s2) { console.log('ABS Sidebar.js'); return; }
console.log('SIDE lignes=' + s2.split('\n').length);
const L2 = s2.split('\n');
for (let i = 24; i < Math.min(28, L2.length); i++) {
  const t = L2[i] || '';
  console.log('  L' + (i + 1) + ' len=' + t.length + ' |' + t);
}
