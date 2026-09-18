describe('Workflow de validation 3 niveaux (Prof -> Chef -> Doyen)', () => {
  const authUrl = Cypress.env('AUTH_URL') || 'http://localhost:8081';
  const bookingUrl = Cypress.env('BOOKING_URL') || 'http://localhost:8082';
  const notifUrl = Cypress.env('NOTIFICATION_URL') || 'http://localhost:8083';

  const stamp = Date.now();
  const adminUsername = `wf_admin_${stamp}`;
  const resourceName = `Salle WF ${stamp}`;
  const adminPassword = 'Pass!2345';

  const day = (offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  };

  const login = (username, password) =>
    cy
      .request('POST', `${authUrl}/auth/login`, { username, password })
      .its('body.token');

  before(() => {
    // Une salle dédiée et un admin, car la base CI démarre vide (seeds fournis
    // par les DataLoader pour prof/chef/doyen).
    cy.request('POST', `${authUrl}/auth/register`, {
      username: adminUsername,
      email: `${adminUsername}@uhp.ac.ma`,
      password: adminPassword,
      role: 'ADMIN',
      adminCode: 'pfa-admin-2026',
    }).then((res) => {
      cy.request({
        method: 'POST',
        url: `${bookingUrl}/resources`,
        headers: { Authorization: `Bearer ${res.body.token}` },
        body: {
          name: resourceName,
          category: 'Salle',
          location: 'Bâtiment WF',
          capacity: 30,
          price: 50,
          active: true,
        },
      });
    });
  });

  it('le prof cree, le chef valide, le doyen cachette et le paiement est declenche', () => {
    let profToken;
    let bookingId;

    // 1. Le professeur (seed) crée une demande dans sa filière.
    login('prof', 'prof123').then((token) => {
      profToken = token;
      cy.request({
        method: 'POST',
        url: `${bookingUrl}/bookings`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          resource: resourceName,
          date: day(30),
          creneau: '08:30-10:30',
          username: 'prof',
          filiere: 'GI',
          motif: 'Cours E2E',
        },
      }).then((res) => {
        expect([200, 201]).to.include(res.status);
        expect(res.body.status).to.eq('PENDING');
        bookingId = res.body.id;
      });
    });

    // 2. Un PROF n'a pas le droit de valider (contrôle de rôle backend).
    cy.then(() => {
      cy.request({
        method: 'POST',
        url: `${bookingUrl}/bookings/${bookingId}/approve`,
        headers: { Authorization: `Bearer ${profToken}` },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(403);
      });
    });

    // 3. Le chef de filière voit la demande et la valide.
    login('chef', 'chef123').then((chefToken) => {
      cy.request({
        method: 'GET',
        url: `${bookingUrl}/bookings/approvals`,
        headers: { Authorization: `Bearer ${chefToken}` },
      }).then((res) => {
        expect(res.status).to.eq(200);
        const mine = (res.body || []).find((b) => String(b.id) === String(bookingId));
        expect(mine, 'la demande doit apparaitre chez le chef de filiere').to.exist;

        cy.request({
          method: 'POST',
          url: `${bookingUrl}/bookings/${bookingId}/approve?comment=Valide%20E2E`,
          headers: { Authorization: `Bearer ${chefToken}` },
        }).then((approved) => {
          expect(approved.status).to.eq(200);
          expect(approved.body.status).to.eq('APPROVED');
        });
      });
    });

    // 4. Le doyen appose le cachet final (déclenche le paiement simulé).
    login('doyen', 'doyen123').then((doyenToken) => {
      cy.request({
        method: 'GET',
        url: `${bookingUrl}/bookings/approvals`,
        headers: { Authorization: `Bearer ${doyenToken}` },
      }).then((res) => {
        const mine = (res.body || []).find((b) => String(b.id) === String(bookingId));
        expect(mine, 'la demande approuvee doit apparaitre chez le doyen').to.exist;

        cy.request({
          method: 'POST',
          url: `${bookingUrl}/bookings/${bookingId}/confirm?comment=Cachet%20E2E`,
          headers: { Authorization: `Bearer ${doyenToken}` },
        }).then((confirmed) => {
          expect(confirmed.status).to.eq(200);
          expect(confirmed.body.status).to.eq('CONFIRMED');
        });
      });
    });

    // 5. Le demandeur a bien reçu la notification de confirmation.
    cy.then(() => {
      cy.request({
        method: 'GET',
        url: `${notifUrl}/notifications/my`,
        headers: { Authorization: `Bearer ${profToken}` },
      }).then((res) => {
        expect(res.status).to.eq(200);
        const types = (res.body || []).map((n) => String(n.type || '').toUpperCase());
        expect(types).to.include('BOOKING_CONFIRMED');
      });
    });
  });

  it('le chef de filiere peut refuser une demande', () => {
    let bookingId;

    login('prof', 'prof123').then((profToken) => {
      cy.request({
        method: 'POST',
        url: `${bookingUrl}/bookings`,
        headers: { Authorization: `Bearer ${profToken}` },
        body: {
          resource: resourceName,
          date: day(45),
          creneau: '10:30-12:30',
          username: 'prof',
          filiere: 'GI',
          motif: 'Cours refusé E2E',
        },
      }).then((res) => {
        expect([200, 201]).to.include(res.status);
        bookingId = res.body.id;
      });
    });

    login('chef', 'chef123').then((chefToken) => {
      cy.then(() => {
        cy.request({
          method: 'POST',
          url: `${bookingUrl}/bookings/${bookingId}/reject?comment=Indisponible%20E2E`,
          headers: { Authorization: `Bearer ${chefToken}` },
        }).then((rejected) => {
          expect(rejected.status).to.eq(200);
          expect(rejected.body.status).to.eq('REJECTED');
        });
      });
    });
  });
});
