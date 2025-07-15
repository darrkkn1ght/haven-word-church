/* global cy, Cypress */
/**
 * Complete User Journey E2E Test
 * 
 * This test covers the full user experience from:
 * - Homepage visit
 * - User registration
 * - Login
 * - Member dashboard usage
 * - Prayer requests
 * - Event RSVP
 * - Profile management
 * - Logout
 */

describe('Complete User Journey', () => {
  const testUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: `test-${Date.now()}@example.com`,
    password: 'SecurePass123!',
    phone: '+2348012345678',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    address: '123 Test Street, Lagos'
  };

  beforeEach(() => {
    // Visit homepage before each test
    cy.visit('/');
    cy.injectAxe(); // Inject accessibility testing
  });

  it('should complete full user registration and member journey', () => {
    // Step 1: Homepage Accessibility
    cy.checkA11y(null, {
      includedImpacts: ['critical', 'serious']
    });

    // Step 2: Navigate to registration
    cy.get('[data-testid="register-link"]').click();
    cy.url().should('include', '/register');

    // Step 3: Fill registration form
    cy.get('[data-testid="firstName-input"]').type(testUser.firstName);
    cy.get('[data-testid="lastName-input"]').type(testUser.lastName);
    cy.get('[data-testid="email-input"]').type(testUser.email);
    cy.get('[data-testid="password-input"]').type(testUser.password);
    cy.get('[data-testid="phone-input"]').type(testUser.phone);
    cy.get('[data-testid="dateOfBirth-input"]').type(testUser.dateOfBirth);
    cy.get('[data-testid="gender-select"]').select(testUser.gender);
    cy.get('[data-testid="address-input"]').type(testUser.address);

    // Check form accessibility
    cy.checkA11y('form', {
      includedImpacts: ['critical', 'serious']
    });

    // Step 4: Submit registration
    cy.get('[data-testid="register-button"]').click();

    // Step 5: Verify successful registration
    cy.url().should('include', '/member/dashboard');
    cy.get('[data-testid="welcome-message"]').should('contain', testUser.firstName);

    // Step 6: Check dashboard accessibility
    cy.checkA11y('[data-testid="member-dashboard"]', {
      includedImpacts: ['critical', 'serious']
    });

    // Step 7: Navigate to prayer requests
    cy.get('[data-testid="prayer-requests-link"]').click();
    cy.url().should('include', '/member/prayer-requests');

    // Step 8: Create a prayer request
    cy.get('[data-testid="new-prayer-button"]').click();
    cy.get('[data-testid="prayer-title-input"]').type('Test Prayer Request');
    cy.get('[data-testid="prayer-description-input"]').type('This is a test prayer request for E2E testing');
    cy.get('[data-testid="prayer-category-select"]').select('personal');
    cy.get('[data-testid="submit-prayer-button"]').click();

    // Step 9: Verify prayer request creation
    cy.get('[data-testid="prayer-request-list"]').should('contain', 'Test Prayer Request');

    // Step 10: Navigate to events
    cy.get('[data-testid="events-link"]').click();
    cy.url().should('include', '/events');

    // Step 11: RSVP for an event
    cy.get('[data-testid="event-card"]').first().within(() => {
      cy.get('[data-testid="rsvp-button"]').click();
    });

    // Step 12: Fill RSVP form
    cy.get('[data-testid="rsvp-form"]').within(() => {
      cy.get('[data-testid="attendance-select"]').select('yes');
      cy.get('[data-testid="guest-count-input"]').type('2');
      cy.get('[data-testid="comments-input"]').type('Looking forward to the event!');
      cy.get('[data-testid="submit-rsvp-button"]').click();
    });

    // Step 13: Verify RSVP submission
    cy.get('[data-testid="rsvp-success-message"]').should('be.visible');

    // Step 14: Navigate to profile
    cy.get('[data-testid="profile-link"]').click();
    cy.url().should('include', '/member/profile');

    // Step 15: Update profile
    cy.get('[data-testid="edit-profile-button"]').click();
    cy.get('[data-testid="phone-input"]').clear().type('+2348098765432');
    cy.get('[data-testid="address-input"]').clear().type('456 Updated Street, Lagos');
    cy.get('[data-testid="save-profile-button"]').click();

    // Step 16: Verify profile update
    cy.get('[data-testid="profile-update-success"]').should('be.visible');

    // Step 17: Navigate to attendance
    cy.get('[data-testid="attendance-link"]').click();
    cy.url().should('include', '/member/attendance');

    // Step 18: Check attendance page accessibility
    cy.checkA11y('[data-testid="attendance-page"]', {
      includedImpacts: ['critical', 'serious']
    });

    // Step 19: Logout
    cy.get('[data-testid="logout-button"]').click();
    cy.url().should('include', '/');

    // Step 20: Verify logout
    cy.get('[data-testid="login-link"]').should('be.visible');
    cy.get('[data-testid="member-dashboard-link"]').should('not.exist');
  });

  it('should handle login and member features', () => {
    // Step 1: Login with existing user
    cy.get('[data-testid="login-link"]').click();
    cy.get('[data-testid="email-input"]').type(testUser.email);
    cy.get('[data-testid="password-input"]').type(testUser.password);
    cy.get('[data-testid="login-button"]').click();

    // Step 2: Verify successful login
    cy.url().should('include', '/member/dashboard');

    // Step 3: Test dashboard features
    cy.get('[data-testid="quick-actions"]').within(() => {
      cy.get('[data-testid="prayer-request-quick"]').click();
    });

    // Step 4: Verify quick action navigation
    cy.url().should('include', '/member/prayer-requests');

    // Step 5: Test navigation menu
    cy.get('[data-testid="navigation-menu"]').within(() => {
      cy.get('[data-testid="sermons-link"]').click();
    });

    // Step 6: Verify sermons page
    cy.url().should('include', '/sermons');
    cy.get('[data-testid="sermons-list"]').should('be.visible');

    // Step 7: Test sermon playback
    cy.get('[data-testid="sermon-card"]').first().within(() => {
      cy.get('[data-testid="play-button"]').click();
    });

    // Step 8: Verify audio player
    cy.get('[data-testid="audio-player"]').should('be.visible');

    // Step 9: Test ministries page
    cy.get('[data-testid="ministries-link"]').click();
    cy.url().should('include', '/ministries');
    cy.get('[data-testid="ministries-list"]').should('be.visible');

    // Step 10: Test blog page
    cy.get('[data-testid="blog-link"]').click();
    cy.url().should('include', '/blog');
    cy.get('[data-testid="blog-list"]').should('be.visible');
  });

  it('should test responsive design and mobile experience', () => {
    // Test mobile viewport
    cy.viewport('iphone-x');
    cy.visit('/');

    // Check mobile navigation
    cy.get('[data-testid="mobile-menu-button"]').click();
    cy.get('[data-testid="mobile-navigation"]').should('be.visible');

    // Test mobile accessibility
    cy.checkA11y('[data-testid="mobile-navigation"]', {
      includedImpacts: ['critical', 'serious']
    });

    // Test tablet viewport
    cy.viewport('ipad-2');
    cy.reload();

    // Verify responsive layout
    cy.get('[data-testid="hero-section"]').should('be.visible');
    cy.get('[data-testid="service-schedule"]').should('be.visible');

    // Test desktop viewport
    cy.viewport(1280, 720);
    cy.reload();

    // Verify desktop layout
    cy.get('[data-testid="desktop-navigation"]').should('be.visible');
  });

  it('should test error handling and edge cases', () => {
    // Test 404 page
    cy.visit('/nonexistent-page');
    cy.get('[data-testid="404-page"]').should('be.visible');
    cy.get('[data-testid="home-link"]').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');

    // Test server error page
    cy.intercept('GET', '/api/events', { statusCode: 500 });
    cy.visit('/events');
    cy.get('[data-testid="error-message"]').should('be.visible');

    // Test network error handling
    cy.intercept('GET', '/api/sermons', { forceNetworkError: true });
    cy.visit('/sermons');
    cy.get('[data-testid="network-error"]').should('be.visible');

    // Test form validation
    cy.visit('/register');
    cy.get('[data-testid="register-button"]').click();
    cy.get('[data-testid="validation-error"]').should('be.visible');
  });

  it('should test performance and loading states', () => {
    // Test loading states
    cy.visit('/events');
    cy.get('[data-testid="loading-spinner"]').should('be.visible');
    cy.get('[data-testid="events-list"]').should('be.visible');

    // Test lazy loading
    cy.visit('/sermons');
    cy.scrollTo('bottom');
    cy.get('[data-testid="load-more-button"]').click();
    cy.get('[data-testid="sermon-card"]').should('have.length.greaterThan', 6);

    // Test image loading
    cy.get('[data-testid="sermon-image"]').should('be.visible');
    cy.get('[data-testid="sermon-image"]').should('have.attr', 'src');

    // Test performance metrics
    cy.window().then((win) => {
      cy.wrap(win.performance.timing.loadEventEnd - win.performance.timing.navigationStart)
        .should('be.lessThan', 3000); // Page should load in under 3 seconds
    });
  });

  it('should test accessibility compliance', () => {
    // Test keyboard navigation
    cy.visit('/');
    cy.get('body').tab();
    cy.focused().should('have.attr', 'tabindex');

    // Test screen reader compatibility
    cy.get('[data-testid="hero-section"]').should('have.attr', 'aria-label');

    // Test color contrast
    cy.checkA11y(null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    });

    // Test focus management
    cy.get('[data-testid="login-link"]').click();
    cy.focused().should('have.attr', 'data-testid', 'email-input');

    // Test ARIA labels
    cy.get('[data-testid="navigation-menu"]').should('have.attr', 'aria-label');
    cy.get('[data-testid="search-input"]').should('have.attr', 'aria-describedby');
  });
}); 