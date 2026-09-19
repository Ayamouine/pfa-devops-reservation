const fs = require('fs');
const repo = 'C:/Users/info/Documents/pfa_complet/pfa_complet_final';
const files = [
  'services/auth-service/src/main/java/com/example/authservice/entity/OtpCode.java',
  'services/auth-service/src/main/java/com/example/authservice/model/OtpRequest.java',
  'services/auth-service/src/main/java/com/example/authservice/repository/OtpCodeRepository.java',
  'services/auth-service/src/main/java/com/example/authservice/service/OtpService.java'
];
for (const f of files) {
  const p = repo + '/' + f;
  let s;
  try { s = fs.readFileSync(p, 'utf8'); } catch (e) { console.log('ABS ' + f); continue; }
  const lignes = s.split('\n').length;
  const ob = (s.match(/{/g) || []).length;
  const cb = (s.match(/}/g) || []).length;
  const pkg = (s.match(/^package\s+([\w.]+);/m) || [])[1];
  console.log('==== ' + f.split('/').pop() + ' lignes=' + lignes + ' braces{' + ob + '}=' + cb
    + (ob === cb ? ' OK' : ' BAD') + ' pkg=' + pkg);
  const imports = [];
  for (const l of s.split('\n')) if (/^import /.test(l.trim())) imports.push(l.trim());
  console.log('  imports=' + imports.length);
  for (const i of imports) console.log('    ' + i);
  const dec = s.split('\n').filter(l => /^\s*(public|protected|public final|record)\b/.test(l))
    .map(l => l.trim()).slice(0, 25);
  console.log('  declarations:');
  for (const d of dec) console.log('    ' + d.replace(/\s+/g, ' '));
}
