const fs = require('fs');
const path = require('path');
const out = [];
function walk(dir) {
  let ent;
  try { ent = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
  for (const e of ent) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '.git'].includes(e.name)) continue;
      walk(p);
    } else if (e.name === 'Sidebar.js') {
      out.push(p);
    }
  }
}
['C:/Users/info/Documents/pfa_complet', 'C:/Users/info/Documents/pfa_complet_final'].forEach(walk);
console.log('SIDEBAR_FILES=' + out.length);
for (const p of out) {
  let s = null;
  try { s = fs.readFileSync(p, 'utf8'); } catch (e) { console.log('ABS ' + p); continue; }
  const L = s.split('\n');
  const l26 = L[25] || '';
  let semi = l26.trimEnd().endsWith(';');
  let consted = l26.includes(']'); // has as const
  console.log('  ' + p);
  console.log('    lignes=' + L.length + ' L26len=' + l26.length + ' semi=' + semi + ' tail=|' + l26.slice(-18) + '|');
}
