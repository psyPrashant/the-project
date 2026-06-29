/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
// @ts-nocheck

export default {
  testRunner: 'vitest',
  vitest: {
    configFile: './vitest.config.ts',
  },
  checkers: ['typescript'],
  tsconfigFile: 'tsconfig.json',
  mutate: [
    'src/app/**/*.ts',
    '!src/app/**/*.spec.ts',
    '!src/app/app.config.ts',
    '!src/app/app.routes.ts',
  ],
  reporters: ['html', 'clear-text', 'progress'],
  coverageAnalysis: 'perTest',
  thresholds: { high: 80, low: 70, break: 60 },
};
