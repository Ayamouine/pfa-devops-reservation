const fs = require('fs');
const f = 'frontend/src/App.css';
let s = fs.readFileSync(f, 'utf8');
for (const [from, to] of GREEN_FLAT) {
  s = s.split(from).join(to);
}
fs.writeFileSync(f, s);
console.log('GREEN_FLAT_APPLIED');
const hex = s.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
const blues = hex.filter((h) => '32A3E6,32a3e6,2E86DE,2e86de,86C5E8,86c5e8,5CB0E0,5cb0e0,D8EDF8,d8edf8,F2FAFD,f2fafd,EAF6FB,eaf6fb,DFF1FA,dff1fa'.split(',').includes(h));
console.log('BLEUS_RESTANTS=' + blues.length);
blues.forEach((b) => console.log('  ' + b));
