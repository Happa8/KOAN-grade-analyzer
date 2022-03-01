module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/eslint-recommended", "plugin:@typescript-eslint/recommended", "plugin:react/recommended", "plugin:react-hooks/recommended", "prettier", "plugin:storybook/recommended"],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json']
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    "react/prop-types": "off",
  }
};
