const https = require('https');
function get(url, cb) {
  https.get('https://api.github.com' + url, {
    headers: { 'User-Agent': 'pfa-ci-follow', 'Accept': 'application/vnd.github+json' }
  }, function (r) {
    let d = '';
    r.on('data', function (c) { d += c; });
    r.on('end', function () {
      let j = null; try { j = JSON.parse(d); } catch (e) {}
      cb(j, r.statusCode);
    });
  }).on('error', function (e) { cb(null, 'NET'); });
}
const RUN = process.argv[2] || '35437164799';
function poll() {
  get('/repos/Ayamouine/pfa-devops-reservation/actions/runs/' + RUN, function (j, code) {
    if (!j) { console.log('POLL_ERR code=' + code); return; }
    console.log('ETAT ' + new Date().toISOString().slice(11, 19) + ' : ' + j.status + '/' + (j.conclusion || '?'));
    if (j.status === 'completed') {
      console.log('FINAL=' + j.conclusion.toUpperCase());
      if (j.conclusion === 'success') {
        console.log('===== CI VERTE CONFIRMEE =====');
      } else {
        console.log('===== CI ROUGE SUR SHA=' + j.head_sha + ' =====');
      }
      return;
    }
    setTimeout(poll, 30000);
  });
}
console.log('SUIVI_RUN=' + RUN + ' sha_attendu=' + '9d771d84');
poll();
