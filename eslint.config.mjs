import { FlatCompat } from '@eslint/eslintrc'
import loguxConfig from '@logux/eslint-config'
import es5Plugin from 'eslint-plugin-es5'

let compat = new FlatCompat({
  baseDirectory: import.meta.dirname
})

let es5 = compat.extends('plugin:es5/no-es2015')

/** @type {import('eslint').Linter.Config[]} */
export default [
  { ignores: ['coverage'] },
  ...loguxConfig,
  ...es5,
  {
    plugins: {
      es5: es5Plugin
    },
    rules: {
      'node-import/prefer-node-protocol': 'off',
      'perfectionist/sort-objects': 'off',
      'n/prefer-node-protocol': 'off',
      'prefer-let/prefer-let': 'off',
      'prefer-arrow-callback': 'off',
      'no-unused-vars': ['error', { caughtErrors: 'none' }],
      'n/global-require': 'off',
      'object-shorthand': 'off',
      'no-console': 'off',
      'no-var': 'off'
    }
  },
  {
    files: ['cli.js'],
    rules: {
      'n/no-unsupported-features/es-syntax': [
        'error',
        {
          version: '>=12.5.0',
          ignores: []
        }
      ]
    }
  },
  {
    files: ['test/**/*', 'eslint.config.mjs'],
    rules: {
      'n/no-unsupported-features/es-syntax': 'off',
      'es5/no-shorthand-properties': 'off',
      'es5/no-template-literals': 'off',
      'es5/no-rest-parameters': 'off',
      'es5/no-arrow-functions': 'off',
      'es5/no-destructuring': 'off',
      'es5/no-block-scoping': 'off',
      'es5/no-es6-methods': 'off',
      'es5/no-spread': 'off',
      'es5/no-for-of': 'off',
      'no-console': 'off'
    }
  },
  {
    files: ['eslint.config.mjs'],
    rules: {
      'es5/no-modules': 'off'
    }
  }
]
