const https = require('https');
function get(path, cb) {
  https.get('https://api.github.com' + path, {
    headers: { 'User-Agent': 'pfa-suivi', 'Accept': 'application/vnd.github+json' }
  }, function (r) {
    let d = '';
    r.on('data', function (c) { d += c; });
    r.on('end', function () {
      let j = null; try { j = JSON.parse(d); } catch (e) {}
      cb(j, r.statusCode);
    });
  }).on('error', function (e) { cb(null, 'NET' + e.code); });
}
function attendre() {
  get('/repos/Ayamouine/pfa-réservation-application/actions/runs?per_page=10', function (j, code) {
    if (!j) { console.log('ERR code=' + code); return; }
    let cible = null;
    for (const r of (j.workflow_runs || [])) {
      const m = r.head_sha.slice(0, 8) === '9d771d84' || r.head_sha.slice(0, 8) === '9d771d8';
      if (m) { cible = r; }
    }
    if (!cible) { console.log('CANDIDAT_ABS sha=9d771d84 — newest=' + (j.workflow_runs[0] || {}).head_sha); return; }
    console.log('RUN=' + cible.id + ' [' + cible.status + '/' + (cible.conclusion || '-') + '] sha=' + cible.head_sha.slice(0, 7));
    if (cible.status === 'completed') {
      console.log('VOTE_CI=' + (cible.conclusion === 'success' ? 'VERT_OK' : 'ROUGE'));
      return;
    }
    setTimeout(attendre, 30000);
  });
}
attendre();
