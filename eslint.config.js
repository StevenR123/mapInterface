// Importing ESLint's JavaScript configuration
import js from '@eslint/js';
// Importing global variables for browser environments
import globals from 'globals';
// Importing React Hooks plugin for ESLint
import reactHooks from 'eslint-plugin-react-hooks';
// Importing React Refresh plugin for ESLint
import reactRefresh from 'eslint-plugin-react-refresh';
// Importing TypeScript ESLint configuration
import tseslint from 'typescript-eslint';

// Exporting the ESLint configuration
export default tseslint.config(
  { ignores: ['dist'] }, // Ignoring the dist folder
  {
    // Extending recommended configurations for JavaScript and TypeScript
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    // Specifying the files to lint
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      // Setting ECMAScript version
      ecmaVersion: 2020,
      // Defining global variables for browser environments
      globals: globals.browser,
    },
    plugins: {
      // Adding React Hooks plugin
      'react-hooks': reactHooks,
      // Adding React Refresh plugin
      'react-refresh': reactRefresh,
    },
    rules: {
      // Adding recommended rules for React Hooks
      ...reactHooks.configs.recommended.rules,
      // Adding rule for React Refresh
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
);
