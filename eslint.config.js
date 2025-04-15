const globals = require('globals');
const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');

module.exports = [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021
      },
      parserOptions: {
        allowImportExportEverywhere: true,
        sourceType: 'module'
      }
    },
    files: ['**/*.{js,mjs,cjs,jsx}'],
    plugins: {},
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      'no-console': 'off',
      'prefer-const': 'warn',
      'no-undef': 'error',
      'no-var': 'warn',
      'no-case-declarations': 'off' // Turn off no-case-declarations rule
    },
    ignores: [
      'node_modules/**',
      '_site/**',
      '.jekyll-cache/**',
      'vendor/**',
      'dist/**',
      'main_backup_*/**'
    ]
  },
  prettier
];
