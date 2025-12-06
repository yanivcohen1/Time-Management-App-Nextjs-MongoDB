describe('Agile Tasks', () => {
  beforeEach(() => {
    // Seed the database
    cy.request('POST', '/api/auth/seed');
    cy.visit('/login');
  });

  it('should login and manage todos', () => {
    // Login
    cy.get('input[name="email"]').type('user@todo.dev');
    cy.get('input[name="password"]').type('ChangeMe123!');
    cy.get('button[type="submit"]').click();

    // Verify Dashboard
    cy.url().should('include', '/');
    cy.contains('Welcome, Demo User');

    // Create Todo
    cy.contains('Create').click();
    cy.get('input[name="title"]').type('New Cypress Todo');
    cy.get('textarea[name="description"]').type('Description for Cypress');
    cy.contains('button', 'Create').click();

    // Verify Todo Created
    cy.contains('New Cypress Todo').should('be.visible');

    // Edit Todo (Click on the edit button)
    cy.contains('New Cypress Todo').parent().find('button').click();
    
    // Verify Description in Modal
    cy.get('textarea[name="description"]').should('have.value', 'Description for Cypress');

    cy.get('input[name="title"]').clear().type('Updated Cypress Todo');
    cy.contains('button', 'Update').click();

    // Verify Update
    cy.contains('Updated Cypress Todo').should('be.visible');
  });
});
