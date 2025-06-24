// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const next = require('@next/eslint-plugin-next');
const prettierPlugin = require('eslint-plugin-prettier');
const globals = require('globals');

module.exports = [
  {
    ignores: ['node_modules', '.next', 'dist', 'firebase-debug.log'],
  },
  js.configs.recommended,
  next.flatConfig.coreWebVitals,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prettier/prettier': 'error',
    },
  },
  {
    files: [
      '**/*.config.ts',
      'tailwind.config.ts',
      'eslint.config.js',
      'jest.config.ts',
      'jest.config.js',
    ],
    languageOptions: {
      parser: tsParser,
      globals: globals.node,
    },
  },
  {
    files: [
      '**/__tests__/**',
      '**/*.test.ts',
      '**/*.test.tsx',
      'jest.setup.ts',
      'tests/**/*.ts',
      'tests/**/*.tsx',
      'src/tests/**/*.ts',
      'src/tests/**/*.tsx',
    ],
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.jest,
        ...globals.node,
        ...globals.browser,
      },
    },
  },
];
