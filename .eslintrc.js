module.exports = {
    parser: "@typescript-eslint/parser",
    extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended",
    ],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
    },
    ignorePatterns: [".eslintrc.js"],
    rules: {
        // 여기에 특정 ESLint 규칙을 추가하거나 재정의할 수 있습니다.
    },
};
