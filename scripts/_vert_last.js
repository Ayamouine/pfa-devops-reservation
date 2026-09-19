const https = require('https');
function get(path, cb) {
  https.get('https://api.github.com' + path, {
    headers: { 'User-Agent': 'pfa-probe-vert', 'Accept': 'application/vnd.github+json' }
  }, function (r) {
    let d = '';
    r.on('data', function (c) { d += c; });
    r.on('end', function () {
      try { cb(JSON.parse(d), null, r.statusCode); }
      catch (e) { cb(null, 'PARSE', r.statusCode); }
    });
  }).on('error', function (e) { cb(null, 'NET ' + e.code, 0); });
}
get('/repos/Ayamouine/pfa-devops-reservation/actions/runs?per_page=6', function (j, err, code) {
  if (err || !j) { console.log('ERR ' + err + ' code=' + code); return; }
  console.log('TOTAL=' + j.total_count);
  for (const r of (j.workflow_runs || [])) {
    const c = r.conclusion ? r.conclusion : '(en cours)';
    console.log('RUN ' + r.id + ' [' + r.status + '/' + c + '] sha=' + r.head_sha.slice(0, 12) + ' wf=' + r.name);
  }
});
