# 0003. Releases as tags with a built `dist/` and a tarball asset with a pinned hash

Status: Accepted

## Context

The package is private (`"private": true`) and used by a few apps, one of them a desktop app built in sandboxed packagers and on Windows. Publishing to a public registry adds an account, a supply-chain surface and a public API promise that this library does not want. Installing straight from a git branch runs the `prepare` build on the consumer, which needs the dev toolchain and can fail in sandboxes. History: release `0.1.1` documented the install of a tag, `0.2.0` added the tarball asset (commits `e7e56a3`, `51b6621`).

## Decision

A release is a `vX.Y.Z` tag on a commit that contains the built `dist/` (committed on the release commit only, never on `main`), plus the `npm pack` tarball attached to the GitHub release. Consumers install the tarball URL; `npm` records its sha512 `integrity` in their lockfile, and the repository documents the expected hash ([releases](../releases.md)).

## Consequences

- Consumers need no build step and no registry; installs work from the npm cache.
- A changed or swapped tarball fails `npm ci` with an integrity error, and anyone can recompute the hash.
- Releasing is manual (build, commit `dist/` on the tag, pack, attach); the steps are in `CONTRIBUTING.md`.
- No automatic update notices for consumers; Dependabot cannot track the tarball.
- Tagged commits are not on the `main` history line, so `git log main` does not show them.
