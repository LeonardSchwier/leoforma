# Releases and integrity

A release is a `vX.Y.Z` tag on a commit that includes the built `dist/`, plus the `npm pack` tarball attached to the GitHub release. The package is not published to a registry ([ADR 0003](adr/0003-release-as-tarball-with-integrity-hash.md)).

## v0.2.0 tarball

| Item | Value |
| --- | --- |
| Asset | `leonardschwier-leoforma-0.2.0.tgz` (438430 bytes) |
| sha512 (npm integrity) | `sha512-ikiXafXbfdjN3eluJ09LHq2eakOikf0Pzmk0ANSAgbYcGox0m8YoWr8sOOPp/Y22OkrARPqUs62hkr4o4b958g==` |
| sha256 (GitHub asset digest) | `0526c463b1a27a2b237efc4c1a574d285ec82ab8b959aac9805f365918dda93c` |

The sha512 value is what `npm install` of the release URL writes to a consumer's `package-lock.json` as `integrity`. It was checked on 2026-11-08 in two ways: the downloaded asset hashes to this value, and the Leotheca app's lockfile entry for `@leonardschwier/leoforma` 0.2.0 carries the same value.

## Verify it yourself

```sh
gh release download v0.2.0 -R LeonardSchwier/leoforma -p '*.tgz'
echo "sha512-$(openssl dgst -sha512 -binary leonardschwier-leoforma-0.2.0.tgz | base64 -w0)"
sha256sum leonardschwier-leoforma-0.2.0.tgz
```

On macOS use `base64 -b 0` or `shasum -a 256`. Both printed values must equal the table. With `curl -L` instead of `gh`, check the file size first: a GitHub outage can return a small HTML error page (for example HTTP 504) instead of the asset.

For an installed copy, compare the lockfile entry:

```sh
grep -A3 'node_modules/@leonardschwier/leoforma"' package-lock.json
```

`npm ci` fails with `EINTEGRITY` if the downloaded tarball does not match the recorded hash.

## Publishing a release

Steps are in [CONTRIBUTING.md](../CONTRIBUTING.md#releasing). After attaching the tarball, add its hashes to this page.
