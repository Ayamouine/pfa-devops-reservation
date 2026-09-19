const fs = require('fs');
const repo = 'C:/Users/info/Documents/pfa_complet/pfa_complet_final';
function file(p) {
  let s = '';
  try { s = fs.readFileSync(repo + '/' + p, 'utf8'); } catch (e) { console.log('ABS ' + p); return null; }
  return s;
}
const files = [
  'services/auth-service/src/main/java/com/example/authservice/service/OtpService.java',
  'frontend/src/components/Sidebar.js',
  'services/booking-service/src/main/java/com/example/bookingservice/service/BookingService.java'
];
for (const f of files) {
  const s = file(f);
  if (!s) continue;
  const L = s.split('\n');
  const o = (s.match(/{/g) || []).length, c = (s.match(/}/g) || []).length;
  console.log('==== ' + f.split('/').pop() + ' lignes=' + L.length + ' braces{' + o + '}=' + c + (o === c ? ' OK' : ' BAD'));
  const map = {
    'OtpService: purpose2?': /purpose2/.test(s),
    'Sidebar: 26:78 pseudo-marq': s.includes('profil('),
    'Booking: audite           ': /audite/i.test(s)
  };
  for (const k in map) console.log('   [' + (map[k] ? 'OK' : '  ') + '] ' + k);
  if (f.endsWith('OtpService.java')) {
    console.log('  -- lignes 33-37 (zone CI 35:31) --');
    for (let i = 32; i < Math.min(38, L.length); i++) console.log('   L' + (i + 1) + ': ' + (L[i] || '').slice(0, 90));
  }
  if (f.endsWith('Sidebar.js')) {
    console.log('  -- lignes 25-28 (zone CI 26:78) --');
    for (let i = 24; i < Math.min(29, L.length); i++) {
      const t = L[i] || '';
      console.log('   L' + (i + 1) + ' (' + t.length + '): ' + t.slice(0, 90));
    }
  }
}
