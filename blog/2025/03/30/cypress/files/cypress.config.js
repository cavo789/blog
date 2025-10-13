const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3100',
    port: 3100,
    supportFile: false,
  },
});
