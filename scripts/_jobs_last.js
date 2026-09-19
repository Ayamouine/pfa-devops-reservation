const https = require('https');
function get(path, cb) {
  https.get('https://api.github.com' + path, {
    headers: { 'User-Agent': 'pfa-probe2', 'Accept': 'application/vnd.github+json' }
  }, function (res) {
    let d = '';
    res.on('data', function (c) { d += c; });
    res.on('end', function () {
      try { cb(JSON.parse(d), null, res.statusCode); }
      catch (e) { cb(null, 'PARSE', res.statusCode); }
    });
  }).on('error', function (e) { cb(null, 'NET ' + e.code, 0); });
}
const RUN = process.argv[2] || '35437164799';
get('/repos/Ayamouine/pfa-devops-reservation/actions/runs/' + RUN + '/jobs?per_page=30', function (j, err, code) {
  if (err) { console.log('JOBS_ERR ' + err + ' code=' + code); return; }
  console.log('JOBS_TOTAL=' + j.total_count + ' code=' + code);
  for (const job of (j.jobs || [])) {
    console.log('JOB ' + job.id + ' [' + job.conclusion + '] ' + job.name + ' steps=' + (job.steps || []).length);
    for (const st of (job.steps || [])) {
      console.log('   @' + st.number + ' [' + st.conclusion + '] ' + st.name);
    }
  }
});
