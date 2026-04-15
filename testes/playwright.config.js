const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testMatch: ['**/test_sistema.js'],
  use: {
    headless: true,
    screenshot: 'only-on-failure',
    video: 'off',
  },
  reporter: [['list'], ['html', { open: 'never' }]],
});
