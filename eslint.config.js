import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["src/generated/prisma/**/*.ts"],
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_|', varsIgnorePattern: '^_|' }],
      'quotes': ['error', 'single'],
      // 여기에 프로젝트에 맞는 ESLint 규칙을 추가합니다.
      // 예: '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
];