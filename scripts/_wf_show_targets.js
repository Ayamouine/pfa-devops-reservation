const fs = require('fs');
const base = fs.readFileSync('C:/Users/info/Documents/pfa_complet/pfa_complet_final/.github/workflows/ci-cd.yml', 'utf8');
function show(name, s) {
  const L = s.split('\n');
  console.log('### ' + name + ' lignes=' + L.length);
  for (let i = 0; i < L.length; i++) {
    if (/rollout|prometheus|grafana|notification-service|420s|kind_diag|curl -sf/.test(L[i])) {
      console.log('  ' + (i + 1) + ': ' + L[i]);
    }
  }
}
show('BASE', baseorm);
