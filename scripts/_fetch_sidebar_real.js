const https = require('https');
const get = (host, path) => new Promise((res, rej) => {
  https.get({ hostname: host, path, headers: { 'User-Agent': 'node' } }, r => {
    let d = ''; r.on('data', c => d += c); r.on('end', () => res({ code: r.statusCode, d }));
  }).on('error', rej);
});
(async () => {
  const head = await get('api.github.com', '/repos/Ayamouine/pfa-devops-reservation/git/ref/heads/main');
  const sha = head.d.object ? head.d.object.sha : (head.d && head.d.ref ? head.d.ref.split('/').pop() : 'ERR');
  console.log('HEAD_SHA=' + (typeof sha === 'string' ? sha.slice(0, 40) : JSON.stringify(head.d).slice(0, 200)));
  const raw = await get('raw.githubusercontent.com', '/Ayamouine/pfa-devops-reservation/' + sha + '/frontend/src/components/Sidebar.js');
  console.log('RAW_CODE=' + raw.code);
  if (raw.code === 200) {
    const L = raw.d.split('\n');
    console.log('LIGNES=' + L.length);
    const t = L[25] || '';
    console.log('L26 len=' + t.length + ' semi=' + t.trimEnd().endsWith(';') + ' |' + t);
    console.log('L27 ' + (L[26] || ''));
  }
})();
