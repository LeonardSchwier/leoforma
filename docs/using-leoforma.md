# Using Leoforma

## 1. Install

Leoforma is not on npm. Install a release tarball (details and hash check in [releases](releases.md)):

```sh
npm install --save-exact https://github.com/LeonardSchwier/leoforma/releases/download/v0.2.0/leonardschwier-leoforma-0.2.0.tgz
npm install preact   # peer dependency, >=10.25.0 <12
```

## 2. Load the styles once

```ts
import "@leonardschwier/leoforma/styles.css"; // fonts, tokens, components
```

To load pieces separately keep this order: `fonts.css`, `tokens.css`, `components.css`. Tokens alone (`tokens.css`, `tokens.json`, or the `/tokens` TypeScript module) work without any component.

## 3. Render components

```tsx
import { Button, Input, StatusIndicator } from "@leonardschwier/leoforma";

export function Rename() {
  return (
    <form>
      <Input label="Title" hint="Shown in the library" />
      <Button type="submit" variant="primary">Save</Button>
      <StatusIndicator variant="success" live="polite">Saved</StatusIndicator>
    </form>
  );
}
```

A controlled tab set:

```tsx
import { useState } from "preact/hooks";
import { Tabs } from "@leonardschwier/leoforma";

export function Reader() {
  const [tab, setTab] = useState("notes");
  return (
    <Tabs
      label="Book sections"
      value={tab}
      onChange={setTab}
      items={[
        { id: "notes", label: "Notes", panel: <p>Your notes</p> },
        { id: "quotes", label: "Quotes", panel: <p>Your quotes</p> },
      ]}
    />
  );
}
```

A modal dialog. The host owns the open state and decides what each dismissal does:

```tsx
import { Button, Dialog } from "@leonardschwier/leoforma";

<Dialog
  title="Delete this note?"
  description="This cannot be undone."
  role="alertdialog"
  onDismiss={(reason) => close(reason)} // "escape" | "backdrop" | "backbutton" | "close-button"
  actions={<Button variant="danger" onClick={remove}>Delete</Button>}
/>
```

## 4. Choose mode and palette

```html
<html data-theme="dark" data-palette="nordic">
```

Leave `data-theme` off to follow the operating system. Leave `data-palette` off for Folio. Change either at runtime with `document.documentElement.setAttribute(...)`; no re-render is needed.

## 5. Use tokens in your own CSS

```css
.my-panel {
  padding: var(--ds-space-4);
  border-radius: var(--ds-radius-lg);
  background: var(--ds-color-surface);
  color: var(--ds-color-text);
}
```

Or in TypeScript:

```ts
import { colorVar, tokens } from "@leonardschwier/leoforma/tokens";
colorVar("accent");      // "var(--ds-color-accent)"
tokens.space["4"];       // "16px"
```

Variable names follow `--ds-<group>-<key>` in kebab case; list them in [`src/tokens/index.ts`](../src/tokens/index.ts) or the generated `dist/tokens.css`.

## 6. Next

Per-component props, keyboard behaviour and accessibility notes: [components](components/README.md).
