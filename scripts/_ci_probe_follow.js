const https = require('https');
const REPO = 'Ayamouine/pfa-devops-reservation';
const TARGET = '51414596';
const opts = {
  hostname: 'api.github.com',
  path: '/repos/' + REPO + '/actions/runs?per_page=10',
  headers: { 'User-Agent': 'node', 'Accept': 'application/vnd.github+json' }
};
function get(p) {
  return new Promise((res, rej) => {
    https.get({ ...opts, path: p }, (r) => {
      let d = '';
      r.on('data', (c) => d += c);
      r.on('end', () => res(JSON.parse(d)));
    }).on('error', rej);
  });
}
(async () => {
  const j = await get('/repos/' + REPO + '/actions/runs?per_page=10');
  const runs = (j.workflow_runs || []).filter(r => (r.head_sha || '').startsWith(TARGET));
  console.log('TARGET=' + TARGET);
  if (!runs.length) { console.log('AUCUN_RUN_RE#ATTENTE'); return; }
  for (const r of runs) {
    console.log('RUN ' + r.id + ' [' + r.status + '/' + (r.conclusion || '') + '] sha=' + r.head_sha.slice(0, 7));
  }
})();
