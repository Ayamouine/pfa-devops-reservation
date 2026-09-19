const https = require('https');
function getJson(path, cb) {
  const req = https.get('https://api.github.com' + path, {
    headers: { 'User-Agent': 'pfa-ci-probe', 'Accept': 'application/vnd.github+json' }
  }, function (res) {
    let d = '';
    res.on('data', function (c) { d += c; });
    res.on('end', function () {
      let j = null;
      try { j = JSON.parse(d); } catch (e) { cb(null, 'PARSE ' + d.slice(0, 100)); return; }
      cb(j, null);
    });
  });
  req.on('error', function (e) { cb(null, 'NET ' + e.code); });
}
const path = '/repos/Ayamouine/pfa-devops-reservation/actions/runs?per_page=8';
getJson(path, function (j, err) {
  if (err || !j) { console.log('ERR ' + err); return; }
  console.log('TOTAL=' + j.total_count);
  for (const r of j.workflow_runs || []) {
    console.log('RUN ' + r.id + ' [' + r.status + '/' + (r.conclusion || '-') + '] wf="' + r.name
      + '" sha=' + r.head_sha.slice(0, 7) + ' dt=' + (r.created_at || '').slice(0, 16).replace('T', ' '));
  }
  console.log('---CIB bleue LATER---');
  const failed = (j.workflow_runs || []).filter(r => r.conclusion === 'failure');
  if (failed.length) {
    const last = failed[0];
    console.log('DERNIER_FAIL run=' + last.id + ' sha=' + last.head_sha.slice(0, 7));
  }
});
