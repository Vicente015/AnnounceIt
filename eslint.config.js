/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

// @ts-check

import eslint from '@eslint/js'
import eslintPluginSort from 'eslint-plugin-sort'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  eslintPluginSort.configs['flat/recommended'],
  eslintPluginUnicorn.configs['flat/recommended'],
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  {
    name: 'disableRules',
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/space-before-blocks': 'error',
      "@typescript-eslint/space-before-function-paren": "error",
      '@typescript-eslint/strict-boolean-expressions': 'off',
      "space-before-function-paren": "off",
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
    name: 'disableSortOnSchemas',
    rules: {
      'sort/object-properties': 'off'
    }
  }
)
