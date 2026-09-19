const fs = require('fs');
const repo = 'C:/Users/info/Documents/pfa_complet/pfa_complet_final';
function lignes(p) {
  let s = ''; try { s = fs.readFileSync(p, 'utf8'); } catch (e) { console.log('ABS ' + p.split('/').pop()); return null; }
  return s.split('\n');
}
console.log('===1) OtpService.java - recherche purpose2 ligne~35===');
let L = lignes(repo + '/services/auth-service/src/main/java/com/example/authservice/service/OtpService.java');
if (L) {
  for (let i = 31; i < Math.min(40, L.length); i++) {
    console.log(' OTS' + i + '|' + (L[i] || '').trim().slice(0, 100));
  }
  console.log(' containsPurpose2=' + (L.join('\n').includes('purpose2')));
}
console.log('===2) Sidebar.js - ligne 26 (col 78) ===');
L = lignes(repo + '/frontend/src/components/Sidebar.js');
if (L) {
  for (let i = 24; i < Math.min(29, L.length); i++) {
    console.log(' SB' + i + '|' + (L[i] || ''));
  }
  let braces = 0; for (const l of L) { for (const c of l) { if (c === '{') braces++; if (c === '}') braces--; } }
  console.log(' braces_solde=' + braces + ' lignes=' + L.length);
  const semi = (L.join('\n').match(/;/g) || []).length;
  console.log(' pointsVirgules=' + semi);
}
console.log('===3) BookingService intact disque (temo ojn===');
L = lignes(repo + '/services/booking-service/src/main/java/com/example/bookingservice/service/BookingService.java');
if (L) {
  let o = 0, c = 0; for (const l of L) { for (const ch of l) { if (ch === '{') o++; if (ch === '}') c++; } }
  console.log(' braces{' + o + '}=' + c + (o === c ? ' OK' : ' BAD') + ' lignes=' + L.length);
}
