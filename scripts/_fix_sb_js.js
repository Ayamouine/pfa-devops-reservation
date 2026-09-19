const fs = require('fs');
const p = 'C:/Users/info/Documents/pfa_complet/pfa_complet_final/frontend/src/components/Sidebar.js';
let s;
try { s = fs.readFileSync(p, 'utf8'); } catch (e) { console.log('ABS'); process.exit( rent); }
const L = s.split('\n');
const idx = 25; // ligne 26 (1-indexed)
let line = L[idx] || '';
const was = line;
line = line.replace(/(:\s*[\w,{}()\s]*)$|\s$/, function (m) { return m; });
if (!/\;$/.test(line.trimEnd())) {
  line = line.trimEnd() + ';';
}
L[idx] = line;
fs.writeFileSync(p, L.join('\n'), 'utf8');
console.log('OK idx25 before=' + was + ' after=' + L[idx]);
