const AUTH_URL = process.env.REACT_APP_AUTH_URL || 'http://localhost:8081';

const EMAIL_RE = /^[a-z]{2,}\.[a-z]{2,}\.[a-z]{2,}@uhp\.ac\.ma$/;

const DEMO_USERS = [
  {
    username: 'demo.etudiant',
    email: 'demo.etudiant.fst@uhp.ac.ma',
    password: 'Demo-2026!',
    role: 'ETUDIANT',
    registrationCode: null,
  },
  {
    username: 'demo.prof',
    email: 'demo.prof.fst@uhp.ac.ma',
    password: 'Demo-2026!',
    role: 'PROF',
    registrationCode: 'pfa-prof-2026',
  },
  {
    username: 'demo.cheffiliere',
    email: 'demo.cheffiliere.fst@uhp.ac.ma',
    password: 'Demo-2026!',
    role: 'CHEF_FILIERE',
    registrationCode: 'pfa-chef-2026',
  },
  {
    username: 'demo.doyen',
    email: 'demo.doyen.fst@uhp.ac.ma',
    password: 'Demo-2026!',
    role: 'DOYEN',
    registrationCode: 'pfa-doyen-2026',
  },
  {
    username: 'demo.club',
    email: 'demo.club.fst@uhp.ac.ma',
    password: 'Demo-2026!',
    role: 'CLUB',
    registrationCode: 'pfa-club-2026',
  },
  {
    username: 'demo.admin',
    email: 'demo.admin.fst@uhp.ac.ma',
    password: 'Demo-2026!',
    role: 'ADMIN',
    registrationCode: 'pfa-admin-2026',
  },
];

async function register(user) {
  const res = await fetch(`${AUTH_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  let data = null;
  try { data = await res.json(); } catch { /* ignore body */ }
  return { ok: res.ok, status: res.status, data };
}

async function main() {
  console.log(`[seedDemo] AUTH_URL=${AUTH_URL}`);
  let created = 0;
  let existing = 0;
  let failed = 0;
  for (const u of DEMO_USERS) {
    if (!EMAIL_RE.test(u.email)) {
      console.log(`[seedDemo] skip bad email :: ${u.email}`);
      failed += 1;
      continue;
    }
    const { ok, status, data } = await register(u).catch((e) => ({ ok: false, status: 0, data: { reason: String(e?.message || e).slice(0, 90) } }));
    if (ok) {
      created += 1;
      console.log(`[seedDemo] + created  ${String(u.role).padEnd(14)} ${u.username} (${u.email})`);
    } else if (status === 409 || /(already|existe|exists|taken|pris)/i.test(JSON.stringify(data || {}))) {
      existing += 1;
      console.log(`[seedDemo] = exists   ${String(u.role).padEnd(14)} ${u.username}`);
    } else {
      failed += 1;
      console.log(`[seedDemo] ! failed   ${String(u.role).padEnd(14)} ${u.username} :: ${status} ${JSON.stringify(data || {}).slice(0, 110)}`);
    }
  }
  console.log(`[seedDemo] RESULT created=${created} existing=${existing} failed=${failed}`);
  process.exitCode = failed > 0 ? 1 : 0;
}

main().catch((e) => {
  console.error(`[seedDemo] fatal :: ${String(e?.message || e).slice(0, 150)}`);
  process.exitCode = 1;
});
