const fs = require('fs');
const f = 'C:/Users/info/Documents/pfa_complet/pfa_complet_final/frontend/src/components/Sidebar.js';
let s;
try { s = fs.readFileSync(f, 'utf8'); } catch (e) { console.log('ABS'); process.exit(0); }
const L = s.split('\n');
console.log('TOTAL=' + L.length);
for (let i = 0; i < L.length; i++) {
  const t = L[i];
  if (i >= 23 && i <= 30) {
    console.log('L' + (i + 1) + ' len=' + t.length);
    const arr = [];
    for (let j = 0; j < t.length; j++) {
      const ch = t[j];
      arr.push(j + ':' + (ch === ' ' ? '·' : ch));
    }
    console.log('  ' + arr.join(' '));
  }
}
