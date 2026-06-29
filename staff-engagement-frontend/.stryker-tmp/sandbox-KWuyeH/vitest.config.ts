// @ts-nocheck
import { defineConfig } from 'vitest/config';

// Standalone Vitest config used by Stryker for mutation testing.
// `ng test` still uses @angular/build:unit-test (angular.json) and ignores this file.
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
  },
});
