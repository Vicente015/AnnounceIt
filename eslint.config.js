/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @ts-check
import eslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import eslintConfigLove from 'eslint-config-love'
import eslintPluginSort from 'eslint-plugin-sort'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['coverage/', 'dist/']
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    ...eslintConfigLove,
    files: ['*.js', '*.jsx', '*.ts', '*.tsx']
  },
  stylistic.configs.customize({
    arrowParens: true,
    commaDangle: 'never',
    indent: 2,
    quotes: 'single',
    semi: false
  }),
  {
    rules: {
      '@stylistic/space-before-function-paren': ['error', 'always']
    }
  },
  eslintPluginSort.configs['flat/recommended'],
  eslintPluginUnicorn.configs['flat/recommended'],
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json'
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
      '@typescript-eslint/strict-boolean-expressions': 'off',
      'unicorn/consistent-function-scoping': 'warn',
      'unicorn/filename-case': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-await-expression-member': 'off',
      'unicorn/prefer-module': 'warn',
      'unicorn/prefer-top-level-await': 'warn'
    }
  },
  {
    files: [
      'src/schemas/*'
    ],
    name: 'disableSortOnSchemas',
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      'sort/object-properties': 'off'
    }
  },
  {
    files: ['src/tests/*'],
    name: 'disableOnTests',
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      'unicorn/no-null': 'off'
    }
  }
)
