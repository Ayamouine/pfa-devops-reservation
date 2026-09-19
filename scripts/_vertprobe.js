const https = require('https');
function get(p, cb) {
  https.get('https://api.github.com' + p, {
    headers: { 'User-Agent': 'pfa-vertprobe' }
  }, function (r) {
    let d = '';
    r.on('data', function (c) { d += c; });
    r.on('end', function () { cb(d, r.statusCode); });
  }).on('error', function (e) { cb('NET' + e.code, 0); });
}
get('/repos/Ayamouine/pfa-devops-reservation/actions/runs?per_page=15&status=success', function (d, code) {
  let j = null;
  try { j = JSON.parse(d); } catch (e) { console.log('PARSE code=' + code); return; }
  if (!j.workflow_runs) { console.log('AUCUN run success code=' + code); return; }
  console.log('SUCCESS_TOTAL=' + j.total_count);
  for (const r of (j.workflow_runs || [])) {
    console.log('VERT ' + r.id + ' sha=' + r.head_sha.slice(0, 7) + ' dt=' + (r.created_at || '').slice(0, 16).replace('T', ' '));
  }
});
