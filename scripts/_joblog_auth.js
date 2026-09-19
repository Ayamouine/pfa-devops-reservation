const https = require('https');
const fs = require('fs');
function get(path, cb) {
  https.get('https://api.github.com' + path, {
    headers: { 'User-Agent': 'pfa-logprobe' }
  }, function (res) {
    let d = '';
    res.on('data', function (c) { d += c; });
    res.on('end', function () { cb(d, res.statusCode); });
  }).on('error', function (e) { cb(null, 'NET' + e.code, 0); });
}
const run = process.argv[2] || '35437164799';
get('/repos/Ayamouine/pfa-devops-reservation/actions/runs/' + run + '/jobs?per_page=30', function (d, code) {
  let j;
  try { j = JSON.parse(d); } catch (e) { console.log('JOBS_PARSE code=' + code + ' ' + d.slice(0, 80)); return; }
  const fail = {};
  for (const job of j.jobs || []) {
    console.log('JOB ' + job.id + ' [' + job.conclusion + '] ' + job.name);
    if (job.conclusion === 'failure' && /auth|Build and run tests/.test(job.name)) fail[job.id] = job.name;
  }
  const ids = Object.keys(fail);
  if (!ids.length) { console.log('AUCUN_JOB_AUTH_EN_ECHEC — vérifier booking/frontend'); return; }
  const id = ids[0];
  get('/repos/Ayamouine/pfa-devops-reservation/actions/jobs/' + id + '/logs', function (log, code2) {
    console.log('==LOGS auth (taille=' + (log ? log.length : 0) + ' code=' + code2 + ') étapes erreur==');
    const lignes = log.split('\n');
    let n = 0;
    for (let i = 0; i < lignes.length && n < 30; i++) {
      const l = lignes[i];
      if (/\[ERROR\]|ERROR|Exception|Tests run:|FAILURE|could not|Cannot resolve|package .* does not exist|symbol:|UnknownOtp|OtpService|\.java:\d+/.test(l)) {
        n++;
        console.log('  L' + i + ' ' + l.replace(/\u001b\[[0-9;]*m/g, '').slice(0, 180));
      }
    }
    console.log('ERR_BLOCKS=' + n);
  });
});
