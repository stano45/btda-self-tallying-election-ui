module.exports = {
  extends: [
    'mantine',
    'plugin:@next/next/recommended',
    'plugin:jest/recommended'
  ],
  plugins: [
    'testing-library',
    'jest',
    'react-hooks'
  ],
  overrides: [
    {
      files: ['**/?(*.)+(spec|test).[jt]s?(x)'],
      extends: ['plugin:testing-library/react'],
    },
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'import/extensions': 'off',
    'react-hooks/rules-of-hooks': 'error',  // Add this rule for checking rules of hooks
    'react-hooks/exhaustive-deps': 'warn'   // Add this rule for checking dependencies
  },
};
