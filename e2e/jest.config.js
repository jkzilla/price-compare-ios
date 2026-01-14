module.exports = {
  preset: 'detox',
  testEnvironment: 'detox/runners/jest/env',
  testRegex: '.e2e\\.js$',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './test-results/e2e',
        outputName: 'junit.xml',
      },
    ],
  ],
};
