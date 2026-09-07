# AGENTS.md

## What this repository is

`@mikode13/code-quality` is the executable implementation of the MiKode
[code quality standard](https://github.com/Mikode13/engineering/blob/main/standards/code-quality.md),
accepted in
[ADR 0007](https://github.com/Mikode13/engineering/blob/main/adr/0007-use-eslint-10-with-modern-react-plugins.md).
It publishes two ESLint flat configurations and nothing else: `base` for TypeScript and
`react` for React.

## Constraint specific to this repository

The published rules are policy, not preference. A consuming project appends its own
entries after the shared ones and justifies every `eslint-disable` at the directive.
Weakening a shared rule is not a project-level exception; it requires a new or superseding
ADR, and the standard must change in the same breath as the configuration here.

The shared package owns its parser, TypeScript, import resolver, React plugins, and
accessibility plugin as real dependencies, so consuming projects never coordinate those
versions. ESLint itself is the only consumer-managed peer.

## Why there is no TypeScript source

This repository publishes configuration, not code, so it has no `src/**/*.ts`, no build,
and no compiled output. `files` publishes `src` verbatim, which means anything added there
becomes part of the public surface immediately. TypeScript and Vitest exist only to verify
what ships: `tests/integration/` runs the real ESLint engine over fixture projects under
`tests/support/fixtures/`, asserting both that valid code passes and that each preset still
reports the failures it exists to catch.

Those fixtures contain deliberately invalid code. They are excluded from this repository's
own lint run (`eslint.config.js`) and from its type checking (`tests/tsconfig.json`) —
otherwise the repository would report the very errors its tests assert.

## Local validation

```sh
pnpm install --frozen-lockfile
pnpm run check       # prettier --check, eslint --max-warnings 0, tsc --noEmit
pnpm test            # lints the fixture projects with the shipped presets, fully offline
pnpm run pack:check  # asserts the exact published file set
pnpm run audit:prod  # production dependency audit
```

`pre-push` runs `pnpm run check && pnpm test`. CI repeats both and adds `pack:check`.

### Hazards

- Changing a rule changes published policy for every MiKode repository at once. The
  fixture suites fail when a preset stops reporting an invariant, and the code quality
  standard must be updated in the same change.
- Type-aware rules are the reason `base` needs a TypeScript program at all. A preset that
  silently stopped providing one would still lint and still report nothing, which is why
  the suites assert on reported rule ids rather than on exit codes.
- Never add package-manager enforcement to a lifecycle script. `preinstall` shipped in
  `0.1.0` and ran for every consumer; see [`docs/decisions.md`](docs/decisions.md).
- Adding a file under `src` publishes it. `scripts/pack-check.mjs` lists the expected
  tarball contents explicitly so that stays a decision rather than an accident.

## Engineering standards

This repository follows the active standards in
[`Mikode13/engineering`](https://github.com/Mikode13/engineering/blob/main/standards/README.md).
Do not duplicate their content here; read them there when a change touches package
management, code quality, formatting, git workflow, testing, publication, or CI.

## Releases

Publication is automated. `package.json` stays at `0.0.0-development` in source control;
semantic-release calculates the real version from Conventional Commits and publishes it
through npm Trusted Publishing after the required CI result passes on `main`. Never
hand-edit the version or publish manually.
