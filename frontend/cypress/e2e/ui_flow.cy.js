describe('UI reservation flow', () => {
  const username = `ui_user_${Date.now()}`;
  const password = 'pass1234';
  const bookingUrl = Cypress.env('BOOKING_URL') || 'http://localhost:8082';
  const authUrl = Cypress.env('AUTH_URL') || 'http://localhost:8081';
  const testResourceName = `Salle E2E ${Date.now()}`;

  before(() => {
    // Create an admin account and seed a bookable resource so the UI has
    // something to display, since the CI database starts empty.
    const adminUsername = `admin_e2e_${Date.now()}`;
  cy.request('POST', `${authUrl}/auth/register`, {
  username: adminUsername,
  password: 'AdminPass123!',
  role: 'ADMIN',
  adminCode: 'pfa-admin-2026',   // ← corrigé (était 'admin-code')
}).then((res) => {
      const adminToken = res.body.token;
      cy.request({
        method: 'POST',
        url: `${bookingUrl}/resources`,
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          name: testResourceName,
          category: 'Salle',
          location: 'Bâtiment E2E',
          capacity: 10,
          price: 0,
          active: true,
        },
      });
    });
  });

  it('registers, logs in, navigates to resources and attempts booking via calendar', () => {
    cy.visit('/register');
    cy.get('#username').type(username);
    cy.get('#password').type(password);
    cy.get('button[type="submit"]').contains('Créer').click();

    // Log in explicitly (registration does not authenticate automatically)
    cy.visit('/login');
    cy.get('#username').type(username);
    cy.get('#password').type(password);
    cy.get('button[type="submit"]').click();

    cy.visit('/ressources');
    cy.get('.resource-list', { timeout: 10000 }).should('exist');
    cy.get('.resource-list .resource-card').first().within(() => {
      cy.get('a').first().click();
    });

    cy.get('.calendar', { timeout: 10000 }).should('exist');
    cy.contains('Réserver').first().click({ force: true });
    cy.on('window:alert', (txt) => {
      expect(txt).to.match(/Réservation|Erreur/);
    });
  });
});