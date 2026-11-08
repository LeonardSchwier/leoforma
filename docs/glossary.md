# Glossary

| Term | Meaning |
| --- | --- |
| axe | axe-core, the accessibility rule engine used in the component tests. It cannot judge colour contrast under jsdom. |
| Colour role | A semantic name for a colour (`accent`, `surface`, `text`, `danger`). Components use roles; themes assign values. Type: `ColorRoles` in `src/tokens/index.ts`. |
| Design token | A named design decision (a space step, a colour role, a duration) stored once in `src/tokens/index.ts` and emitted as CSS and JSON. |
| `dist/` | Generated build output. Gitignored on `main`, committed only on release tags. |
| `ds-` | Prefix of every CSS class and custom property (`ds-button`, `--ds-space-4`), to avoid collisions with an app's own names. |
| Folio | The default theme: warm and editorial, cream paper, ink navy, a gold ribbon. |
| Mode | Light or dark. Selected by `data-theme`; absent follows the operating system. |
| Nordic | The second theme, selected with `data-palette="nordic"`. |
| Overlay | A surface above the page: `Dialog`, `Sheet` (and the popups of `Menu` and `Tooltip`). Modal ones register in the overlay stack. |
| Overlay stack | `src/components/overlayStack.ts`: the list of open modal surfaces, so Escape or a host's back button closes only the topmost, and scroll lock survives nested dialogs. |
| Palette | Synonym for theme in the attribute name `data-palette`. |
| Peer dependency | A package the consuming app provides. Here: `preact`. |
| Roving focus | One item of a group is in the tab order; arrow keys move focus within. Used by `Tabs` and `SegmentedControl` (`rovingKeys.ts`). |
| Scroll lock | Reference-counted `overflow: hidden` on `body` while a modal is open. |
| Tarball | The `npm pack` archive attached to a release. Its sha512 integrity is documented in [releases](releases.md). |
| Theme | A complete set of colour and elevation values for both modes. Type `Theme`; names in `ThemeName`. |
| WCAG AA | Web Content Accessibility Guidelines 2.1, level AA: 4.5:1 contrast for text, 3:1 for focus rings and control borders. |
