// Component gallery. It exists to generate the README screenshots
// (npm run screenshots) and doubles as a manual check of both themes.
// All content is fictional.
import { render, type ComponentChildren } from "preact";
import { useState } from "preact/hooks";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Dialog,
  EmptyState,
  Icon,
  IconButton,
  ICON_NAMES,
  Input,
  Menu,
  SegmentedControl,
  Select,
  Sheet,
  Spinner,
  StatusIndicator,
  Switch,
  Tabs,
  Textarea,
  ToastRegion,
  Tooltip,
} from "../src/index";
import "../dist/styles.css";

const params = new URLSearchParams(location.search);
const theme = params.get("theme");
if (theme === "light" || theme === "dark") {
  document.documentElement.setAttribute("data-theme", theme);
}
const palette = params.get("palette");
if (palette) document.documentElement.setAttribute("data-palette", palette);
const only = params.get("only");

const noop = () => {};

function Demo({ id, children }: { id: string; children: ComponentChildren }) {
  return (
    <section
      data-demo={id}
      style="padding:20px;background:var(--ds-color-canvas,Canvas);color:var(--ds-color-text,CanvasText);width:560px;box-sizing:border-box"
    >
      {children}
    </section>
  );
}

function Row({ children }: { children: ComponentChildren }) {
  return <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:8px 0">{children}</div>;
}

function TabsDemo() {
  const [value, setValue] = useState("shelf");
  return (
    <Tabs
      label="Library sections"
      value={value}
      onChange={setValue}
      items={[
        { id: "shelf", label: "Shelf", panel: <p>Twelve books on the shelf.</p> },
        { id: "notes", label: "Notes", panel: <p>Three notes this week.</p> },
        { id: "stats", label: "Stats", panel: <p>Reading statistics.</p> },
      ]}
    />
  );
}

function SegmentedDemo() {
  const [value, setValue] = useState("grid");
  return (
    <SegmentedControl
      label="Layout"
      value={value}
      onChange={setValue}
      options={[
        { value: "grid", label: "Grid" },
        { value: "list", label: "List" },
        { value: "table", label: "Table" },
      ]}
    />
  );
}

function Gallery() {
  return (
    <div style="display:flex;flex-direction:column;gap:0">
      <Demo id="button">
        <Row>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </Row>
        <Row>
          <Button size="sm">Small</Button>
          <Button loading>Saving</Button>
          <Button disabled>Disabled</Button>
          <Spinner label="Loading" />
        </Row>
      </Demo>
      <Demo id="icon-button">
        <Row>
          <IconButton icon={<Icon name="close" size={20} />} label="Close" />
          <IconButton icon={<Icon name="check" size={20} />} label="Done" size="md" />
          <IconButton icon={<Icon name="check" size={20} />} label="Selected" active />
        </Row>
      </Demo>
      <Demo id="icon">
        <Row>
          {ICON_NAMES.map((name) => (
            <span key={name} title={name}>
              <Icon name={name} size={24} />
            </span>
          ))}
        </Row>
      </Demo>
      <Demo id="badge">
        <Row>
          <Badge>Neutral</Badge>
          <Badge tone="accent">Accent</Badge>
          <Badge tone="success">Success</Badge>
          <Badge tone="warning">Warning</Badge>
          <Badge tone="danger">Danger</Badge>
        </Row>
      </Demo>
      <Demo id="status-indicator">
        <Row>
          <StatusIndicator>Idle</StatusIndicator>
          <StatusIndicator variant="progress">Syncing</StatusIndicator>
          <StatusIndicator variant="success">Saved</StatusIndicator>
          <StatusIndicator variant="warning">Slow connection</StatusIndicator>
          <StatusIndicator variant="danger">Upload failed</StatusIndicator>
        </Row>
      </Demo>
      <Demo id="card">
        <Card title="Reading list">A calm surface for grouped content.</Card>
        <div style="height:12px" />
        <Card title="Raised card" raised>
          Raised cards sit above the page.
        </Card>
      </Demo>
      <Demo id="empty-state">
        <EmptyState
          icon={<Icon name="search" size={32} />}
          title="Nothing here yet"
          description="Add your first book to start a shelf."
          primaryAction={<Button>Add a book</Button>}
          secondaryAction={<Button variant="ghost">Learn more</Button>}
        />
      </Demo>
      <Demo id="fields">
        <div style="display:flex;flex-direction:column;gap:12px">
          <Input label="Title" hint="As printed on the cover" defaultValue="The Quiet Orchard" />
          <Input label="Author" error="Author is required" />
          <Textarea label="Note" defaultValue="A fictional note." />
          <Select
            label="Format"
            options={[
              { value: "paper", label: "Paperback" },
              { value: "ebook", label: "E-book" },
            ]}
          />
          <Checkbox label="Mark as read" defaultChecked />
          <Switch label="Share my shelf" />
        </div>
      </Demo>
      <Demo id="tabs">
        <TabsDemo />
      </Demo>
      <Demo id="segmented-control">
        <SegmentedDemo />
      </Demo>
    </div>
  );
}

function Overlay() {
  const [open, setOpen] = useState(true);
  if (only === "dialog") {
    return open ? (
      <Dialog
        title="Remove this book?"
        description="It will leave your shelf but your notes stay."
        actions={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => setOpen(false)}>
              Remove
            </Button>
          </>
        }
        onDismiss={() => setOpen(false)}
      />
    ) : null;
  }
  if (only === "sheet") {
    return open ? (
      <Sheet
        title="Filter books"
        description="Narrow the shelf by format."
        actions={<Button onClick={() => setOpen(false)}>Apply</Button>}
        onDismiss={() => setOpen(false)}
      >
        <Switch label="Only e-books" />
      </Sheet>
    ) : null;
  }
  if (only === "toast") {
    return (
      <ToastRegion
        onDismiss={noop}
        toasts={[
          { id: "a", message: "Book added to your shelf", tone: "success" },
          { id: "b", message: "Connection is slow", tone: "warning" },
        ]}
      />
    );
  }
  if (only === "menu") {
    return (
      <div style="padding:20px">
        <Menu
          label="Book actions"
          trigger="Actions"
          items={[
            { id: "edit", label: "Edit", icon: <Icon name="check" size={16} />, onSelect: noop },
            { id: "share", label: "Share", onSelect: noop, disabled: true, disabledReason: "Sharing is off" },
            { id: "remove", label: "Remove", variant: "danger", onSelect: noop },
          ]}
        />
      </div>
    );
  }
  return (
    <div style="padding:60px 20px">
      <Tooltip content="Adds the book to your shelf">
        <Button>Add book</Button>
      </Tooltip>
    </div>
  );
}

const root = document.getElementById("app")!;
document.body.style.cssText =
  "margin:0;background:var(--ds-color-canvas,Canvas);color:var(--ds-color-text,CanvasText);font-family:var(--ds-font-sans,system-ui)";
render(only ? <Overlay /> : <Gallery />, root);
