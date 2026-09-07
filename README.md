# @mikode13/code-quality

Shared, batteries-included ESLint flat configurations for MiKode TypeScript and React
projects.

> **Status:** Experimental. The API and rule set may change before version `1.0.0`.

## Compatibility

- Node.js `^22.13.0 || ^24.0.0`.
- ESLint `^10.8.0`.
- TypeScript 6 through the bundled `typescript-eslint` toolchain.
- React 18 and 19 for the React configuration.

The package uses ESLint 10 with `@eslint-react/eslint-plugin` and
`eslint-plugin-jsx-a11y-x`. These normal, non-prerelease releases support ESLint 10 and
avoid the vulnerable `minimatch` 3 dependency line used by the earlier React plugin
selection. All tool dependencies are pinned exactly, and `pnpm run check` audits the
production graph. The decision is tracked by
[ADR 0007](https://github.com/mikode13/engineering/blob/main/adr/0007-use-eslint-10-with-modern-react-plugins.md).

`eslint-plugin-jsx-a11y-x` remains on a pre-1.0 version line. Its API is contained behind
this package's `/react` export, so consumers do not configure or version it directly.

## Installation

Install the package alongside its only consumer-managed peer dependency:

```sh
pnpm add --save-dev @mikode13/code-quality eslint@^10.8.0
```

The TypeScript parser, TypeScript, import resolver, React plugins, accessibility plugin,
and shared rule presets are dependencies of this package. Consuming projects do not need
to install or coordinate those packages separately.

pnpm 11 also requires each project to review dependency lifecycle scripts. Add these
decisions to the consuming project's `pnpm-workspace.yaml`:

```yaml
allowBuilds:
  '@mikode13/code-quality': false
  unrs-resolver: true
```

The shared package's published `preinstall` guard is not needed while it is being consumed,
so it remains blocked. `unrs-resolver` is the reviewed native dependency used by the
TypeScript import resolver.

## TypeScript usage

Create `eslint.config.js` in the consuming project:

```js
import codeQuality from '@mikode13/code-quality/base';

export default [
	...codeQuality,
	{
		// Add project-specific ignores or stricter local rules after the shared config.
		ignores: ['generated/**'],
		rules: {
			eqeqeq: 'error',
		},
	},
];
```

Add scripts that reject warnings in CI:

```json
{
	"scripts": {
		"lint": "eslint . --max-warnings 0",
		"lint:fix": "eslint . --fix"
	}
}
```

## React usage

React 18 and 19 projects use the React export instead:

```js
import codeQuality from '@mikode13/code-quality/react';

export default [...codeQuality];
```

The React configuration is framework-neutral. It enables stable React and DOM rules,
the official React Hooks rules, browser globals, and static JSX accessibility rules.
React Server Component and experimental rules are disabled until MiKode selects an SSR
framework. React 19 migration suggestions that would reject valid React 18 APIs are also
disabled while both versions are supported.

## Type-aware linting and tsconfig layout

Type-aware rules use `parserOptions.projectService`. Each linted TypeScript file must be
included by a nearby `tsconfig.json`, just as it must be for editor type information.

A single project may include source and tests together:

```json
{
	"include": ["src", "tests"]
}
```

Alternatively, tests may have a separate configuration:

```text
project/
├── tsconfig.json
├── src/
└── tests/
    ├── tsconfig.json
    └── example.test.ts
```

`projectService` selects the closest configuration for each file, so both layouts are
supported without a dedicated `tsconfig.eslint.json`.

## Included policy

The base export provides:

- ESLint recommended correctness rules.
- `typescript-eslint` strict type-checked and stylistic type-checked presets.
- Type information through TypeScript project service.
- Circular-import and duplicate-import detection through `eslint-plugin-import-x`.
- Consistent type-only imports.
- Errors for unused ESLint disable directives and inline configuration.
- Ignores for dependency, build, coverage, and cache output.

The React export adds:

- `@eslint-react/eslint-plugin` recommended JavaScript and TypeScript rules, excluding
  experimental, React Server Component, and React 19-only migration rules.
- The official React Hooks recommended rules.
- `eslint-plugin-jsx-a11y-x` recommended static accessibility rules.

Formatting rules are deliberately excluded. MiKode uses Prettier through
`@mikode13/code-style` for formatting.

Every `eslint-disable` directive in a consuming project must include a comment explaining
why the shared rule does not apply there. Project-wide rule changes should be appended in
the local flat configuration and documented in that project's README.

## Development

```sh
pnpm install --frozen-lockfile
pnpm run check       # prettier --check, eslint --max-warnings 0, tsc --noEmit
pnpm test            # lints real fixture projects with the presets this package ships
pnpm run pack:check  # asserts the exact published file set
pnpm run audit:prod  # production dependency audit, run deliberately rather than on every check
```

`pre-push` runs `pnpm run check && pnpm test`. CI repeats both and adds `pack:check`.

## Releases

Versions are derived from Conventional Commit titles by `semantic-release` and published
automatically from `main`. The npm registry, Git tags, and GitHub Releases are the
authoritative history; the `version` field in this repository stays at
`0.0.0-development` and is never committed with a real version.

## License

This package is source-available under the MIT License with the Commons Clause License
Condition v1.0. It is not released under an MIT-only or open-source license. See
[`LICENSE`](LICENSE) for the complete terms.
