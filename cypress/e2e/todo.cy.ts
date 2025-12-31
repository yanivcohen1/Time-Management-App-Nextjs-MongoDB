describe('Agile Tasks', () => {
  beforeEach(() => {
    // Seed the database
    // cy.request('POST', '/api/auth/seed');
    cy.visit('/login');
  });

  it('should login and manage todos', () => {
    // Login
    cy.get('input[name="email"]').type('user@todo.dev');
    cy.get('input[name="password"]').type('ChangeMe123!');
    cy.get('button[type="submit"]').click();

    // Verify Dashboard
    cy.url().should('include', '/');

    cy.visit('/todos');
    cy.reload(); // Ensure fresh state
    cy.get('body').type('{esc}'); // Close any open modals

    // Create Todo
    cy.get('[data-testid="sidebar-create"]').click();
    cy.get('input[name="title"]').type('New Cypress Todo');
    cy.get('textarea[name="description"]').type('Description for Cypress');
    cy.contains('button', 'Create').click();
    cy.reload(); // Reload to get fresh data

    // Sort by newest first
    cy.contains('Created At').click();

    // Verify Todo Created
    cy.contains('New Cypress Todo').scrollIntoView().should('be.visible');

    // Edit Todo (Click on the edit button)
    cy.contains('New Cypress Todo').parent().next().find('button').first().click();
    
    // Verify Description in Modal
    cy.get('textarea[name="description"]').should('have.value', 'Description for Cypress');

    cy.get('input[name="title"]').clear().type('Updated Cypress Todo');
    cy.contains('button', 'Update').click();

    // Verify Update
    cy.contains('Updated Cypress Todo').scrollIntoView().should('be.visible');
  });

  it('should handle GET /api/todos?limit=1000 without error', () => {
    // Login first to get authenticated
    cy.get('input[name="email"]').type('user@todo.dev');
    cy.get('input[name="password"]').type('ChangeMe123!');
    cy.get('button[type="submit"]').click();

    // Test the API endpoint
    cy.request('GET', '/api/todos?limit=1000').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('items');
      expect(response.body).to.have.property('total');
      expect(response.body.items).to.be.an('array');
    });
  });
});
