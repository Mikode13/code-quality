# Project decisions

A chronological log of decisions specific to `@mikode13/code-quality`. Cross-project
decisions live in [`Mikode13/engineering`](https://github.com/Mikode13/engineering); this
file records only what a future maintainer of this package could not derive from those.

## The package-manager guard is gone, not relocated

**Decision.** This repository ships no lifecycle script whose purpose is enforcing that
contributors use pnpm. The committed lockfile, CI, and review are the enforcement boundary.

**Context.** `0.1.0` published `"preinstall": "npx only-allow pnpm"`, and `preinstall` is a
real install-time script: every consumer installing `@mikode13/code-quality` ran it, and a
consumer using npm or Yarn had their install fail on a guard that exists for this
repository's contributors. The package management standard forbids publishing a lifecycle
script that only enforces the contributor package manager, for exactly this reason.

Relocating it to `prepare` is not the fix either. npm runs `prepare` before `npm pack` and
`npm publish`, and the guard rejects npm's own user agent, so the release workflow's
tarball verification and the publish itself would both fail. The sibling
[`Mikode13/tsconfig`](https://github.com/Mikode13/tsconfig/blob/main/docs/decisions.md)
worked through that in production.

**Consequences.** `npm install` in this repository no longer fails fast with a helpful
message. That is a deliberate trade: a local convenience is not worth a lifecycle script in
the published manifest. `0.1.0` keeps the guard it shipped with, because a published npm
version can never be overwritten; consumers who need it gone move to `1.0.0`.

**Lesson.** A guard that protects contributors does not belong in the artifact strangers
install.

## The presets are verified by linting, not by inspecting rule objects

**Decision.** `tests/integration/` runs the real ESLint engine over fixture projects with
each preset and asserts on the rule ids reported. Fixtures come in pairs: valid code that
must produce no messages, and invalid code that must report a named MiKode-owned rule.

**Context.** Reading the exported configuration proves what the file says, which is the
part nobody gets wrong. It cannot prove that a rule still fires. Type-aware rules are the
clearest case: `base` requires a TypeScript program through `parserOptions.projectService`,
and a preset that silently stopped providing one would still load, still lint, and still
report nothing at all. Asserting on reported rule ids notices; asserting on the config
object does not.

The fixtures deliberately contain invalid code, so they are excluded from this repository's
own `eslint.config.js` ignores and from `tests/tsconfig.json`. Without that the repository
reports the very errors its own tests assert.

**Consequences.** The suite is slower, because it constructs real TypeScript programs, and
it needs `react` and `@types/react` as development dependencies purely as fixture material.

## Stable publication is enabled at 1.0.0

**Decision.** Enable automated publication through the shared release workflow, and make
the first automated release `1.0.0` rather than continuing the `0.x` line.

**Context.** `0.1.0` was published manually, before the release pipeline existed. The
automated npm publication standard requires a package with existing `0.x` versions to
reconcile its newest npm version with a Git tag on the released commit before activating.
No tag existed; `v0.1.0` now points at `d2e1aea`.

Identifying that commit took evidence rather than assumption. `main` had moved on to
`0c599d7` before this change, and the newest commit is the obvious guess — but `0c599d7`
post-dates the publish by a week, and its manifest differs from the published one. Parsing
both manifests and comparing field by field showed `d2e1aea` matching on every field, with
`src/base.js` and `src/react.js` byte-identical to the published tarball.

`repository.url` also moves to the canonical `Mikode13` owner casing. npm's provenance
verification compares it against the signed attestation and rejects a lowercase owner with
a `422`, at the publish step, after the release tag has already been pushed.

**Consequences.** The source `package.json` stays at `0.0.0-development`; the real version
exists only in npm, the Git tag, and the GitHub Release. Version bumps are never committed,
and the repository has no `CHANGELOG.md`. The package now carries a stable major, so any
later change that removes or weakens a shipped rule needs an explicit breaking-change
marker.
