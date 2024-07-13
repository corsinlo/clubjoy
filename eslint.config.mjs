import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js';
import pluginJest from 'eslint-plugin-jest';

export default [
  { files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'] },
  { languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  pluginReactConfig,
  {
 
    settings: {
      react: {
        version: 'detect', 
      },
    },
    languageOptions: {
      globals: globals.jest,
    },
    plugins: {
      jest: pluginJest,
    },
    rules: {
      ...pluginJest.configs.recommended.rules,
    },
  },
];
