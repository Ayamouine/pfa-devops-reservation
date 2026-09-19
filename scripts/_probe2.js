const fs = require('fs');
const base = 'C:/Users/info/Documents/pfa_complet/pfa_complet_final';
const f1 = base + '/services/auth-service/src/main/java/com/example/authservice/service/OtpService.java';
const f2 = base + '/frontend/src/components/Sidebar.js';
function lire(p) {
  let s = null;
  try { s = fs.readFileSync(p, 'utf8'); } catch (e) { return null; }
  return s;
}
let s1 = lire(f1);
if (!s1) { console.log('ABS OtpService'); } else {
  const L = s1.split('\n');
  console.log('OTP lignes=' + L.length + ' purpose2=' + (s1.indexOf('purpose2') >= 0));
  const idx = s1.indexOf('purpose2');
  if (idx >= 0) {
    const at = s1.slice(0, idx).split('\n').length;
    console.log(' purpose2_@ligne=' + at);
    for (let i = Math.max(0, at - 3); i < Math.min(L.length, at + 2); i++) {
      console.log('   L' + (i + 1) + ' |' + L[i]);
    }
  }
}
let s2 = lire(f2);
if (!s2) { console.log('ABS Sidebar'); } else {
  const L = s2.split('\n');
  console.log('SIDE lignes=' + L.length);
  for (let i = 23; i < Math.min(28, L.length); i++) {
    console.log('   L' + (i + 1) + ' len=' + L[i].length + ' |' + L[i]);
  }
}
