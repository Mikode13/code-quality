import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		projects: [
			{
				test: {
					name: 'integration',
					include: ['tests/integration/**/*.integration.test.ts'],
					// Each case runs the real ESLint engine with type-aware rules over a fixture
					// project, which loads a TypeScript program and comfortably exceeds the
					// 5s default.
					testTimeout: 120_000,
					hookTimeout: 120_000,
				},
			},
		],
	},
});
