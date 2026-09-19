const https = require('https');
function get(path, cb) {
  https.get('https://api.github.com' + path, {
    headers: { 'User-Agent': 'pfa-vert-follow', 'Accept': 'application/vnd.github+json' }
  }, function (res) {
    let d = '';
    res.on('data', function (c) { d += c; });
    res.on('end', function () {
      let j = null; try { j = JSON.parse(d); } catch (e) {}
      cb(j, res.statusCode);
    });
  }).on('error', function (e) { cb(null, 0); });
}
const RUN = process.argv[2] || '35438856307';
const T0 = Date.now();
function poll() {
  get('/repos/Ayamouine/pfa-devops-reservation/actions/runs/' + RUN, function (r, code) {
    if (!r) { console.log('POLL_ERR code=' + code); return; }
    const ago = Math.round((Date.now() - T0) / 1000);
    let line = 'SEC=' + ago + ' status=' + r.status + ' conclusion=' + (r.conclusion || '?');
    if (r.jobs && r.jobs.length) {
      const a = r.jobs.filter(function (j) { return /auth/.test(j.name); })[0];
      if (a) line += ' auth=' + a.conclusion;
      const f = r.jobs.filter(function (j) { return /frontend|booking/.test(j.name); })[0];
      if (f) line += ' ' + f.name.split(/[/&]/)[0].trim() + '=' + f.conclusion;
    }
    console.log(line);
    if (r.status === 'completed') {
      console.log('VERT_FINAL=' + (r.conclusion === 'success' ? 'OUI : CI VERTE' : 'NON : ' + r.conclusion));
      return;
    }
    setTimeout(poll, 45000);
  });
}
poll();
