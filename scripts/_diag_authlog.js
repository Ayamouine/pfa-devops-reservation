const https = require('https');
function get(path, cb) {
  https.get('https://api.github.com' + path, {
    headers: { 'User-Agent': 'pfa-diag', 'Accept': 'application/vnd.github+json' }
  }, function (res) {
    let d = '';
    res.on('data', function (c) { d += c; });
    res.on('end', function () {
      try { cb(JSON.parse(d), null, res.statusCode); }
      catch (e) { cb(null, 'PARSE', res.statusCode); }
    });
  }).on('error', function (e) { cb(null, 'NET ' + e.code, 0); });
}
const RUN = '35437164799';
get('/repos/Ayamouine/pfa-devops-reservation/actions/runs/' + RUN + '/jobs?per_page=30', function (j, err, code) {
  if (err || !j) { console.log('JOBS_ERR ' + err + ' code=' + code); return; }
  console.log('JOBS=' + (j.jobs || []).length);
  let target = null;
  for (const job of (j.jobs || [])) {
    console.log('JOB ' + job.id + ' [' + job.conclusion + '] ' + job.name);
    if (job.name && /auth/i.test(job.name) && job.conclusion === 'failure') target = job.id;
  }
  if (!target) { console.log('AUCUN_JOB_AUTH_FAIL'); return; }
  https.get('https://api.github.com/repos/Ayamouine/pfa-devops-reservation/actions/jobs/' + target + '/logs', {
    headers: { 'User-Agent': 'pfa-diag', 'Accept': 'application/vnd.github+json' }
  }, function (res) {
    let d = '';
    res.on('data', function (c) { d += c; });
    res.on('end', function () {
      const lines = d.split('\n');
      console.log('LOG_LIGNES=' + lines.length + ' statut=' + res.statusCode);
      const errLines = lines.map((l, i) => ({ i: i, l })).filter(function (o) {
        return /\[ERROR\]|ERROR|FAILURE|Exception|error:|Tests run|COMPILATION|Could not resolve|symbol/.test(o.l);
      });
      for (const o of errLines) console.log('ERR@' + o.i + ' ' + o.l.trim().slice(0, 190));
      console.log('ERR_TOTAL=' + errLines.length);
    });
  });
});
