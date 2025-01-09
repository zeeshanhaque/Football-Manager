const { jestConfig } = require('@salesforce/sfdx-lwc-jest/config');

module.exports = {
    ...jestConfig,
    preset: '@lwc/jest-preset',
    moduleNameMapper: {
      '^lightning/(.*)$': '<rootDir>/node_modules/@salesforce/sfdx-lwc-jest/src/lightning/$1',
    },
    modulePathIgnorePatterns: ['<rootDir>/.localdevserver']
};