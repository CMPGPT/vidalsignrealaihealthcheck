import js from '@eslint/js';
import nextPlugin from 'eslint-config-next';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@typescript-eslint': {},
      'react-hooks': {},
      'react-refresh': {}
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-empty-object-type': 'error',
      'react/no-unescaped-entities': 'error'
    }
  },
  {
    ignores: [
      '.next/**',
      'node_modules/**'
    ]
  }
]; 