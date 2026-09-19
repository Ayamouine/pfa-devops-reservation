const fs = require('fs');
const f = 'C:/Users/info/Documents/pfa_complet/pfa_complet_final/frontend/src/components/Sidebar.js';
let s;
try { s = fs.readFileSync(f, 'utf8'); } catch (e) { console.log('ABS'); process.exit(0); }
const L = s.split('\n');
console.log('TOTAL=' + L.length);
L.forEach((l, i) => {
  console.log(String(i + 1).padStart(3) + '|' + l);
});
