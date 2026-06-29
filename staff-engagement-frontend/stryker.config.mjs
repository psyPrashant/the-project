/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  mutate: ['src/app/portfolios/portfolio.service.ts'],
  command: 'npx ng test --watch=false --include="src/app/portfolios/**/*.spec.ts" --progress=false',
  testRunner: 'command',
  reporters: ['html', 'json', 'progress', 'clear-text'],
  coverageAnalysis: 'off',
  timeoutMS: 120000,
  timeoutFactor: 3,
  concurrency: 1,
  ignorePatterns: [
    '.angular/',
    'dist/',
    'node_modules/',
    'test-results/',
    'coverage/',
    'reports/',
    'e2e/',
    'public/',
  ],
};
