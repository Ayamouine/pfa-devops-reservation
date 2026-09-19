const fs = require('fs');
const p = 'C:/Users/info/Documents/pfa_complet/pfa_complet_final/frontend/src/components/Sidebar.js';
let s;
try { s = fs.readFileSync(p, 'utf8'); } catch (e) { console.log('ABS'); process.exit(0); }
const L = s.split('\n');
if (!L.length) { console.log('EMPTY'); process.exit(0); }
const i = 25;
let a = L[i] || '';
let changed = false;
if (!a.trimEnd().endsWith(';')) {
  L[i] = a.replace(/\s*$/, '') + ';';
  changed = true;
}
fs.writeFileSync(p, L.join('\n'), 'utf8');
console.log('CHANGED=' + changed + ' L26_now_len=' + (L[i] || '').length + ' tail26=|' + (L[i] || '').slice(-14) + '|');
