import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ESLint, type Linter } from 'eslint';
import { beforeAll, describe, expect, it } from 'vitest';

const repositoryRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const baseFixture = path.join(repositoryRoot, 'tests/support/fixtures/base');
const reactFixture = path.join(repositoryRoot, 'tests/support/fixtures/react');

/**
 * Loads a preset through its published `exports` entry rather than by relative path into
 * `src`. Node resolves a package's own name, so this repository consumes its own contract:
 * a renamed file or a broken `exports` map fails here instead of in the first project that
 * upgrades.
 */
async function loadPreset(name: 'base' | 'react'): Promise<Linter.Config[]> {
	const resolved = import.meta.resolve(`@mikode13/code-quality/${name}`);
	const loaded = (await import(resolved)) as { default: Linter.Config[] };

	return loaded.default;
}

async function lintFixture(
	cwd: string,
	config: Linter.Config[],
	patterns: string[],
): Promise<Linter.LintMessage[]> {
	const eslint = new ESLint({ cwd, overrideConfig: config, overrideConfigFile: true });
	const results = await eslint.lintFiles(patterns);

	return results.flatMap(result => result.messages);
}

/** The rule ids reported, which is what a preset's behaviour actually amounts to. */
async function reportedRules(
	cwd: string,
	config: Linter.Config[],
	patterns: string[],
): Promise<Set<string>> {
	const messages = await lintFixture(cwd, config, patterns);

	return new Set(messages.map(message => message.ruleId).filter(id => id !== null));
}

let base: Linter.Config[];
let react: Linter.Config[];

beforeAll(async () => {
	base = await loadPreset('base');
	react = await loadPreset('react');
});

describe('the base preset', () => {
	it('is a flat config array a project can extend', async () => {
		expect(Array.isArray(base)).toBe(true);

		const eslint = new ESLint({
			cwd: baseFixture,
			overrideConfig: [...base, { files: ['**/*.ts'], rules: { eqeqeq: 'error' } }],
			overrideConfigFile: true,
		});
		const config = (await eslint.calculateConfigForFile('src/valid.ts')) as {
			rules: Record<string, [number]>;
		};

		expect(config.rules.eqeqeq?.[0]).toBe(2);
	});

	it('accepts valid typed source, a separate test tsconfig, and JavaScript tooling', async () => {
		const messages = await lintFixture(baseFixture, base, [
			'src/valid.ts',
			'tests/valid.test.ts',
			'tooling.config.js',
		]);

		expect(messages).toStrictEqual([]);
	});

	// Type-aware rules are the reason this preset needs a TypeScript program at all, so a
	// preset that silently stopped providing one would still lint and still report nothing.
	it('reports typed correctness and import-hygiene failures', async () => {
		const rules = await reportedRules(baseFixture, base, ['src/invalid/**/*.ts']);

		expect(rules).toContain('@typescript-eslint/no-floating-promises');
		expect(rules).toContain('@typescript-eslint/consistent-type-imports');
		expect(rules).toContain('import-x/no-cycle');
	});
});

describe('the React preset', () => {
	it('accepts valid React 18 and React 19 components', async () => {
		expect(Array.isArray(react)).toBe(true);

		const messages = await lintFixture(reactFixture, react, [
			'src/valid.tsx',
			'src/react-18-valid.tsx',
			'src/react-hooks-valid.ts',
			'src/react-hooks-valid.js',
		]);

		expect(messages).toStrictEqual([]);
	});

	it('reports React, Hooks, and accessibility failures', async () => {
		const rules = await reportedRules(reactFixture, react, ['src/invalid.tsx']);

		expect(rules).toContain('@eslint-react/no-missing-key');
		expect(rules).toContain('react-hooks/rules-of-hooks');
		expect(rules).toContain('jsx-a11y-x/alt-text');
	});

	it.each(['src/react-hooks-invalid.ts', 'src/react-hooks-invalid.js'])(
		'reports Hooks failures in %s custom hooks',
		async pattern => {
			const rules = await reportedRules(reactFixture, react, [pattern]);

			expect(rules).toContain('react-hooks/rules-of-hooks');
			expect(rules).toContain('react-hooks/exhaustive-deps');
		},
	);
});
