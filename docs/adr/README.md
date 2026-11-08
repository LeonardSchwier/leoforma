# Architecture decision records

Short records of decisions that shape the repository: context, decision, consequences. Each one points at the code or history that shows it. Status is `Accepted` when the decision is in force. To change a decision, add a new record that supersedes the old one instead of editing history.

| ADR | Decision |
| --- | --- |
| [0001](0001-tokens-as-css-custom-properties.md) | Design tokens are one TypeScript module, emitted as CSS custom properties and JSON |
| [0002](0002-palette-via-data-attribute.md) | Mode and palette are selected by `data-theme` and `data-palette` attributes |
| [0003](0003-release-as-tarball-with-integrity-hash.md) | Releases are tags with a committed `dist/` plus a tarball asset with a pinned integrity hash |
| [0004](0004-axe-check-per-component.md) | Every component has an axe-core test, and contrast is a failing test |
| [0005](0005-preact-peer-dependency-only.md) | Preact is the only runtime dependency, as a peer dependency |

Template for a new record: `NNNN-short-title.md` with the sections Status, Context, Decision, Consequences.
