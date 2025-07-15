/**
 * Cypress Configuration for Haven Word Church E2E Tests
 * 
 * This file configures Cypress for end-to-end testing of the application
 * including accessibility testing, visual regression testing, and performance monitoring.
 */

const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    
    // Environment variables
    env: {
      apiUrl: 'http://localhost:5000/api',
      testUser: {
        email: 'test@havenword.com',
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'User'
      },
      adminUser: {
        email: 'admin@havenword.com',
        password: 'AdminPass123!',
        firstName: 'Admin',
        lastName: 'User'
      }
    },

    // Setup and teardown
    setupNodeEvents(on, config) {
      // Implement node event listeners here
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        table(message) {
          console.table(message);
          return null;
        }
      });

      // Handle file downloads
      on('task', {
        downloadFile(filename) {
          // Handle file download verification
          return null;
        }
      });

      // Custom commands for accessibility testing
      on('task', {
        logA11yViolations(violations) {
          if (violations.length > 0) {
            console.log('Accessibility violations found:');
            violations.forEach(violation => {
              console.log(`- ${violation.description}`);
              console.log(`  Impact: ${violation.impact}`);
              console.log(`  Tags: ${violation.tags.join(', ')}`);
            });
          }
          return null;
        }
      });

      return config;
    },

    // Test files pattern
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    // Support file
    supportFile: 'cypress/support/e2e.js',
    
    // Experimental features
    experimentalStudio: true,
    experimentalModifyObstructiveThirdPartyCode: true,
    
    // Retry configuration
    retries: {
      runMode: 2,
      openMode: 0
    },

    // Performance monitoring
    performance: {
      metrics: ['first-contentful-paint', 'largest-contentful-paint', 'cumulative-layout-shift']
    }
  },

  // Component testing configuration
  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack'
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.js'
  },

  // Screenshot configuration
  screenshotsFolder: 'cypress/screenshots',
  videosFolder: 'cypress/videos',
  downloadsFolder: 'cypress/downloads',

  // Reporter configuration
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'spec, mocha-junit-reporter',
    mochaJunitReporterReporterOptions: {
      mochaFile: 'cypress/results/results-[hash].xml',
      toConsole: true
    }
  },

  // Plugin configuration
  pluginsFile: 'cypress/plugins/index.js'
}); 