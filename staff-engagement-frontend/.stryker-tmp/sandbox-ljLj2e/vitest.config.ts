// @ts-nocheck
import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

// Standalone Vitest config used by Stryker for mutation testing.
// `ng test` still uses @angular/build:unit-test (angular.json) and ignores this file.
// The @analogjs/vite-plugin-angular plugin handles Angular template compilation
// so components with external templateUrls can be rendered in tests.
export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
  },
});
