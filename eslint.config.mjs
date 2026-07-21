import neostandard, { plugins } from 'neostandard'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  ...neostandard({
    ts: true,
  }),

  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    plugins: {
      react: plugins.react,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  {
    files: ['**/backend/**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
    },
  },
  {
    // Test suites (unit tests of the library and the examples)
    files: [
      '**/tests/**/*.{js,ts}',
      '**/*.test.{js,ts,jsx,tsx}',
      '**/*.spec.{js,ts,jsx,tsx}',
    ],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },

  {
    // Never lint generated output
    ignores: ['**/coverage/**', '**/dist/**', '**/build/**'],
  }
]
