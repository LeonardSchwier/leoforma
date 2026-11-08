# Leoforma documentation

| Page | Read it to |
| --- | --- |
| [Using Leoforma](using-leoforma.md) | Install a release and render your first component, with copy-paste examples. |
| [Design principles](design-principles.md) | Understand why the library is shaped the way it is. |
| [Components](components/README.md) | Look up props, keyboard behaviour and accessibility notes per component group. |
| [Releases and integrity](releases.md) | Verify the 0.2.0 tarball hash yourself. |
| [Architecture decisions](adr/README.md) | Read the context and consequences of the main decisions. |
| [Glossary](glossary.md) | Find the meaning of terms used in the code and docs. |
| [../ARCHITECTURE.md](../ARCHITECTURE.md) | See how tokens, components and styles fit together. |
| [../CONTRIBUTING.md](../CONTRIBUTING.md) | Set up the repository and add a component. |

`docs/screenshots/` holds the generated light and dark images referenced by the component pages.

The props tables in `docs/components/` are generated from the TypeScript types by `npm run docs` and verified by `npm run docs:check`, which `npm run check` and CI run.
