import { FlatCompat } from '@eslint/eslintrc'
import pluginJs from '@eslint/js'
import eslintPluginSort from 'eslint-plugin-sort'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// mimic CommonJS variables -- not needed if using CommonJS
const fileName = fileURLToPath(import.meta.url)
const directoryName = path.dirname(fileName)
const compat = new FlatCompat({ baseDirectory: directoryName, recommendedConfig: pluginJs.configs.recommended })

export default [
  ...compat.extends('standard-with-typescript'),
  eslintPluginSort.configs['flat/recommended'],
  eslintPluginUnicorn.configs['flat/recommended'],
  {
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-await-expression-member': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-top-level-await': 'off'
    }
  },
  {
    files: [
      'src/schemas/*'
    ],
    rules: {
      'sort/object-properties': 'off'
    }
  },
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json']
      }
    }
  },
  {
    ignores: ['dist', 'src/**/*.js']
  }
]
