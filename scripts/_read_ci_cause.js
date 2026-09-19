const fs = require('fs');
const repo = 'C:/Users/info/Documents/pfa_complet/pfa_complet_final';
const probes = [
  'services/auth-service/src/main/java/com/example/authservice/service/OtpService.java',
  'frontend/src/components/Sidebar.js'
];
for (const p of probes) {
  const f = repo + '/' + p;
  let s = '';
  try { s = fs.readFileSync(f, 'utf8'); } catch (e) { console.log('ABS ' + p.split('/').pop()); continue; }
  const L = s.split('\n');
  console.log('==== ' + p.split('/').pop() + ' lignes=' + L.length + ' ====');
  if (/OtpService/.test(p)) {
    for (let i = 29; i < Math.min(41, L.length); i++) {
      const t = L[i] || '';
      console.log('  L' + (i + 1) + ' (' + t.length + ') ' + t);
    }
    console.log('  -- recherche purp --');
    for (let i = 0; i < L.length; i++) {
      const t = L[i] || '';
      if (/purp|requestOtp|verifyOtp|request\(/.test(t)) console.log('  *L' + (i + 1) + ': ' + t.trim().slice(0, 95));
    }
  } else {
    for (let i = 24; i < Math.min(29, L.length); i++) {
      const t = L[i] || '';
      console.log('  L' + (i + 1) + ' (' + t.length + ') ' + t);
    }
    const semis = (s.split(';')).length - 1;
    console.log('  semicolons=' + semis);
    const o = (s.match(/{/g) || []).length, c = (s.match(/}/g) || []).length;
    console.log('  braces{' + o + '}=' + c + (o === c ? ' OK' : ' BAD'));
  }
}
