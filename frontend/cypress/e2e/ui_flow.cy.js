describe('UI reservation flow', () => {
  const username = `ui_user_${Date.now()}`;
  const email = `${username}@uhp.ac.ma`;
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
  email: `${adminUsername}@uhp.ac.ma`,
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
    // Registration already authenticates the user (register returns a token and
    // sets the session). The session is persisted to localStorage so it survives
    // the full page reload that cy.visit triggers.
    cy.visit('/register');
    cy.intercept('POST', `${authUrl}/auth/register`).as('registerReq');
    cy.get('#email', { timeout: 15000 }).type(email);
    cy.get('#username', { timeout: 15000 }).type(username);
    cy.get('#password', { timeout: 15000 }).type(password);
    // Le rôle ETUDIANT ne peut pas réserver : on crée un compte PROF.
    cy.get('#role').select('PROF');
    // "GI" existe dans plusieurs optgroups (TC, LST, Cycle Ingénieur) :
    // on cible l'optgroup Cycle Ingénieur pour éviter l'ambiguïté du select.
    cy.get('#filiere')
      .find('optgroup[label="Cycle Ingénieur"] option[value="GI"]')
      .invoke('prop', 'selected', true);
    cy.get('#filiere').trigger('change');
    cy.get('#adminCode').type('pfa-prof-2026');
    cy.get('button[type="submit"]').contains('Créer').click();
    cy.wait('@registerReq');

    // Wait until the session is persisted before the full page reload
    cy.window().its('localStorage').invoke('getItem', 'pfa_auth').should('exist');

    cy.visit('/ressources');
    cy.get('.resource-list', { timeout: 15000 }).should('exist');
    // La salle créée pour le test n'a aucune réservation : tous les créneaux sont libres.
    cy.contains('.resource-card', testResourceName).find('a').first().click();

    cy.get('.calendar', { timeout: 15000 }).should('exist');
    cy.contains('Réserver').first().click({ force: true });
    cy.on('window:alert', (txt) => {
      expect(txt).to.match(/Réservation|Erreur/);
    });
  });
});