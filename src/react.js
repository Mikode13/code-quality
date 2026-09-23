import eslintReact from '@eslint-react/eslint-plugin';
import jsxA11y from 'eslint-plugin-jsx-a11y-x';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

import base from './base.js';

const reactFiles = ['**/*.{jsx,tsx}'];
const reactSourceFiles = ['**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}'];

export default [
	...base,
	{
		...eslintReact.configs.recommended,
		name: '@mikode13/code-quality/react-recommended',
		files: reactFiles,
		languageOptions: {
			globals: {
				...globals.browser,
			},
		},
	},
	{
		...eslintReact.configs['recommended-typescript'],
		name: '@mikode13/code-quality/react-typescript-recommended',
		files: ['**/*.tsx'],
	},
	{
		...eslintReact.configs['disable-rsc'],
		name: '@mikode13/code-quality/react-disable-rsc',
		files: reactFiles,
	},
	{
		...eslintReact.configs['disable-experimental'],
		name: '@mikode13/code-quality/react-disable-experimental',
		files: reactFiles,
	},
	{
		name: '@mikode13/code-quality/react-18-compatibility',
		files: reactFiles,
		rules: {
			'@eslint-react/no-context-provider': 'off',
			'@eslint-react/no-forward-ref': 'off',
			'@eslint-react/no-use-context': 'off',
		},
	},
	{
		name: '@mikode13/code-quality/react-hooks-provider',
		files: reactFiles,
		rules: {
			'@eslint-react/error-boundaries': 'off',
			'@eslint-react/exhaustive-deps': 'off',
			'@eslint-react/purity': 'off',
			'@eslint-react/rules-of-hooks': 'off',
			'@eslint-react/set-state-in-effect': 'off',
			'@eslint-react/set-state-in-render': 'off',
			'@eslint-react/static-components': 'off',
			'@eslint-react/unsupported-syntax': 'off',
			'@eslint-react/use-memo': 'off',
		},
	},
	{
		...reactHooks.configs.flat.recommended,
		name: '@mikode13/code-quality/react-hooks',
		files: reactSourceFiles,
	},
	{
		...jsxA11y.configs.recommended,
		name: '@mikode13/code-quality/jsx-accessibility',
		files: reactFiles,
		languageOptions: {
			...jsxA11y.configs.recommended.languageOptions,
			globals: {
				...globals.browser,
			},
		},
	},
];
