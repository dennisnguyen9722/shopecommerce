/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  transformIgnorePatterns: [
    // ✅ Cho Jest biên dịch @react-pdf/renderer (ESM)
    'node_modules/(?!(?:@react-pdf|@react-pdf/renderer)/)'
  ],
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  moduleNameMapper: {
    '^@react-pdf/renderer$': '<rootDir>/__mocks__/@react-pdf/renderer.ts',
    // ✅ dòng quan trọng để mock sendEmail
    '^../src/utils/sendEmail$': '<rootDir>/__mocks__/src/utils/sendEmail.ts',
    '^../utils/sendEmail$': '<rootDir>/__mocks__/src/utils/sendEmail.ts',
    '^src/utils/sendEmail$': '<rootDir>/__mocks__/src/utils/sendEmail.ts'
  }
}
