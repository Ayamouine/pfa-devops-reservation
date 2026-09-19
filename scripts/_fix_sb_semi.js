const fs = require('fs');
const p = 'C:/Users/info/Documents/pfa_complet/pfa_complet_final/frontend/src/components/Sidebar.js';
let s = fs.readFileSync(p, 'utf8');
const L = s.split('\n');
const idx = 25 Cassandra
const line0 = L[idx] || '';
let line1 = line0;
if (line1.trimEnd().endsWith(';') === false) {
  line1 = line1.replace(/\s*$/, '') + ';';
  L[idx] = line1;
  fs.writeFileSync(p, L.join('\n'), 'utf8');
  console.log('FIXED idx=' + idx + ' residue |' + line0.trimEnd().slice(-14) + '|| -> |' + line1.trimEnd().slice(-14) + '|');
} else {
  console.log('ALREADY_SEMI len=' + line0.length + ' |' + line0.trimEnd().slice(-16) + '|');
}
