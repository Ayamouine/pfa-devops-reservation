const https = require('https');
const url = 'https://api.github.com/repos/pfa-devops/pfa-reservation/actions/runs?per_page=5';
const req = https.get(url, {
  headers: { 'User-Agent': 'pfa-probe', 'Accept': 'application/vnd.github+json' }
}, function (res) {
  let d = '';
  res.on('data', function (c) { d += c; });
  res.on('end', function () {
    try {
      const j = JSON.parse(d);
      if (!j.workflow_runs) { console.log('NO_RUNS_FIELD ' + d.slice(0, 140)); return; }
      console.log('TOTAL=' + j.total_count);
      for (const r of j.workflow_runs) {
        const concl = r.conclusion ? r.conclusion : '(en cours)';
        console.log('RUN ' + r.id + ' [' + r.status + '/' + concl + '] sha=' + r.head_sha.slice(0, 7) + ' wf=' + r.name);
      }
    } catch (e) {
      console.log('PARSE_ERR ' + d.slice(0, 140));
    }
  });
});
req.on('error', function (e) { console.log('NET_ERR ' + e.code); });
