import { act, fireEvent, render } from "@testing-library/preact";
import { useState } from "preact/hooks";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Dialog,
  dismissTopOverlay,
  EmptyState,
  Icon,
  ICON_NAMES,
  IconButton,
  Input,
  Menu,
  onOverlayPush,
  resetOverlayStackForTests,
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
} from "../src";
import { focusableElements } from "../src/components/overlayStack";
import { rovingTabStop } from "../src/components/rovingKeys";
import { expectNoAxeViolations } from "./axeCheck";
import { installCheckVisibilityStub } from "./checkVisibility";

const icon = <svg aria-hidden="true" width="16" height="16" />;

describe("Button", () => {
  it("defaults to a non-submitting secondary button", () => {
    const { getByRole } = render(<Button>Save</Button>);
    const button = getByRole("button", { name: "Save" });
    expect(button.getAttribute("type")).toBe("button");
    expect(button.className).toContain("ds-btn-secondary");
  });

  it("blocks activation while loading and keeps its accessible name", () => {
    const onClick = vi.fn();
    const { getByRole } = render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const button = getByRole("button", { name: "Save" }) as HTMLButtonElement;
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.getAttribute("aria-disabled")).toBe("true");
    button.click();
    expect(onClick).not.toHaveBeenCalled();
  });

  // A natively disabled button drops focus (to the body in Chromium, checked
  // there with Playwright), so a keyboard user who pressed "Save" would lose
  // their place. jsdom does not model that, so the test pins the cause: a busy
  // button must not be natively disabled, and focus must survive the rerender.
  it("stays focusable while loading, so a keyboard user keeps their place", () => {
    const { getByRole, rerender } = render(<Button>Save</Button>);
    const button = getByRole("button", { name: "Save" }) as HTMLButtonElement;
    button.focus();
    rerender(<Button loading>Save</Button>);
    expect(button.disabled).toBe(false);
    expect(document.activeElement).toBe(button);
    rerender(<Button>Save</Button>);
    expect(button.hasAttribute("aria-disabled")).toBe(false);
    expect(button.hasAttribute("aria-busy")).toBe(false);
    expect(document.activeElement).toBe(button);
  });

  it("activates again when loading ends", () => {
    const onClick = vi.fn();
    const { getByRole, rerender } = render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const button = getByRole("button", { name: "Save" });
    button.click();
    rerender(
      <Button onClick={onClick}>Save</Button>,
    );
    button.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not submit or reset a form while loading, and does for a normal button", () => {
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    const onReset = vi.fn();
    const { getByRole, rerender } = render(
      <form onSubmit={onSubmit} onReset={onReset}>
        <Button type="submit" loading>
          Send
        </Button>
        <Button type="reset" loading>
          Clear
        </Button>
      </form>,
    );
    // Enter and Space on a focused button, and Enter in a text field, all end in
    // a click on the button, so the click is the one place to stop them.
    getByRole("button", { name: "Send" }).click();
    getByRole("button", { name: "Clear" }).click();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onReset).not.toHaveBeenCalled();

    rerender(
      <form onSubmit={onSubmit} onReset={onReset}>
        <Button type="submit">Send</Button>
        <Button type="reset">Clear</Button>
      </form>,
    );
    getByRole("button", { name: "Send" }).click();
    getByRole("button", { name: "Clear" }).click();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("keeps a click on a loading button away from its ancestors", () => {
    // A natively disabled button delivered no click to a clickable Card or row;
    // the busy button must not start doing so.
    const onAncestorClick = vi.fn();
    const { getByRole } = render(
      <div onClick={onAncestorClick}>
        <Button loading>Open</Button>
      </div>,
    );
    getByRole("button", { name: "Open" }).click();
    expect(onAncestorClick).not.toHaveBeenCalled();
  });

  it("stays natively disabled when the host disables it, loading or not", () => {
    const onClick = vi.fn();
    const { getByRole } = render(
      <Button disabled loading onClick={onClick}>
        Save
      </Button>,
    );
    const button = getByRole("button", { name: "Save" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.hasAttribute("aria-disabled")).toBe(false);
    expect(button.getAttribute("aria-busy")).toBe("true");
    button.click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("reports unavailable while loading even if the host said aria-disabled=false", () => {
    const { getByRole } = render(
      <Button loading aria-disabled="false">
        Save
      </Button>,
    );
    expect(getByRole("button", { name: "Save" }).getAttribute("aria-disabled")).toBe("true");
  });

  it("keeps a host aria-disabled when it is not loading", () => {
    const { getByRole } = render(<Button aria-disabled="true">Save</Button>);
    expect(getByRole("button", { name: "Save" }).getAttribute("aria-disabled")).toBe("true");
  });

  it("passes clicks to the host handler when idle", () => {
    const onClick = vi.fn();
    const { getByRole } = render(<Button onClick={onClick}>Save</Button>);
    getByRole("button", { name: "Save" }).click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("has no axe violations while loading", async () => {
    const { container } = render(
      <div>
        <Button loading>Save</Button>
        <Button disabled loading>
          Delete
        </Button>
      </div>,
    );
    await expectNoAxeViolations(container);
  });

  it("has no axe violations in any variant", async () => {
    const { container } = render(
      <div>
        <Button variant="primary">A</Button>
        <Button variant="ghost">B</Button>
        <Button variant="danger" size="sm">
          C
        </Button>
      </div>,
    );
    await expectNoAxeViolations(container);
  });
});

describe("IconButton", () => {
  it("names itself from the label and exposes the toggle state", () => {
    const { getByRole } = render(<IconButton icon={icon} label="Bold" active />);
    const button = getByRole("button", { name: "Bold" });
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(button.getAttribute("title")).toBe("Bold");
  });

  it("replaces the glyph with a spinner while loading", () => {
    const { getByRole, container } = render(
      <IconButton icon={icon} label="Sync" loading />,
    );
    const button = getByRole("button") as HTMLButtonElement;
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(container.querySelector(".ds-spinner")).not.toBeNull();
  });

  it("blocks activation and keeps focus while loading", () => {
    const onClick = vi.fn();
    const onAncestorClick = vi.fn();
    const { getByRole, rerender } = render(
      <div onClick={onAncestorClick}>
        <IconButton icon={icon} label="Sync" onClick={onClick} />
      </div>,
    );
    const button = getByRole("button", { name: "Sync" }) as HTMLButtonElement;
    button.focus();
    rerender(
      <div onClick={onAncestorClick}>
        <IconButton icon={icon} label="Sync" loading onClick={onClick} />
      </div>,
    );
    expect(button.disabled).toBe(false);
    expect(document.activeElement).toBe(button);
    button.click();
    expect(onClick).not.toHaveBeenCalled();
    expect(onAncestorClick).not.toHaveBeenCalled();
    rerender(
      <div onClick={onAncestorClick}>
        <IconButton icon={icon} label="Sync" onClick={onClick} />
      </div>,
    );
    button.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("stays natively disabled when the host disables it, loading or not", () => {
    const onClick = vi.fn();
    const { getByRole } = render(
      <IconButton icon={icon} label="Sync" disabled loading onClick={onClick} />,
    );
    const button = getByRole("button", { name: "Sync" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.hasAttribute("aria-disabled")).toBe(false);
    button.click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("has no axe violations while loading", async () => {
    const { container } = render(<IconButton icon={icon} label="Sync" loading />);
    await expectNoAxeViolations(container);
  });

  it("has no axe violations", async () => {
    const { container } = render(<IconButton icon={icon} label="Bold" />);
    await expectNoAxeViolations(container);
  });
});

describe("Spinner", () => {
  it("is decorative without a label and a status with one", () => {
    const first = render(<Spinner />);
    expect(first.queryByRole("status")).toBeNull();
    const second = render(<Spinner label="Loading notes" />);
    expect(second.getByRole("status", { name: "Loading notes" })).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        <Spinner />
        <Spinner label="Loading notes" />
      </div>,
    );
    await expectNoAxeViolations(container);
  });
});

describe("form fields", () => {
  it("associates Input with its label and describes it with hint and error", () => {
    const { getByLabelText, getByText } = render(
      <Input label="Title" hint="Shown in the tab" error="Required" />,
    );
    const input = getByLabelText("Title");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const described = input.getAttribute("aria-describedby")!.split(" ");
    expect(described).toContain(getByText("Shown in the tab").id);
    expect(described).toContain(getByText("Required").id);
  });

  it("gives two unnamed fields different ids", () => {
    const { getByLabelText } = render(
      <div>
        <Input label="A" />
        <Input label="B" />
      </div>,
    );
    expect(getByLabelText("A").id).not.toBe(getByLabelText("B").id);
  });

  it("keeps a caller's aria-describedby", () => {
    const { getByLabelText } = render(
      <Input label="A" aria-describedby="other" hint="Hint" />,
    );
    expect(getByLabelText("A").getAttribute("aria-describedby")).toContain("other");
  });

  it("renders Select options and reports changes", () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(
      <Select
        label="Font"
        value="b"
        onChange={onChange}
        options={[
          { value: "a", label: "Sans" },
          { value: "b", label: "Serif" },
          { value: "c", label: "Mono", disabled: true },
        ]}
      />,
    );
    const select = getByLabelText("Font") as HTMLSelectElement;
    expect(select.value).toBe("b");
    expect((select.options[2] as HTMLOptionElement).disabled).toBe(true);
    fireEvent.change(select, { target: { value: "a" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("names Checkbox and Switch from their labels, with the right roles", () => {
    const { getByRole } = render(
      <div>
        <Checkbox label="Wrap lines" />
        <Switch label="Spellcheck" defaultChecked />
      </div>,
    );
    expect(getByRole("checkbox", { name: "Wrap lines" })).toBeTruthy();
    const toggle = getByRole("switch", { name: "Spellcheck" }) as HTMLInputElement;
    expect(toggle.checked).toBe(true);
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(false);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <form>
        <Input label="Title" hint="Hint" error="Error" />
        <Textarea label="Body" />
        <Select label="Font" options={[{ value: "a", label: "Sans" }]} />
        <Checkbox label="Wrap" />
        <Switch label="Spell" />
      </form>,
    );
    await expectNoAxeViolations(container);
  });
});

function TabsHarness({ onChange }: { onChange?: (id: string) => void }) {
  const [value, setValue] = useState("a");
  return (
    <Tabs
      label="Sections"
      value={value}
      onChange={(id) => {
        setValue(id);
        onChange?.(id);
      }}
      items={[
        { id: "a", label: "One", panel: "Panel one" },
        { id: "b", label: "Two", panel: "Panel two", disabled: true },
        { id: "c", label: "Three", panel: "Panel three" },
      ]}
    />
  );
}

describe("Tabs", () => {
  it("wires tab, panel, and a single tab stop", () => {
    const { getAllByRole, getByRole } = render(<TabsHarness />);
    const tabs = getAllByRole("tab");
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, -1, -1]);
    const panel = getByRole("tabpanel");
    expect(tabs[0]!.getAttribute("aria-controls")).toBe(panel.id);
    expect(panel.getAttribute("aria-labelledby")).toBe(tabs[0]!.id);
  });

  it("moves with arrows, skips disabled tabs, wraps, and honors Home and End", () => {
    const { getByRole, getByText } = render(<TabsHarness />);
    const one = getByRole("tab", { name: "One" });
    one.focus();
    fireEvent.keyDown(one, { key: "ArrowRight" });
    expect(getByText("Panel three")).toBeTruthy();
    expect(document.activeElement).toBe(getByRole("tab", { name: "Three" }));

    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    expect(getByText("Panel one")).toBeTruthy();

    fireEvent.keyDown(document.activeElement!, { key: "ArrowLeft" });
    expect(getByText("Panel three")).toBeTruthy();

    fireEvent.keyDown(document.activeElement!, { key: "Home" });
    expect(getByText("Panel one")).toBeTruthy();

    fireEvent.keyDown(document.activeElement!, { key: "End" });
    expect(getByText("Panel three")).toBeTruthy();
  });

  it("ignores keys that do not move", () => {
    const onChange = vi.fn();
    const { getByRole } = render(<TabsHarness onChange={onChange} />);
    fireEvent.keyDown(getByRole("tab", { name: "One" }), { key: "a" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("has no axe violations", async () => {
    const { container } = render(<TabsHarness />);
    await expectNoAxeViolations(container);
  });
});

function SegmentedHarness() {
  const [value, setValue] = useState<"s" | "l" | "d">("s");
  return (
    <SegmentedControl
      label="Mode"
      value={value}
      onChange={setValue}
      options={[
        { value: "s", label: "System" },
        { value: "l", label: "Light" },
        { value: "d", label: "Dark" },
      ]}
    />
  );
}

describe("SegmentedControl", () => {
  it("is a radio group whose arrow keys move selection and focus", () => {
    const { getByRole } = render(<SegmentedHarness />);
    expect(getByRole("radiogroup", { name: "Mode" })).toBeTruthy();
    const system = getByRole("radio", { name: "System" });
    expect(system.getAttribute("aria-checked")).toBe("true");
    system.focus();
    fireEvent.keyDown(system, { key: "ArrowRight" });
    const light = getByRole("radio", { name: "Light" });
    expect(light.getAttribute("aria-checked")).toBe("true");
    expect(document.activeElement).toBe(light);
    expect(system.tabIndex).toBe(-1);
  });

  it("has no axe violations", async () => {
    const { container } = render(<SegmentedHarness />);
    await expectNoAxeViolations(container);
  });
});

describe("Tooltip", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("has no axe violations while shown", async () => {
    vi.useRealTimers(); // axe-core schedules its own timers
    const { container, getByRole } = render(
      <Tooltip content="Saves the note">
        <button>Save</button>
      </Tooltip>,
    );
    fireEvent.focus(getByRole("button"));
    await expectNoAxeViolations(container);
  });

  it("shows at once on focus and connects through aria-describedby", () => {
    const { getByRole } = render(
      <Tooltip content="Saves the note">
        <button>Save</button>
      </Tooltip>,
    );
    const button = getByRole("button");
    fireEvent.focus(button);
    const tip = getByRole("tooltip");
    expect(tip.textContent).toBe("Saves the note");
    expect(button.getAttribute("aria-describedby")).toBe(tip.id);
    fireEvent.blur(button);
    expect(button.getAttribute("aria-describedby")).toBeNull();
  });

  it("waits for the delay on hover and cancels if the pointer leaves", () => {
    const { getByRole, queryByRole } = render(
      <Tooltip content="Tip" delay={300}>
        <button>Save</button>
      </Tooltip>,
    );
    const button = getByRole("button");
    fireEvent.mouseEnter(button);
    vi.advanceTimersByTime(299);
    expect(queryByRole("tooltip")).toBeNull();
    fireEvent.mouseLeave(button);
    vi.advanceTimersByTime(1000);
    expect(queryByRole("tooltip")).toBeNull();
  });

  it("dismisses on Escape", () => {
    const { getByRole, queryByRole } = render(
      <Tooltip content="Tip">
        <button>Save</button>
      </Tooltip>,
    );
    fireEvent.focus(getByRole("button"));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(queryByRole("tooltip")).toBeNull();
  });

  describe("hoverable (WCAG 1.4.13)", () => {
    function openByHover(delay = 300) {
      const utils = render(
        <Tooltip content="Tip" delay={delay}>
          <button>Save</button>
        </Tooltip>,
      );
      const button = utils.getByRole("button");
      fireEvent.mouseEnter(button);
      act(() => {
        vi.advanceTimersByTime(delay);
      });
      expect(utils.getByRole("tooltip")).not.toBeNull();
      return { ...utils, button };
    }

    it("survives a short gap after the pointer leaves the trigger, then closes", () => {
      const { button, queryByRole } = openByHover();
      fireEvent.mouseLeave(button);
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(queryByRole("tooltip")).not.toBeNull();
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(queryByRole("tooltip")).toBeNull();
      expect(button.getAttribute("aria-describedby")).toBeNull();
    });

    it("stays open while the pointer is on the tooltip, and closes after it leaves", () => {
      const { button, getByRole, queryByRole } = openByHover();
      fireEvent.mouseLeave(button);
      fireEvent.mouseEnter(getByRole("tooltip"));
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(queryByRole("tooltip")).not.toBeNull();
      expect(button.getAttribute("aria-describedby")).toBe(getByRole("tooltip").id);
      fireEvent.mouseLeave(getByRole("tooltip"));
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(queryByRole("tooltip")).not.toBeNull();
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(queryByRole("tooltip")).toBeNull();
    });

    it("stays open, without a second delay, when the pointer returns to the trigger", () => {
      const { button, queryByRole } = openByHover();
      fireEvent.mouseLeave(button);
      act(() => {
        vi.advanceTimersByTime(100);
      });
      fireEvent.mouseEnter(button);
      // Still shown, with no new hover delay (300 ms) to wait for.
      act(() => {
        vi.advanceTimersByTime(50);
      });
      expect(queryByRole("tooltip")).not.toBeNull();
      // The cancelled grace timer must not close it later.
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(queryByRole("tooltip")).not.toBeNull();
      fireEvent.mouseLeave(button);
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(queryByRole("tooltip")).toBeNull();
    });

    it("still dismisses on Escape while the pointer is on the tooltip", () => {
      const { button, getByRole, queryByRole } = openByHover();
      fireEvent.mouseLeave(button);
      fireEvent.mouseEnter(getByRole("tooltip"));
      fireEvent.keyDown(document, { key: "Escape" });
      expect(queryByRole("tooltip")).toBeNull();
      expect(vi.getTimerCount()).toBe(0);
    });

    it("closes at once on blur even inside the grace period", () => {
      const { button, queryByRole } = openByHover();
      fireEvent.focus(button);
      fireEvent.mouseLeave(button);
      expect(vi.getTimerCount()).toBe(1); // the grace period is running
      expect(queryByRole("tooltip")).not.toBeNull();
      fireEvent.blur(button);
      expect(queryByRole("tooltip")).toBeNull();
      expect(vi.getTimerCount()).toBe(0);
    });

    it("cancels a pending hover (not yet shown) at once, with no grace timer", () => {
      const { getByRole, queryByRole } = render(
        <Tooltip content="Tip" delay={300}>
          <button>Save</button>
        </Tooltip>,
      );
      const button = getByRole("button");
      fireEvent.mouseEnter(button);
      fireEvent.mouseLeave(button);
      expect(vi.getTimerCount()).toBe(0);
      expect(queryByRole("tooltip")).toBeNull();
    });

    it("clears a pending grace timer on unmount", () => {
      const { button, unmount } = openByHover();
      fireEvent.mouseLeave(button);
      expect(vi.getTimerCount()).toBe(1);
      unmount();
      expect(vi.getTimerCount()).toBe(0);
    });

    it("keeps the trigger's own mouse handlers", () => {
      const onMouseEnter = vi.fn();
      const onMouseLeave = vi.fn();
      const { getByRole } = render(
        <Tooltip content="Tip">
          <button onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            Save
          </button>
        </Tooltip>,
      );
      fireEvent.mouseEnter(getByRole("button"));
      fireEvent.mouseLeave(getByRole("button"));
      expect(onMouseEnter).toHaveBeenCalledTimes(1);
      expect(onMouseLeave).toHaveBeenCalledTimes(1);
    });

    it("has no axe violations while the pointer is on the tooltip", async () => {
      const { container, button, getByRole } = openByHover();
      fireEvent.mouseLeave(button);
      fireEvent.mouseEnter(getByRole("tooltip"));
      vi.useRealTimers(); // axe-core schedules its own timers
      await expectNoAxeViolations(container);
    });
  });

  describe("persistent while keyboard-focused (WCAG 1.4.13)", () => {
    // jsdom answers `:focus-visible` exactly like `:focus`, so it cannot tell a
    // click from a Tab. These tests set the answer themselves and send the
    // focus events with `fireEvent`, as the rest of this file does.
    let focusVisible = false;
    beforeEach(() => {
      focusVisible = false;
      const matches = Element.prototype.matches;
      vi.spyOn(Element.prototype, "matches").mockImplementation(function (this: Element, selector: string) {
        return selector === ":focus-visible" ? focusVisible : matches.call(this, selector);
      });
    });
    afterEach(() => vi.restoreAllMocks());

    function openByKeyboardFocus() {
      const utils = render(
        <Tooltip content="Tip" delay={300}>
          <button>Save</button>
        </Tooltip>,
      );
      const button = utils.getByRole("button");
      focusVisible = true;
      fireEvent.focus(button);
      expect(utils.getByRole("tooltip")).not.toBeNull();
      return { ...utils, button };
    }

    it("stays open after the pointer hovers the trigger and leaves", () => {
      const { button, getByRole, queryByRole } = openByKeyboardFocus();
      fireEvent.mouseEnter(button);
      fireEvent.mouseLeave(button);
      expect(vi.getTimerCount()).toBe(0); // no grace timer is started
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(queryByRole("tooltip")).not.toBeNull();
      expect(button.getAttribute("aria-describedby")).toBe(getByRole("tooltip").id);
    });

    it("stays open after the pointer rests on the tooltip and leaves it", () => {
      const { button, getByRole, queryByRole } = openByKeyboardFocus();
      fireEvent.mouseEnter(button);
      fireEvent.mouseLeave(button);
      fireEvent.mouseEnter(getByRole("tooltip"));
      fireEvent.mouseLeave(getByRole("tooltip"));
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(queryByRole("tooltip")).not.toBeNull();
    });

    it("closes on blur, even after the pointer has come and gone", () => {
      const { button, queryByRole } = openByKeyboardFocus();
      fireEvent.mouseEnter(button);
      fireEvent.mouseLeave(button);
      fireEvent.blur(button);
      expect(queryByRole("tooltip")).toBeNull();
      expect(button.getAttribute("aria-describedby")).toBeNull();
      expect(vi.getTimerCount()).toBe(0);
    });

    it("closes on Escape, and a later hover then closes after the pointer leaves", () => {
      const { button, queryByRole } = openByKeyboardFocus();
      fireEvent.mouseEnter(button);
      fireEvent.mouseLeave(button);
      fireEvent.keyDown(document, { key: "Escape" });
      expect(queryByRole("tooltip")).toBeNull();
      // Dismissed, then hovered open again: focus is still on the trigger, but
      // the tooltip it is showing now was opened by the pointer.
      fireEvent.mouseEnter(button);
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(queryByRole("tooltip")).not.toBeNull();
      fireEvent.mouseLeave(button);
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(queryByRole("tooltip")).toBeNull();
    });

    it("does not stay open after a mouse click focused the trigger", () => {
      const { getByRole, queryByRole } = render(
        <Tooltip content="Tip" delay={300}>
          <button>Save</button>
        </Tooltip>,
      );
      const button = getByRole("button");
      fireEvent.mouseEnter(button);
      focusVisible = false; // a click focuses a button without :focus-visible
      fireEvent.focus(button);
      expect(queryByRole("tooltip")).not.toBeNull();
      fireEvent.mouseLeave(button);
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(queryByRole("tooltip")).not.toBeNull(); // grace period only
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(queryByRole("tooltip")).toBeNull();
    });

    it("stays open when a click-focused trigger turns keyboard-focused before the pointer leaves", () => {
      const { getByRole, queryByRole } = render(
        <Tooltip content="Tip">
          <button>Save</button>
        </Tooltip>,
      );
      const button = getByRole("button");
      fireEvent.focus(button);
      fireEvent.mouseEnter(button);
      focusVisible = true; // the user pressed a key on the focused button
      fireEvent.mouseLeave(button);
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(queryByRole("tooltip")).not.toBeNull();
    });

    it("keeps a hover-opened tooltip subject to the grace period when focus is elsewhere", () => {
      const { getByRole, queryByRole } = render(
        <Tooltip content="Tip" delay={300}>
          <button>Save</button>
        </Tooltip>,
      );
      const button = getByRole("button");
      focusVisible = true; // some other element has keyboard focus
      fireEvent.mouseEnter(button);
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(queryByRole("tooltip")).not.toBeNull();
      fireEvent.mouseLeave(button);
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(queryByRole("tooltip")).toBeNull();
    });

    it("falls back to the grace period when the browser cannot evaluate :focus-visible", () => {
      const { button, queryByRole } = openByKeyboardFocus();
      vi.mocked(Element.prototype.matches).mockImplementation(() => {
        throw new SyntaxError("':focus-visible' is not a valid selector");
      });
      fireEvent.mouseEnter(button);
      fireEvent.mouseLeave(button);
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(queryByRole("tooltip")).toBeNull();
    });

    it("has no axe violations while kept open after the pointer left", async () => {
      const { container, button } = openByKeyboardFocus();
      fireEvent.mouseEnter(button);
      fireEvent.mouseLeave(button);
      vi.useRealTimers(); // axe-core schedules its own timers
      await expectNoAxeViolations(container);
    });
  });

  it("keeps the trigger's own handlers and renders nothing extra when disabled", () => {
    const onFocus = vi.fn();
    const { getByRole, queryByRole } = render(
      <Tooltip content="Tip" disabled>
        <button onFocus={onFocus}>Save</button>
      </Tooltip>,
    );
    fireEvent.focus(getByRole("button"));
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(queryByRole("tooltip")).toBeNull();
  });

  it("clears a pending timer on unmount", () => {
    const { getByRole, unmount } = render(
      <Tooltip content="Tip">
        <button>Save</button>
      </Tooltip>,
    );
    fireEvent.mouseEnter(getByRole("button"));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

function MenuHarness({
  onDelete,
  align,
}: {
  onDelete?: () => void;
  align?: "start" | "end";
}) {
  return (
    <Menu
      label="Note actions"
      trigger="More"
      align={align}
      items={[
        { id: "rename", label: "Rename", onSelect: () => undefined },
        {
          id: "move",
          label: "Move",
          onSelect: () => undefined,
          disabled: true,
          disabledReason: "No other folder",
        },
        {
          id: "delete",
          label: "Delete",
          onSelect: onDelete ?? (() => undefined),
          variant: "danger",
        },
      ]}
    />
  );
}

describe("Menu", () => {
  it("opens from the trigger and focuses the first enabled item", () => {
    const { getByRole } = render(<MenuHarness />);
    const trigger = getByRole("button", { name: "Note actions" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(getByRole("menuitem", { name: "Rename" }));
  });

  it("opens on ArrowUp at the last enabled item", () => {
    const { getByRole } = render(<MenuHarness />);
    fireEvent.keyDown(getByRole("button"), { key: "ArrowUp" });
    expect(document.activeElement).toBe(getByRole("menuitem", { name: "Delete" }));
  });

  // Browsers refuse focus() on anything under visibility:hidden, but jsdom does
  // not, so this emulates the rule. The menu renders hidden until it has been
  // measured and positioned; moving focus in that first pass silently did
  // nothing in Chromium and left the keyboard on the trigger.
  describe("focus while the menu is positioned", () => {
    function refuseFocusWhileHidden() {
      const nativeFocus = HTMLElement.prototype.focus;
      vi.spyOn(HTMLElement.prototype, "focus").mockImplementation(function (
        this: HTMLElement,
        options?: FocusOptions,
      ) {
        // Computed style, not the attribute text, so the emulation still
        // applies if the hiding ever moves into a class.
        if (getComputedStyle(this).visibility === "hidden") return;
        nativeFocus.call(this, options);
      });
    }

    it("moves focus to the first enabled item on click", () => {
      refuseFocusWhileHidden();
      const { getByRole } = render(<MenuHarness />);
      fireEvent.click(getByRole("button", { name: "Note actions" }));
      expect(getByRole("menu").style.visibility).toBe("visible");
      expect(document.activeElement).toBe(getByRole("menuitem", { name: "Rename" }));
    });

    it("moves focus to the last enabled item on ArrowUp", () => {
      refuseFocusWhileHidden();
      const { getByRole } = render(<MenuHarness />);
      fireEvent.keyDown(getByRole("button"), { key: "ArrowUp" });
      expect(document.activeElement).toBe(getByRole("menuitem", { name: "Delete" }));
    });

    it("moves focus in again when the menu is closed and reopened", () => {
      refuseFocusWhileHidden();
      const { getByRole, queryByRole } = render(<MenuHarness />);
      const trigger = getByRole("button", { name: "Note actions" });
      fireEvent.click(trigger);
      fireEvent.keyDown(getByRole("menu"), { key: "Escape" });
      expect(queryByRole("menu")).toBeNull();
      expect(document.activeElement).toBe(trigger);
      fireEvent.click(trigger);
      expect(document.activeElement).toBe(getByRole("menuitem", { name: "Rename" }));
    });

    it("does not pull focus back when the menu is re-positioned while open", () => {
      const { getByRole, rerender } = render(<MenuHarness align="end" />);
      fireEvent.click(getByRole("button", { name: "Note actions" }));
      const del = getByRole("menuitem", { name: "Delete" });
      del.focus();
      rerender(<MenuHarness align="start" />);
      expect(document.activeElement).toBe(del);
    });
  });

  it("arrows skip disabled items and wrap; Home and End jump", () => {
    const { getByRole } = render(<MenuHarness />);
    fireEvent.click(getByRole("button"));
    const menu = getByRole("menu");
    const rename = getByRole("menuitem", { name: "Rename" });
    const del = getByRole("menuitem", { name: "Delete" });
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(document.activeElement).toBe(del);
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(document.activeElement).toBe(rename);
    fireEvent.keyDown(menu, { key: "End" });
    expect(document.activeElement).toBe(del);
    fireEvent.keyDown(menu, { key: "Home" });
    expect(document.activeElement).toBe(rename);
  });

  it("Escape closes and returns focus to the trigger", () => {
    const { getByRole, queryByRole } = render(<MenuHarness />);
    const trigger = getByRole("button");
    fireEvent.click(trigger);
    fireEvent.keyDown(getByRole("menu"), { key: "Escape" });
    expect(queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("selects, closes, and connects a disabled item's reason", () => {
    const onDelete = vi.fn();
    const { getByRole, getByText, queryByRole } = render(
      <MenuHarness onDelete={onDelete} />,
    );
    fireEvent.click(getByRole("button"));
    const move = getByRole("menuitem", { name: /Move/ });
    expect(move.getAttribute("aria-describedby")).toBe(
      getByText("No other folder").id,
    );
    fireEvent.click(getByRole("menuitem", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(queryByRole("menu")).toBeNull();
  });

  it("closes on an outside pointer press without stealing focus back", async () => {
    const { getByRole, queryByRole } = render(<MenuHarness />);
    // act flushes the effect that installs the outside listener.
    await act(async () => {
      fireEvent.click(getByRole("button"));
    });
    await act(async () => {
      // jsdom has no PointerEvent, so fireEvent.pointerDown dispatches nothing.
      fireEvent(document.body, new Event("pointerdown", { bubbles: true }));
    });
    expect(queryByRole("menu")).toBeNull();
    expect(document.activeElement).not.toBe(getByRole("button"));
  });

  it("does not open with no items", () => {
    const { getByRole } = render(<Menu label="Empty" trigger="More" items={[]} />);
    expect((getByRole("button") as HTMLButtonElement).disabled).toBe(true);
  });

  it("has no axe violations while open", async () => {
    const { getByRole, container } = render(<MenuHarness />);
    fireEvent.click(getByRole("button"));
    await expectNoAxeViolations(container);
  });
});

// WAI-ARIA menu button pattern: typing characters moves focus to the next item
// whose name starts with them.
describe("Menu typeahead", () => {
  const noop = () => undefined;
  function TypeaheadHarness({ labels }: { labels?: readonly string[] } = {}) {
    const names = labels ?? ["Archive", "Duplicate", "Delete", "Draft (locked)", "Rename"];
    return (
      <Menu
        label="Note actions"
        trigger="More"
        items={names.map((name) => ({
          id: name,
          label: name,
          onSelect: noop,
          disabled: name === "Draft (locked)",
          disabledReason: name === "Draft (locked)" ? "Locked by another user" : undefined,
        }))}
      />
    );
  }

  function openMenu() {
    const view = render(<TypeaheadHarness />);
    fireEvent.click(view.getByRole("button", { name: "Note actions" }));
    return view;
  }
  function type(key: string, init: KeyboardEventInit = {}): boolean {
    return fireEvent.keyDown(document.activeElement as HTMLElement, { key, ...init });
  }
  function activeName(): string | undefined {
    return document.activeElement?.textContent ?? undefined;
  }

  beforeEach(() => vi.useFakeTimers({ toFake: ["Date"] }));
  afterEach(() => vi.useRealTimers());

  it("moves focus to the next item whose name starts with the typed letter", () => {
    openMenu();
    expect(activeName()).toBe("Archive");
    type("r");
    expect(activeName()).toBe("Rename");
  });

  it("is case-insensitive (Shift+letter)", () => {
    openMenu();
    type("R", { shiftKey: true });
    expect(activeName()).toBe("Rename");
  });

  it("cycles through items with the same first letter and wraps", () => {
    openMenu();
    type("d");
    expect(activeName()).toBe("Duplicate");
    vi.advanceTimersByTime(600);
    type("d");
    expect(activeName()).toBe("Delete");
    vi.advanceTimersByTime(600);
    type("d");
    // "Draft (locked)" is disabled and skipped, so the cycle wraps to Duplicate.
    expect(activeName()).toBe("Duplicate");
  });

  it("treats the same letter pressed in quick succession as a cycle, not a prefix", () => {
    openMenu();
    type("d");
    type("d");
    expect(activeName()).toBe("Delete");
    type("d");
    expect(activeName()).toBe("Duplicate");
  });

  it("matches a prefix typed in quick succession", () => {
    openMenu();
    type("d");
    type("e");
    type("l");
    expect(activeName()).toBe("Delete");
  });

  it("restarts the wait on every key, so a slow but steady typist is not cut off", () => {
    const view = render(<TypeaheadHarness labels={["Archive", "Delete", "Lock"]} />);
    fireEvent.click(view.getByRole("button", { name: "Note actions" }));
    type("d");
    vi.advanceTimersByTime(300);
    type("e");
    vi.advanceTimersByTime(300);
    type("l");
    // 600 ms since the first key, 300 since the last: still the one search "del".
    // Taken as a fresh "l" it would have moved on to "Lock".
    expect(activeName()).toBe("Delete");
  });

  it("ends a search at 500 ms after the last key, not before", () => {
    const view = render(<TypeaheadHarness labels={["Archive", "Delete", "Edit"]} />);
    fireEvent.click(view.getByRole("button", { name: "Note actions" }));
    type("d");
    expect(activeName()).toBe("Delete");
    vi.advanceTimersByTime(499);
    type("e");
    // Still "de": stays on Delete.
    expect(activeName()).toBe("Delete");
    vi.advanceTimersByTime(500);
    // A fresh "e", not "dee": lands on Edit.
    type("e");
    expect(activeName()).toBe("Edit");
  });

  it("matches the item's label, not other text inside the item", () => {
    const view = render(
      <Menu
        label="Note actions"
        trigger="More"
        items={[
          { id: "a", label: "Archive", icon: <span>{"\u2605"}</span>, onSelect: noop },
          { id: "r", label: "Rename", icon: <span>{"\u2606"}</span>, onSelect: noop },
        ]}
      />,
    );
    fireEvent.click(view.getByRole("button", { name: "Note actions" }));
    type("\u2606");
    expect(activeName()).toContain("Archive");
    vi.advanceTimersByTime(600);
    type("r");
    expect(activeName()).toContain("Rename");
  });

  it("follows the items when they change while the menu is open", () => {
    const view = render(<TypeaheadHarness labels={["Archive", "Rename"]} />);
    fireEvent.click(view.getByRole("button", { name: "Note actions" }));
    view.rerender(<TypeaheadHarness labels={["Archive", "Pin", "Share"]} />);
    type("s");
    expect(activeName()).toBe("Share");
  });

  it("forgets what was typed after a pause", () => {
    openMenu();
    type("d");
    type("e");
    expect(activeName()).toBe("Delete");
    vi.advanceTimersByTime(501);
    // A fresh "r", not the prefix "der", which would match nothing.
    type("r");
    expect(activeName()).toBe("Rename");
  });

  it("never lands on a disabled item", () => {
    openMenu();
    type("d");
    type("r");
    type("a");
    // "dra" would be the disabled "Draft (locked)": focus stays where it was.
    expect(activeName()).toBe("Duplicate");
  });

  it("leaves focus where it is when nothing matches", () => {
    openMenu();
    type("z");
    expect(activeName()).toBe("Archive");
  });

  it("consumes the characters it reads, so a host's own shortcut does not also fire", () => {
    const hostShortcut = vi.fn();
    document.addEventListener("keydown", hostShortcut);
    try {
      openMenu();
      const notPrevented = type("r");
      expect(notPrevented).toBe(false);
      expect(hostShortcut).not.toHaveBeenCalled();
      // Also when nothing matches: the key press still belongs to the menu.
      expect(type("z")).toBe(false);
      expect(hostShortcut).not.toHaveBeenCalled();
    } finally {
      document.removeEventListener("keydown", hostShortcut);
    }
  });

  it("ignores Ctrl, Alt and Meta chords, which belong to the browser and the host", () => {
    openMenu();
    for (const chord of [{ ctrlKey: true }, { altKey: true }, { metaKey: true }]) {
      const notPrevented = type("r", chord);
      expect(notPrevented).toBe(true);
      expect(activeName()).toBe("Archive");
    }
  });

  it("does not read Ctrl+Alt unless the platform also says AltGraph is down", () => {
    openMenu();
    expect(type("r", { ctrlKey: true, altKey: true })).toBe(true);
    expect(activeName()).toBe("Archive");
  });

  // On Windows AltGr is reported as Ctrl+Alt; a Polish or Czech layout types
  // letters with it, so those must still count as typing.
  it("reads a character typed with AltGraph, which Windows reports as Ctrl+Alt", () => {
    const view = render(<TypeaheadHarness labels={["Archive", "ą first", "Other"]} />);
    fireEvent.click(view.getByRole("button", { name: "Note actions" }));
    type("ą", { ctrlKey: true, altKey: true, modifierAltGraph: true });
    expect(activeName()).toBe("ą first");
  });

  it("leaves keys an input method is composing to the input method", () => {
    openMenu();
    type("r", { isComposing: true });
    expect(activeName()).toBe("Archive");
    type("r", { keyCode: 229 });
    expect(activeName()).toBe("Archive");
  });

  it("does not read named keys (Shift, F1, Enter, ArrowLeft, Backspace) as characters", () => {
    openMenu();
    for (const key of ["Shift", "F1", "Enter", "ArrowLeft", "Backspace", "Dead", "Unidentified"]) {
      expect(type(key), key).toBe(true);
      expect(activeName(), key).toBe("Archive");
    }
  });

  it("matches non-ASCII letters", () => {
    const view = render(<TypeaheadHarness labels={["Archivieren", "Öffnen", "Löschen"]} />);
    fireEvent.click(view.getByRole("button", { name: "Note actions" }));
    type("ö");
    expect(activeName()).toBe("Öffnen");
    vi.advanceTimersByTime(600);
    type("L");
    expect(activeName()).toBe("Löschen");
  });

  it("starts matching after the focused item, whichever way focus got there", () => {
    openMenu();
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: "End" });
    expect(activeName()).toBe("Rename");
    type("d");
    // After Rename, wrapping to the first D.
    expect(activeName()).toBe("Duplicate");
  });

  it("forgets what was typed when the menu closes and reopens", () => {
    const view = openMenu();
    type("d");
    type("e");
    expect(activeName()).toBe("Delete");
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Escape" });
    fireEvent.click(view.getByRole("button", { name: "Note actions" }));
    // Reopened within the pause window: "e" must not extend the old "de".
    type("r");
    expect(activeName()).toBe("Rename");
  });

  describe("Space", () => {
    const saveLabels = ["Archive", "Save", "Save as copy", "Save as template"];
    function openSaveMenu() {
      const view = render(<TypeaheadHarness labels={saveLabels} />);
      fireEvent.click(view.getByRole("button", { name: "Note actions" }));
      for (const key of "save") type(key);
      expect(activeName()).toBe("Save");
    }
    const keyUp = () => fireEvent.keyUp(document.activeElement as HTMLElement, { key: " " });

    it("still activates the focused item when nothing is being typed", () => {
      openMenu();
      expect(type(" ")).toBe(true);
      expect(keyUp()).toBe(true);
    });

    it("is part of the search while something starts with the text so far, and does not activate", () => {
      openSaveMenu();
      expect(type(" ")).toBe(false);
      expect(activeName()).toBe("Save as copy");
      // The key-up that would click a native button is cancelled too (Firefox
      // fires the click from keyup even when keydown was prevented).
      expect(keyUp()).toBe(false);
      for (const key of "as ") type(key);
      type("t");
      expect(activeName()).toBe("Save as template");
    });

    it("still activates the item a search just landed on when no label continues with a space", () => {
      openMenu();
      type("d");
      expect(activeName()).toBe("Duplicate");
      // "d " starts nothing, so this is the activation key, not more typing.
      expect(type(" ")).toBe(true);
      expect(keyUp()).toBe(true);
    });

    it("activates again once the pause has ended", () => {
      openSaveMenu();
      vi.advanceTimersByTime(600);
      expect(type(" ")).toBe(true);
      expect(keyUp()).toBe(true);
    });

    // Fast typists press the next key before releasing the last: the Space
    // key-up then arrives after another keydown and lands on the item that key
    // just focused. It must still be cancelled, or Firefox clicks that item.
    it("cancels the key-up of a consumed Space even when another key went down first", () => {
      openSaveMenu();
      expect(type(" ")).toBe(false);
      type("a");
      expect(keyUp()).toBe(false);
      // And only that one key-up.
      expect(keyUp()).toBe(true);
    });

    it("keeps taking a held Space's repeats once the first press was the search's", () => {
      openSaveMenu();
      expect(type(" ")).toBe(false);
      expect(type(" ", { repeat: true })).toBe(false);
      expect(keyUp()).toBe(false);
    });

    it("does not let a key-up that never came swallow a later Space activation", () => {
      openSaveMenu();
      expect(type(" ")).toBe(false);
      // No key-up (focus left the window); later a plain Space press activates.
      vi.advanceTimersByTime(600);
      expect(type(" ")).toBe(true);
      expect(keyUp()).toBe(true);
    });
  });

  it("activates the item the search landed on", () => {
    const onSelect = vi.fn();
    const { getByRole } = render(
      <Menu
        label="Note actions"
        trigger="More"
        items={[
          { id: "a", label: "Archive", onSelect: noop },
          { id: "r", label: "Rename", onSelect },
        ]}
      />,
    );
    fireEvent.click(getByRole("button", { name: "Note actions" }));
    type("r");
    // Enter and Space on a native button are clicks; jsdom does not synthesise them.
    (document.activeElement as HTMLElement).click();
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("has no axe violations after typing", async () => {
    const { container } = openMenu();
    type("r");
    await expectNoAxeViolations(container);
  });
});

describe("Dialog", () => {
  afterEach(() => resetOverlayStackForTests());

  it("is modal, named, described, and takes focus", () => {
    const { getByRole } = render(
      <Dialog
        title="Delete note"
        description="This cannot be undone."
        onDismiss={() => undefined}
        actions={<Button>Cancel</Button>}
      />,
    );
    const dialog = getByRole("dialog", { name: "Delete note" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-describedby")).toBeTruthy();
    expect(document.activeElement).toBe(getByRole("button", { name: "Cancel" }));
  });

  it("traps Tab in both directions", () => {
    const { getByRole } = render(
      <Dialog
        title="T"
        onDismiss={() => undefined}
        actions={
          <>
            <Button>First</Button>
            <Button>Last</Button>
          </>
        }
      />,
    );
    const first = getByRole("button", { name: "First" });
    const last = getByRole("button", { name: "Last" });
    last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it("focuses the surface itself when nothing inside can take focus", () => {
    const { getByRole } = render(<Dialog title="T" onDismiss={() => undefined} />);
    expect(document.activeElement).toBe(getByRole("dialog"));
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(getByRole("dialog"));
  });

  it("restores focus on unmount and releases the scroll lock", () => {
    const opener = document.createElement("button");
    document.body.appendChild(opener);
    opener.focus();
    const { unmount } = render(<Dialog title="T" onDismiss={() => undefined} />);
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.activeElement).toBe(opener);
    expect(document.body.style.overflow).toBe("");
  });

  it("reports Escape and backdrop, and honors both opt-outs", () => {
    const onDismiss = vi.fn();
    const { rerender, container } = render(
      <Dialog title="T" onDismiss={onDismiss} />,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onDismiss).toHaveBeenLastCalledWith("escape");
    const backdrop = container.querySelector(".ds-dialog-backdrop")!;
    fireEvent.mouseDown(backdrop);
    expect(onDismiss).toHaveBeenLastCalledWith("backdrop");

    onDismiss.mockClear();
    rerender(
      <Dialog
        title="T"
        onDismiss={onDismiss}
        closeOnEscape={false}
        closeOnBackdrop={false}
      />,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.mouseDown(backdrop);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("dismisses only the topmost of two stacked dialogs", () => {
    const lower = vi.fn();
    const upper = vi.fn();
    render(
      <div>
        <Dialog title="Lower" onDismiss={lower} />
        <Dialog title="Upper" onDismiss={upper} />
      </div>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(upper).toHaveBeenCalledWith("escape");
    expect(lower).not.toHaveBeenCalled();
  });

  it("lets a host's back gesture reach the top overlay through the stack", () => {
    const pushed = vi.fn();
    onOverlayPush(pushed);
    const onDismiss = vi.fn();
    expect(dismissTopOverlay("backbutton")).toBe(false);
    render(<Dialog title="T" onDismiss={onDismiss} />);
    expect(pushed).toHaveBeenCalledTimes(1);
    expect(dismissTopOverlay("backbutton")).toBe(true);
    expect(onDismiss).toHaveBeenCalledWith("backbutton");
  });

  it("supports alertdialog", () => {
    const { getByRole } = render(
      <Dialog title="T" role="alertdialog" onDismiss={() => undefined} />,
    );
    expect(getByRole("alertdialog", { name: "T" })).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <Dialog title="Title" description="Desc" onDismiss={() => undefined}>
        <Input label="Name" />
      </Dialog>,
    );
    await expectNoAxeViolations(container);
  });
});

describe("ToastRegion", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("has no axe violations", async () => {
    vi.useRealTimers(); // axe-core schedules its own timers
    const { container } = render(
      <ToastRegion
        onDismiss={() => undefined}
        toasts={[
          { id: "a", message: "Saved", tone: "success" },
          { id: "b", message: "Write failed", tone: "danger" },
        ]}
      />,
    );
    await expectNoAxeViolations(container);
  });

  it("announces errors as alerts and the rest as status", () => {
    const { getByRole } = render(
      <ToastRegion
        onDismiss={() => undefined}
        toasts={[
          { id: "a", message: "Saved", tone: "success" },
          { id: "b", message: "Write failed", tone: "danger" },
        ]}
      />,
    );
    expect(getByRole("status").textContent).toContain("Saved");
    expect(getByRole("alert").textContent).toContain("Write failed");
  });

  it("dismisses after its duration, and not before", () => {
    const onDismiss = vi.fn();
    render(
      <ToastRegion
        onDismiss={onDismiss}
        toasts={[{ id: "a", message: "Saved", duration: 1000 }]}
      />,
    );
    vi.advanceTimersByTime(999);
    expect(onDismiss).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onDismiss).toHaveBeenCalledWith("a");
  });

  it("stays without a duration, and the button closes it", () => {
    const onDismiss = vi.fn();
    const { getByRole } = render(
      <ToastRegion onDismiss={onDismiss} toasts={[{ id: "a", message: "Hi" }]} />,
    );
    vi.advanceTimersByTime(100000);
    expect(onDismiss).not.toHaveBeenCalled();
    fireEvent.click(getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledWith("a");
  });

  it("pauses the timer while hovered", () => {
    const onDismiss = vi.fn();
    const { getByRole } = render(
      <ToastRegion
        onDismiss={onDismiss}
        toasts={[{ id: "a", message: "Saved", duration: 1000 }]}
      />,
    );
    fireEvent.mouseEnter(getByRole("status"));
    vi.advanceTimersByTime(5000);
    expect(onDismiss).not.toHaveBeenCalled();
    fireEvent.mouseLeave(getByRole("status"));
    vi.advanceTimersByTime(1000);
    expect(onDismiss).toHaveBeenCalledWith("a");
  });

  // Hover and focus are independent reasons to hold a toast (WCAG 2.2.1): the
  // pointer leaving must not resume the timer under a keyboard user who is still
  // on the toast, and focus leaving must not resume it under a hovering pointer.
  it("stays paused while focus is inside, even after the pointer enters and leaves", () => {
    const onDismiss = vi.fn();
    const { getByRole } = render(
      <ToastRegion
        onDismiss={onDismiss}
        toasts={[{ id: "a", message: "Saved", duration: 1000 }]}
      />,
    );
    const toast = getByRole("status");
    const dismiss = getByRole("button", { name: "Dismiss" });
    fireEvent.focusIn(dismiss);
    fireEvent.mouseEnter(toast);
    fireEvent.mouseLeave(toast);
    vi.advanceTimersByTime(5000);
    expect(onDismiss).not.toHaveBeenCalled();
    fireEvent.focusOut(dismiss);
    vi.advanceTimersByTime(1000);
    expect(onDismiss).toHaveBeenCalledWith("a");
  });

  it("stays paused while hovered, even after focus leaves", () => {
    const onDismiss = vi.fn();
    const { getByRole } = render(
      <ToastRegion
        onDismiss={onDismiss}
        toasts={[{ id: "a", message: "Saved", duration: 1000 }]}
      />,
    );
    const toast = getByRole("status");
    const dismiss = getByRole("button", { name: "Dismiss" });
    fireEvent.mouseEnter(toast);
    fireEvent.focusIn(dismiss);
    fireEvent.focusOut(dismiss);
    vi.advanceTimersByTime(5000);
    expect(onDismiss).not.toHaveBeenCalled();
    fireEvent.mouseLeave(toast);
    vi.advanceTimersByTime(1000);
    expect(onDismiss).toHaveBeenCalledWith("a");
  });

  it("stays paused while focus moves between controls inside the toast", () => {
    const onDismiss = vi.fn();
    const { getByRole } = render(
      <ToastRegion
        onDismiss={onDismiss}
        toasts={[
          {
            id: "a",
            message: <a href="#undo">Undo</a>,
            duration: 1000,
          },
        ]}
      />,
    );
    const link = getByRole("link", { name: "Undo" });
    const dismiss = getByRole("button", { name: "Dismiss" });
    fireEvent.focusIn(link);
    fireEvent.focusOut(link, { relatedTarget: dismiss });
    fireEvent.focusIn(dismiss);
    vi.advanceTimersByTime(5000);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("keeps the region mounted while empty, so later toasts are announced", () => {
    const { getByRole } = render(<ToastRegion onDismiss={() => undefined} toasts={[]} />);
    expect(getByRole("region", { name: "Notifications" })).toBeTruthy();
  });
});

describe("Badge, Card, EmptyState", () => {
  it("render their content", () => {
    const { getByText, getByRole } = render(
      <div>
        <Badge tone="success">Synced</Badge>
        <Card title="Recent" raised>
          Body
        </Card>
        <EmptyState title="No notes" description="Create one" />
      </div>,
    );
    expect(getByText("Synced").className).toContain("ds-badge-success");
    expect(getByRole("heading", { name: "Recent" })).toBeTruthy();
    expect(getByText("No notes")).toBeTruthy();
  });

  it("have no axe violations", async () => {
    const { container } = render(
      <main>
        <Badge>One</Badge>
        <Card title="Recent">Body</Card>
        <EmptyState title="None" />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});

describe("Icon", () => {
  it.each([...ICON_NAMES])("%s renders a decorative svg, or a named image with a title", (name) => {
    const plain = render(<Icon name={name} />);
    const svg = plain.container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    plain.unmount();
    const named = render(<Icon name={name} title="Label" size={24} />);
    const titled = named.container.querySelector("svg");
    expect(titled?.hasAttribute("aria-hidden")).toBe(false);
    expect(named.getByRole("img", { name: "Label" })).toBeTruthy();
    expect(titled?.getAttribute("width")).toBe("24");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        <Icon name="check" />
        <Icon name="search" title="Search" />
      </div>,
    );
    await expectNoAxeViolations(container);
  });
});

describe("StatusIndicator", () => {
  it("keeps the text visible and adds an icon per variant", () => {
    const { getByText, container } = render(<StatusIndicator variant="success">Saved</StatusIndicator>);
    expect(getByText("Saved")).toBeTruthy();
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelector(".ds-status-success")).not.toBeNull();
  });

  it("maps live to a role and shows a spinner while in progress", () => {
    const { getByRole, container } = render(
      <div>
        <StatusIndicator live="assertive" variant="danger">Failed</StatusIndicator>
        <StatusIndicator live="polite" variant="progress">Syncing</StatusIndicator>
      </div>,
    );
    expect(getByRole("alert").textContent).toBe("Failed");
    const status = getByRole("status");
    expect(status.getAttribute("aria-busy")).toBe("true");
    expect(status.querySelector(".ds-spinner")).not.toBeNull();
    expect(container.querySelectorAll("svg").length).toBe(2);
  });

  it("can drop the icon and has no axe violations", async () => {
    const { container } = render(
      <div>
        <StatusIndicator icon={false} variant="warning">Careful</StatusIndicator>
        <StatusIndicator variant="neutral" size="sm">Idle</StatusIndicator>
        <StatusIndicator variant="danger" live="assertive">Failed</StatusIndicator>
      </div>,
    );
    expect(container.querySelector(".ds-status-warning svg")).toBeNull();
    await expectNoAxeViolations(container);
  });
});

describe("EmptyState slots", () => {
  it("is a labelled region with bounded primary and secondary actions", async () => {
    const { getByRole, container } = render(
      <EmptyState
        size="sm"
        title="No notes"
        description="Create one"
        icon={<Icon name="fileText" />}
        primaryAction={<Button variant="primary">Create</Button>}
        secondaryAction={<Button>Import</Button>}
      />,
    );
    const region = getByRole("region", { name: "No notes" });
    expect(region.className).toContain("ds-empty-sm");
    expect(region.getAttribute("aria-describedby")).toBeTruthy();
    expect(container.querySelectorAll(".ds-empty-actions button").length).toBe(2);
    await expectNoAxeViolations(container);
  });
});

describe("Sheet", () => {
  afterEach(() => resetOverlayStackForTests());

  it("is a bottom anchored modal with a close control that dismisses it", () => {
    const onDismiss = vi.fn();
    const { getByRole } = render(
      <Sheet title="Filters" description="Narrow the list" onDismiss={onDismiss}>
        <p>Body</p>
      </Sheet>,
    );
    const dialog = getByRole("dialog", { name: "Filters" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.className).toContain("ds-sheet");
    fireEvent.click(getByRole("button", { name: "Close" }));
    expect(onDismiss).toHaveBeenCalledWith("close-button");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onDismiss).toHaveBeenCalledWith("escape");
  });

  it("can hide the close control and keeps focus inside", () => {
    const { getByRole, queryByRole } = render(
      <Sheet title="Pick" showCloseButton={false} onDismiss={() => {}} actions={<Button>Done</Button>} />,
    );
    expect(queryByRole("button", { name: "Close" })).toBeNull();
    expect(document.activeElement).toBe(getByRole("button", { name: "Done" }));
  });

  it("has no axe violations", async () => {
    const { baseElement } = render(
      <Sheet title="Filters" description="Narrow" onDismiss={() => {}} actions={<Button>Apply</Button>}>
        <p>Body</p>
      </Sheet>,
    );
    await expectNoAxeViolations(baseElement);
  });
});

describe("IconButton toggle semantics", () => {
  it("is a plain button unless the host says it is a toggle", () => {
    const { getByRole } = render(<IconButton icon={icon} label="Close" />);
    expect(getByRole("button", { name: "Close" }).hasAttribute("aria-pressed")).toBe(false);
  });

  it("reports an explicit false as a toggle that is off", () => {
    const { getByRole } = render(<IconButton icon={icon} label="Bold" active={false} />);
    const button = getByRole("button", { name: "Bold" });
    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(button.className).not.toContain("ds-icon-btn-active");
  });

  it("keeps the Sheet close control out of the toggle role", () => {
    const { getByRole } = render(<Sheet title="Filters" onDismiss={() => {}} />);
    expect(getByRole("button", { name: "Close" }).hasAttribute("aria-pressed")).toBe(false);
  });
});

describe("Dialog focus trap", () => {
  afterEach(() => resetOverlayStackForTests());

  const tab = (shiftKey = false) =>
    fireEvent.keyDown(document, { key: "Tab", shiftKey });
  const options = [
    { value: "a", label: "A" },
    { value: "b", label: "B" },
  ];

  it("ignores roving tabindex=-1 options when it finds the last tab stop", () => {
    const { getByRole } = render(
      <Dialog title="T" onDismiss={() => {}}>
        <Button>Before</Button>
        <SegmentedControl label="View" options={options} value="a" onChange={() => {}} />
      </Dialog>,
    );
    const before = getByRole("button", { name: "Before" });
    const a = getByRole("radio", { name: "A" });
    a.focus();
    expect(tab()).toBe(false); // wrapped by the trap, not left to the browser
    expect(document.activeElement).toBe(before);
    expect(tab(true)).toBe(false);
    expect(document.activeElement).toBe(a); // B (tabindex -1) is not a tab stop
  });

  it("does not start on a tabindex=-1 element", () => {
    const { getByRole } = render(
      <Dialog title="T" onDismiss={() => {}}>
        <button type="button" tabIndex={-1}>Skip</button>
        <Button>Take</Button>
      </Dialog>,
    );
    expect(document.activeElement).toBe(getByRole("button", { name: "Take" }));
  });

  it("skips hidden inputs and anything inside [hidden] or [inert]", () => {
    const { getByRole } = render(
      <Dialog title="T" onDismiss={() => {}}>
        <Button>Real</Button>
        <div hidden>
          <button type="button">Ghost</button>
        </div>
        <div inert={true}>
          <button type="button">Inert</button>
        </div>
        <input type="hidden" name="token" value="x" />
      </Dialog>,
    );
    const real = getByRole("button", { name: "Real" });
    expect(document.activeElement).toBe(real);
    expect(tab()).toBe(false);
    expect(document.activeElement).toBe(real);
    expect(tab(true)).toBe(false);
    expect(document.activeElement).toBe(real);
  });

  it("wraps Shift+Tab to the last stop when the dialog surface itself has focus", () => {
    const { getByRole } = render(
      <Dialog title="T" onDismiss={() => {}} actions={<><Button>One</Button><Button>Two</Button></>} />,
    );
    getByRole("dialog").focus();
    expect(tab(true)).toBe(false);
    expect(document.activeElement).toBe(getByRole("button", { name: "Two" }));
    getByRole("dialog").focus();
    // Forward Tab from the surface reaches the first stop natively.
    expect(tab()).toBe(true);
  });

  it("leaves Tab to the browser from a non-stop that still has a stop after it", () => {
    const { getByRole } = render(
      <Dialog title="T" onDismiss={() => {}}>
        <button type="button" tabIndex={-1}>Roving</button>
        <Button>After</Button>
      </Dialog>,
    );
    getByRole("button", { name: "Roving" }).focus();
    expect(tab()).toBe(true); // the browser moves on to "After"
    expect(tab(true)).toBe(false); // nothing before it: wrap to the last stop
    expect(document.activeElement).toBe(getByRole("button", { name: "After" }));
  });

  it("still traps when the host mounts it under an aria-hidden ancestor", () => {
    const host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    document.body.appendChild(host);
    const { getByText } = render(
      <Dialog title="T" onDismiss={() => {}} actions={<><Button>First</Button><Button>Last</Button></>} />,
      { container: host },
    );
    // getByText, because Testing Library hides aria-hidden subtrees from getByRole.
    getByText("Last").focus();
    expect(tab()).toBe(false);
    expect(document.activeElement).toBe(getByText("First"));
  });
});

// A browser cannot focus a control that CSS takes out of rendering, so such a
// control must not count as the first or last tab stop: when it did, Tab or
// Shift+Tab at the real edge was left to the browser and left the modal (WCAG
// 2.4.3). `checkVisibility` is how the trap asks; jsdom has none, so these tests
// install a stand-in that follows the spec, and the last block runs without it.
describe("Dialog focus trap and CSS-hidden controls", () => {
  let restoreCheckVisibility: () => void;
  beforeEach(() => {
    restoreCheckVisibility = installCheckVisibilityStub();
  });
  afterEach(() => {
    restoreCheckVisibility();
    resetOverlayStackForTests();
  });

  const tab = (shiftKey = false) =>
    fireEvent.keyDown(document, { key: "Tab", shiftKey });

  it("wraps at the last visible control when a display:none control follows it", () => {
    const { getByRole } = render(
      <Dialog title="T" onDismiss={() => {}}>
        <Button>First</Button>
        <Button>Visible</Button>
        <div style="display: none">
          <button type="button">Ghost</button>
        </div>
      </Dialog>,
    );
    const first = getByRole("button", { name: "First" });
    const visible = getByRole("button", { name: "Visible" });
    visible.focus();
    expect(tab()).toBe(false); // wrapped by the trap, not left to the browser
    expect(document.activeElement).toBe(first);
    expect(tab(true)).toBe(false);
    expect(document.activeElement).toBe(visible);
  });

  it("starts on, and wraps to, the first visible control when a hidden one precedes it", () => {
    const { getByRole } = render(
      <Dialog title="T" onDismiss={() => {}}>
        <div style="display: none">
          <button type="button">Ghost</button>
        </div>
        <Button>One</Button>
        <Button>Two</Button>
      </Dialog>,
    );
    const one = getByRole("button", { name: "One" });
    const two = getByRole("button", { name: "Two" });
    expect(document.activeElement).toBe(one); // not skipped for a ghost
    expect(tab(true)).toBe(false);
    expect(document.activeElement).toBe(two);
    expect(tab()).toBe(false);
    expect(document.activeElement).toBe(one);
  });

  it("skips a control whose own visibility is hidden, and one under a hidden ancestor", () => {
    const { getByRole } = render(
      <Dialog title="T" onDismiss={() => {}}>
        <input aria-label="Ghost own" style="visibility: hidden" />
        <Button>Real</Button>
        <div style="visibility: hidden">
          <button type="button">Ghost inherited</button>
        </div>
      </Dialog>,
    );
    const real = getByRole("button", { name: "Real" });
    expect(document.activeElement).toBe(real);
    expect(tab()).toBe(false);
    expect(document.activeElement).toBe(real);
    expect(tab(true)).toBe(false);
    expect(document.activeElement).toBe(real);
  });

  it("keeps a visible control inside a visibility:hidden ancestor as a stop", () => {
    const { getByRole } = render(
      <Dialog title="T" onDismiss={() => {}}>
        <Button>Before</Button>
        <div style="visibility: hidden">
          <button type="button" style="visibility: visible">
            Shown
          </button>
        </div>
      </Dialog>,
    );
    const shown = getByRole("button", { name: "Shown", hidden: true });
    shown.focus();
    expect(tab()).toBe(false); // it is the last stop
    expect(document.activeElement).toBe(getByRole("button", { name: "Before" }));
    expect(tab(true)).toBe(false);
    expect(document.activeElement).toBe(shown);
  });

  it("does not skip a transparent or off-screen control", () => {
    const { getByRole } = render(
      <Dialog title="T" onDismiss={() => {}}>
        <Button>First</Button>
        <button type="button" style="opacity: 0">
          Transparent
        </button>
        <a href="#main" style="position: absolute; left: -9999px">
          Skip
        </a>
      </Dialog>,
    );
    const skip = getByRole("link", { name: "Skip" });
    skip.focus();
    expect(tab()).toBe(false);
    expect(document.activeElement).toBe(getByRole("button", { name: "First" }));
    expect(tab(true)).toBe(false);
    expect(document.activeElement).toBe(skip);
  });

  it("asks only about display and visibility, never opacity or content-visibility", () => {
    const spy = vi.fn(() => true);
    Object.defineProperty(Element.prototype, "checkVisibility", {
      configurable: true,
      writable: true,
      value: spy,
    });
    const { container } = render(
      <Dialog title="T" onDismiss={() => {}}>
        <Button>One</Button>
      </Dialog>,
    );
    const surface = container.ownerDocument.querySelector<HTMLElement>(
      '[role="dialog"]',
    )!;
    expect(spy).toHaveBeenCalled();
    spy.mockClear();
    focusableElements(surface);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({
      checkVisibilityCSS: true,
      visibilityProperty: true,
    });
  });

  it("counts the summary of a <details> as a stop and the content of a closed one as none", () => {
    const { getByRole, getByText } = render(
      <Dialog title="T" onDismiss={() => {}}>
        <Button>Before</Button>
        <details>
          <summary>More</summary>
          <button type="button">Inner</button>
        </details>
      </Dialog>,
    );
    const before = getByRole("button", { name: "Before" });
    const summary = getByText("More");
    expect(document.activeElement).toBe(before);
    expect(tab()).toBe(true); // the summary comes after it: the browser moves on
    summary.focus();
    expect(tab()).toBe(false); // the summary is the last stop; Inner is hidden
    expect(document.activeElement).toBe(before);
    expect(tab(true)).toBe(false); // Shift+Tab from the first stop reaches it
    expect(document.activeElement).toBe(summary);
  });

  it("counts the summary and the content of an open <details>", () => {
    const { getByRole, getByText } = render(
      <Dialog title="T" onDismiss={() => {}}>
        <Button>Before</Button>
        <details open>
          <summary>More</summary>
          <button type="button">Inner</button>
        </details>
      </Dialog>,
    );
    const inner = getByRole("button", { name: "Inner" });
    getByText("More").focus();
    expect(tab()).toBe(true); // Inner is still ahead
    inner.focus();
    expect(tab()).toBe(false);
    expect(document.activeElement).toBe(getByRole("button", { name: "Before" }));
  });

  it("treats only the first <summary> of a <details> as a stop", () => {
    const { getByText } = render(
      <Dialog title="T" onDismiss={() => {}}>
        <details open>
          <summary>First summary</summary>
          <summary>Second summary</summary>
        </details>
        <summary>Orphan</summary>
      </Dialog>,
    );
    const stops = focusableElements(
      getByText("First summary").closest<HTMLElement>('[role="dialog"]')!,
    );
    expect(stops.map((stop) => stop.textContent)).toEqual(["First summary"]);
  });

  it("pins focus to the dialog when every control is hidden by CSS", () => {
    const { getByRole } = render(
      <Dialog title="T" onDismiss={() => {}}>
        <div style="display: none">
          <button type="button">Ghost</button>
        </div>
      </Dialog>,
    );
    const dialog = getByRole("dialog");
    expect(document.activeElement).toBe(dialog);
    expect(tab()).toBe(false);
    expect(document.activeElement).toBe(dialog);
    expect(tab(true)).toBe(false);
    expect(document.activeElement).toBe(dialog);
  });

  it("does the same in a Sheet", () => {
    const { getByRole } = render(
      <Sheet title="T" onDismiss={() => {}}>
        <Button>Visible</Button>
        <div style="display: none">
          <button type="button">Ghost</button>
        </div>
      </Sheet>,
    );
    // The close button comes first in a Sheet; "Visible" is the last real stop.
    const visible = getByRole("button", { name: "Visible" });
    visible.focus();
    expect(tab()).toBe(false);
    expect(document.activeElement).toBe(getByRole("button", { name: /close/i }));
  });

  it("skips a control with display:contents, which has no box to focus", () => {
    const { getByRole } = render(
      <Dialog title="T" onDismiss={() => {}}>
        <Button>One</Button>
        <button type="button" style="display: contents">
          Contents
        </button>
      </Dialog>,
    );
    const one = getByRole("button", { name: "One" });
    expect(tab()).toBe(false); // One is the last stop
    expect(document.activeElement).toBe(one);
  });

  it("reads the styles again on every Tab, so a control hidden after mount stops counting", () => {
    const { getByRole } = render(
      <Dialog title="T" onDismiss={() => {}}>
        <Button>First</Button>
        <Button>Second</Button>
        <Button>Third</Button>
      </Dialog>,
    );
    const first = getByRole("button", { name: "First" });
    const second = getByRole("button", { name: "Second" });
    const third = getByRole("button", { name: "Third" });
    second.focus();
    expect(tab()).toBe(true); // Third is still ahead
    third.style.display = "none";
    expect(tab()).toBe(false); // now Second is the last stop
    expect(document.activeElement).toBe(first);
    third.style.display = "";
    second.focus();
    expect(tab()).toBe(true);
  });

  it("follows a <details> that is opened after mount", () => {
    const { getByRole, getByText } = render(
      <Dialog title="T" onDismiss={() => {}}>
        <Button>Before</Button>
        <details>
          <summary>More</summary>
          <button type="button">Inner</button>
        </details>
      </Dialog>,
    );
    const summary = getByText("More");
    summary.focus();
    expect(tab()).toBe(false); // closed: the summary is the last stop
    expect(document.activeElement).toBe(getByRole("button", { name: "Before" }));
    summary.parentElement!.setAttribute("open", "");
    summary.focus();
    expect(tab()).toBe(true); // open: Inner follows it
    getByRole("button", { name: "Inner" }).focus();
    expect(tab()).toBe(false);
  });

  it("skips a <summary> that is itself display:none or has tabindex=-1", () => {
    const { getByText } = render(
      <Dialog title="T" onDismiss={() => {}}>
        <Button>One</Button>
        <details>
          <summary style="display: none">Gone</summary>
        </details>
        <details>
          <summary tabIndex={-1}>Roving</summary>
        </details>
      </Dialog>,
    );
    const stops = focusableElements(
      getByText("One").closest<HTMLElement>('[role="dialog"]')!,
    );
    expect(stops.map((stop) => stop.textContent)).toEqual(["One"]);
  });

  it("has no axe violations with a closed disclosure and hidden controls", async () => {
    const { getByRole } = render(
      <Dialog title="T" onDismiss={() => {}}>
        <details>
          <summary>More</summary>
          <button type="button">Inner</button>
        </details>
        <div style="display: none">
          <button type="button">Ghost</button>
        </div>
      </Dialog>,
    );
    await expectNoAxeViolations(getByRole("dialog"));
  });
});

// Chrome before 105, Firefox before 106 and Safari before 17.4 have no
// checkVisibility, and neither has jsdom: no stand-in is installed here.
describe("Dialog focus trap in an engine without checkVisibility", () => {
  afterEach(() => resetOverlayStackForTests());

  const tab = (shiftKey = false) =>
    fireEvent.keyDown(document, { key: "Tab", shiftKey });

  it("has none to call, which is what jsdom is like", () => {
    expect(typeof Element.prototype.checkVisibility).toBe("undefined");
  });

  it("falls back to the markup checks and does not throw", () => {
    const { getByRole } = render(
      <Dialog title="T" onDismiss={() => {}}>
        <Button>First</Button>
        <Button>Visible</Button>
        <div hidden>
          <button type="button">Markup ghost</button>
        </div>
        <div style="display: none">
          <button type="button">CSS ghost</button>
        </div>
      </Dialog>,
    );
    const surface = getByRole("dialog");
    expect(focusableElements(surface).map((stop) => stop.textContent)).toEqual([
      "First",
      "Visible",
      "CSS ghost",
    ]);
    // Known limit of the fallback: the CSS ghost still counts as the last stop.
    getByRole("button", { name: "Visible" }).focus();
    expect(tab()).toBe(true);
  });

  // A closed <details> is decided from the markup, so it needs no
  // checkVisibility: the content of one, nested ones included, is never a stop.
  it("still leaves the content of a closed <details> out, nested ones too", () => {
    const { getByRole, getByText } = render(
      <Dialog title="T" onDismiss={() => {}}>
        <Button>A</Button>
        <details>
          <summary>Outer</summary>
          <details>
            <summary>Inner</summary>
            <p>text</p>
          </details>
          <button type="button">Inside</button>
        </details>
      </Dialog>,
    );
    const stops = focusableElements(getByRole("dialog"));
    expect(stops.map((stop) => stop.textContent)).toEqual(["A", "Outer"]);
    getByText("Outer").focus();
    expect(tab()).toBe(false); // Outer is the last stop: wrap, do not leave
    expect(document.activeElement).toBe(getByRole("button", { name: "A" }));
  });

  it("counts the content of an open <details> and its nested closed one correctly", () => {
    const { getByRole } = render(
      <Dialog title="T" onDismiss={() => {}}>
        <details open>
          <summary>Outer</summary>
          <button type="button">Inside</button>
          <details>
            <summary>Inner</summary>
            <button type="button">Deep</button>
          </details>
        </details>
      </Dialog>,
    );
    const stops = focusableElements(getByRole("dialog"));
    expect(stops.map((stop) => stop.textContent)).toEqual([
      "Outer",
      "Inside",
      "Inner",
    ]);
  });
});

// A Dialog listens for Escape in the capture phase and stops the event, so a
// Tooltip's own listener never saw it inside one: pressing Escape to hide a
// tooltip closed the whole dialog and dropped what the user had typed (WCAG
// 1.4.13, dismissible). A showing tooltip inside the dialog now takes the first
// Escape and the next one reaches the dialog, as for a Menu.
describe("Tooltip inside Dialog", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    resetOverlayStackForTests();
  });

  it("hides a tooltip shown by focus on the first Escape, and dismisses on the next", () => {
    const onDismiss = vi.fn();
    const { getByRole, queryByRole } = render(
      <Dialog title="Note" onDismiss={onDismiss}>
        <Tooltip content="Hint">
          <Button>Help</Button>
        </Tooltip>
      </Dialog>,
    );
    const help = getByRole("button", { name: "Help" });
    expect(document.activeElement).toBe(help);
    expect(getByRole("tooltip").textContent).toBe("Hint");

    // Consumed: the browser default is cancelled and nothing else reacts to it.
    expect(fireEvent.keyDown(help, { key: "Escape" })).toBe(false);
    expect(queryByRole("tooltip")).toBeNull();
    expect(help.getAttribute("aria-describedby")).toBeNull();
    expect(onDismiss).not.toHaveBeenCalled();

    fireEvent.keyDown(help, { key: "Escape" });
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith("escape");
  });

  it("hides a tooltip shown by hover while focus is on another control", () => {
    const onDismiss = vi.fn();
    const { getByRole, queryByRole } = render(
      <Dialog title="Note" onDismiss={onDismiss}>
        <Button>First</Button>
        <Tooltip content="Hint" delay={300}>
          <Button>Help</Button>
        </Tooltip>
      </Dialog>,
    );
    const first = getByRole("button", { name: "First" });
    expect(document.activeElement).toBe(first);
    fireEvent.mouseEnter(getByRole("button", { name: "Help" }));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(getByRole("tooltip")).toBeTruthy();

    fireEvent.keyDown(first, { key: "Escape" });
    expect(queryByRole("tooltip")).toBeNull();
    expect(onDismiss).not.toHaveBeenCalled();
    fireEvent.keyDown(first, { key: "Escape" });
    expect(onDismiss).toHaveBeenCalledWith("escape");
  });

  it("does the same in a Sheet", () => {
    const onDismiss = vi.fn();
    const { getByRole, queryByRole } = render(
      <Sheet title="Note" onDismiss={onDismiss}>
        <Tooltip content="Hint">
          <Button>Help</Button>
        </Tooltip>
      </Sheet>,
    );
    const help = getByRole("button", { name: "Help" });
    act(() => help.focus());
    expect(getByRole("tooltip")).toBeTruthy();
    fireEvent.keyDown(help, { key: "Escape" });
    expect(queryByRole("tooltip")).toBeNull();
    expect(onDismiss).not.toHaveBeenCalled();
    fireEvent.keyDown(help, { key: "Escape" });
    expect(onDismiss).toHaveBeenCalledWith("escape");
  });

  it("hides the tooltip even when the dialog cannot be closed with Escape", () => {
    const onDismiss = vi.fn();
    const { getByRole, queryByRole } = render(
      <Dialog title="Note" closeOnEscape={false} onDismiss={onDismiss}>
        <Tooltip content="Hint">
          <Button>Help</Button>
        </Tooltip>
      </Dialog>,
    );
    const help = getByRole("button", { name: "Help" });
    fireEvent.keyDown(help, { key: "Escape" });
    expect(queryByRole("tooltip")).toBeNull();
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("dismisses at once when no tooltip is showing", () => {
    const onDismiss = vi.fn();
    const { getByRole, queryByRole } = render(
      <Dialog title="Note" onDismiss={onDismiss}>
        <Button>First</Button>
        <Tooltip content="Hint">
          <Button>Help</Button>
        </Tooltip>
      </Dialog>,
    );
    expect(queryByRole("tooltip")).toBeNull();
    fireEvent.keyDown(getByRole("button", { name: "First" }), { key: "Escape" });
    expect(onDismiss).toHaveBeenCalledWith("escape");
  });

  it("does not let a tooltip that is no longer showing take the Escape", () => {
    const onDismiss = vi.fn();
    const dialog = (disabled: boolean) => (
      <Dialog title="Note" onDismiss={onDismiss}>
        <Tooltip content="Hint" disabled={disabled}>
          <Button>Help</Button>
        </Tooltip>
      </Dialog>
    );
    const { getByRole, queryByRole, rerender } = render(dialog(false));
    expect(getByRole("tooltip")).toBeTruthy();
    // The state still says open, but nothing is showing.
    rerender(dialog(true));
    expect(queryByRole("tooltip")).toBeNull();
    fireEvent.keyDown(getByRole("button", { name: "Help" }), { key: "Escape" });
    expect(onDismiss).toHaveBeenCalledWith("escape");
  });

  it("leaves a tooltip that is open behind the dialog alone", () => {
    const onDismiss = vi.fn();
    const { getByRole, getAllByRole } = render(
      <div>
        <Tooltip content="Behind" delay={0}>
          <Button>Outside</Button>
        </Tooltip>
        <Dialog title="Note" onDismiss={onDismiss}>
          <Button>Inside</Button>
        </Dialog>
      </div>,
    );
    fireEvent.mouseEnter(getByRole("button", { name: "Outside" }));
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(getAllByRole("tooltip")).toHaveLength(1);

    // The tooltip behind the modal must not swallow the Escape meant for it, and
    // it is not the dialog's to hide.
    fireEvent.keyDown(getByRole("button", { name: "Inside" }), { key: "Escape" });
    expect(onDismiss).toHaveBeenCalledWith("escape");
    expect(getAllByRole("tooltip")).toHaveLength(1);
  });

  it("only looks inside the topmost of two stacked dialogs", () => {
    const lower = vi.fn();
    const upper = vi.fn();
    const { getByRole } = render(
      <div>
        <Dialog title="Lower" onDismiss={lower}>
          <Tooltip content="Lower hint" delay={0}>
            <Button>Lower help</Button>
          </Tooltip>
        </Dialog>
        <Dialog title="Upper" onDismiss={upper}>
          <Button>Upper action</Button>
        </Dialog>
      </div>,
    );
    fireEvent.mouseEnter(getByRole("button", { name: "Lower help" }));
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(getByRole("tooltip")).toBeTruthy();
    // The upper dialog owns this Escape and has no tooltip of its own.
    fireEvent.keyDown(getByRole("button", { name: "Upper action" }), { key: "Escape" });
    expect(upper).toHaveBeenCalledWith("escape");
    expect(lower).not.toHaveBeenCalled();
    expect(getByRole("tooltip")).toBeTruthy();
  });

  it("leaves Escape to the input method while it is composing", () => {
    const onDismiss = vi.fn();
    const { getByRole } = render(
      <Dialog title="Note" onDismiss={onDismiss}>
        <Tooltip content="Hint">
          <Button>Help</Button>
        </Tooltip>
      </Dialog>,
    );
    fireEvent.keyDown(getByRole("button", { name: "Help" }), {
      key: "Escape",
      isComposing: true,
    });
    expect(getByRole("tooltip")).toBeTruthy();
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("does not change Escape outside a dialog: the tooltip closes and the host still sees the key", () => {
    const seen = vi.fn();
    document.addEventListener("keydown", seen);
    try {
      const { getByRole, queryByRole } = render(
        <Tooltip content="Hint">
          <Button>Help</Button>
        </Tooltip>,
      );
      fireEvent.focus(getByRole("button", { name: "Help" }));
      expect(getByRole("tooltip")).toBeTruthy();
      fireEvent.keyDown(getByRole("button", { name: "Help" }), { key: "Escape" });
      expect(queryByRole("tooltip")).toBeNull();
      expect(seen).toHaveBeenCalledTimes(1);
    } finally {
      document.removeEventListener("keydown", seen);
    }
  });

  it("has no axe violations with a tooltip showing in a dialog", async () => {
    vi.useRealTimers(); // axe-core schedules its own timers
    const { container, getByRole } = render(
      <Dialog title="Note" onDismiss={() => undefined}>
        <Tooltip content="Hint">
          <Button>Help</Button>
        </Tooltip>
      </Dialog>,
    );
    expect(getByRole("tooltip")).toBeTruthy();
    await expectNoAxeViolations(container);
  });
});

describe("Menu inside Dialog", () => {
  afterEach(() => resetOverlayStackForTests());

  function Harness({ onDismiss }: { onDismiss: () => void }) {
    return (
      <Dialog title="Note" onDismiss={onDismiss} actions={<Button>Done</Button>}>
        <Menu
          label="Note actions"
          trigger="Actions"
          items={[
            { id: "rename", label: "Rename", onSelect: () => {} },
            { id: "delete", label: "Delete", onSelect: () => {} },
          ]}
        />
      </Dialog>
    );
  }

  it("closes only the menu on Escape, then the dialog on the next Escape", () => {
    const onDismiss = vi.fn();
    const { getByRole, queryByRole } = render(<Harness onDismiss={onDismiss} />);
    const trigger = getByRole("button", { name: "Note actions" });
    fireEvent.click(trigger);
    const item = getByRole("menuitem", { name: "Rename" });
    expect(document.activeElement).toBe(item);

    fireEvent.keyDown(item, { key: "Escape" });
    expect(queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(onDismiss).not.toHaveBeenCalled();

    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(onDismiss).toHaveBeenCalledWith("escape");
  });

  it("types ahead inside a dialog without dismissing it, and Escape still closes only the menu", () => {
    const onDismiss = vi.fn();
    const { getByRole, queryByRole } = render(<Harness onDismiss={onDismiss} />);
    fireEvent.click(getByRole("button", { name: "Note actions" }));
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: "d" });
    expect(document.activeElement).toBe(getByRole("menuitem", { name: "Delete" }));
    expect(onDismiss).not.toHaveBeenCalled();
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Escape" });
    expect(queryByRole("menu")).toBeNull();
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("still dismisses on Escape from ordinary dialog content", () => {
    const onDismiss = vi.fn();
    const { getByRole } = render(<Harness onDismiss={onDismiss} />);
    fireEvent.keyDown(getByRole("button", { name: "Done" }), { key: "Escape" });
    expect(onDismiss).toHaveBeenCalledWith("escape");
  });

  it("keeps Tab inside the dialog when it leaves the last menu item", () => {
    const { getByRole } = render(
      <Dialog title="Note" onDismiss={() => {}}>
        <Menu
          label="Note actions"
          trigger="Actions"
          items={[{ id: "rename", label: "Rename", onSelect: () => {} }]}
        />
      </Dialog>,
    );
    const trigger = getByRole("button", { name: "Note actions" });
    fireEvent.click(trigger);
    const item = getByRole("menuitem", { name: "Rename" });
    // Nothing tabbable follows the menu, so the trap wraps to the trigger.
    expect(fireEvent.keyDown(item, { key: "Tab" })).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it("keeps the dialog open when closeOnEscape is false and still closes the menu", () => {
    const onDismiss = vi.fn();
    const { getByRole, queryByRole } = render(
      <Dialog title="Note" onDismiss={onDismiss} closeOnEscape={false}>
        <Menu label="Note actions" trigger="Actions" items={[{ id: "a", label: "A", onSelect: () => {} }]} />
      </Dialog>,
    );
    fireEvent.click(getByRole("button", { name: "Note actions" }));
    fireEvent.keyDown(getByRole("menuitem", { name: "A" }), { key: "Escape" });
    expect(queryByRole("menu")).toBeNull();
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("works the same inside a Sheet", () => {
    const onDismiss = vi.fn();
    const { getByRole, queryByRole } = render(
      <Sheet title="Note" onDismiss={onDismiss}>
        <Menu label="Note actions" trigger="Actions" items={[{ id: "a", label: "A", onSelect: () => {} }]} />
      </Sheet>,
    );
    fireEvent.click(getByRole("button", { name: "Note actions" }));
    fireEvent.keyDown(getByRole("menuitem", { name: "A" }), { key: "Escape" });
    expect(queryByRole("menu")).toBeNull();
    expect(onDismiss).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onDismiss).toHaveBeenCalledWith("escape");
  });

  it("does not leak the menu's Escape to document listeners", () => {
    const onDocumentKey = vi.fn();
    document.addEventListener("keydown", onDocumentKey);
    try {
      const { getByRole } = render(<Harness onDismiss={() => {}} />);
      fireEvent.click(getByRole("button", { name: "Note actions" }));
      onDocumentKey.mockClear();
      fireEvent.keyDown(getByRole("menuitem", { name: "Rename" }), { key: "Escape" });
      expect(onDocumentKey).not.toHaveBeenCalled();
    } finally {
      document.removeEventListener("keydown", onDocumentKey);
    }
  });

  it("does not hand Escape to a foreign role=menu that cannot handle it", () => {
    const onDismiss = vi.fn();
    const { getByRole } = render(
      <Dialog title="Note" onDismiss={onDismiss}>
        <ul role="menu" aria-label="Static actions">
          <li role="none">
            <button type="button" role="menuitem">Copy</button>
          </li>
        </ul>
      </Dialog>,
    );
    fireEvent.keyDown(getByRole("menuitem", { name: "Copy" }), { key: "Escape" });
    expect(onDismiss).toHaveBeenCalledWith("escape");
  });

  it("has no axe violations with the menu open", async () => {
    const { getByRole, baseElement } = render(<Harness onDismiss={() => {}} />);
    fireEvent.click(getByRole("button", { name: "Note actions" }));
    await expectNoAxeViolations(baseElement);
  });
});

describe("roving tab stop when the selection is disabled", () => {
  const tabItems = [
    { id: "a", label: "One", panel: "Panel one", disabled: true },
    { id: "b", label: "Two", panel: "Panel two" },
    { id: "c", label: "Three", panel: "Panel three" },
  ];

  it("Tabs keeps the one tab stop on an enabled tab", () => {
    const { getAllByRole } = render(
      <Tabs label="Sections" value="a" onChange={() => {}} items={tabItems} />,
    );
    const tabs = getAllByRole("tab") as HTMLButtonElement[];
    // A disabled button cannot take focus: a stop on it would leave the whole
    // group unreachable by keyboard.
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([-1, 0, -1]);
    expect(tabs[0]!.getAttribute("aria-selected")).toBe("true");
  });

  it("Tabs with a disabled selection has no axe violations", async () => {
    const { container } = render(
      <Tabs label="Sections" value="a" onChange={() => {}} items={tabItems} />,
    );
    await expectNoAxeViolations(container);
  });

  it("Tabs arrows start from the tab stop, not from the disabled selection", () => {
    const onChange = vi.fn();
    const { getByRole } = render(
      <Tabs label="Sections" value="a" onChange={onChange} items={tabItems} />,
    );
    const two = getByRole("tab", { name: "Two" });
    two.focus();
    fireEvent.keyDown(two, { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith("c");
  });

  it("Tabs keeps the stop on the selected tab while it is enabled", () => {
    const { getAllByRole } = render(
      <Tabs label="Sections" value="c" onChange={() => {}} items={tabItems} />,
    );
    expect(getAllByRole("tab").map((tab) => tab.tabIndex)).toEqual([-1, -1, 0]);
  });

  it("SegmentedControl keeps the one tab stop on an enabled option", () => {
    const options = [
      { value: "a", label: "A", disabled: true },
      { value: "b", label: "B" },
      { value: "c", label: "C" },
    ];
    const noMatch = render(
      <SegmentedControl label="Mode" value={"none" as "a"} options={options} onChange={() => {}} />,
    );
    expect(noMatch.getAllByRole("radio").map((radio) => radio.tabIndex)).toEqual([-1, 0, -1]);
    noMatch.unmount();

    const disabledSelected = render(
      <SegmentedControl label="Mode" value="a" options={options} onChange={() => {}} />,
    );
    expect(
      disabledSelected.getAllByRole("radio").map((radio) => radio.tabIndex),
    ).toEqual([-1, 0, -1]);
  });

  it("SegmentedControl arrows start from the tab stop", () => {
    const onChange = vi.fn();
    const options = [
      { value: "a", label: "A", disabled: true },
      { value: "b", label: "B" },
      { value: "c", label: "C" },
    ];
    const { getByRole } = render(
      <SegmentedControl label="Mode" value="a" options={options} onChange={onChange} />,
    );
    const b = getByRole("radio", { name: "B" });
    b.focus();
    fireEvent.keyDown(b, { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith("c");
  });
});

describe("Menu that becomes unavailable while open", () => {
  const items = [{ id: "a", label: "Rename", onSelect: () => {} }];

  it("closes when the menu gets disabled", () => {
    const { getByRole, queryByRole, rerender } = render(
      <Menu label="Actions" trigger="More" items={items} />,
    );
    fireEvent.click(getByRole("button", { name: "Actions" }));
    expect(queryByRole("menu")).not.toBeNull();
    rerender(<Menu label="Actions" trigger="More" items={items} disabled />);
    expect(queryByRole("menu")).toBeNull();
    expect(getByRole("button", { name: "Actions" }).getAttribute("aria-expanded")).toBe("false");
  });

  it("closes when its items run out", () => {
    const { getByRole, queryByRole, rerender } = render(
      <Menu label="Actions" trigger="More" items={items} />,
    );
    fireEvent.click(getByRole("button", { name: "Actions" }));
    expect(queryByRole("menu")).not.toBeNull();
    rerender(<Menu label="Actions" trigger="More" items={[]} />);
    expect(queryByRole("menu")).toBeNull();
  });

  it("opens again once it is available", () => {
    const { getByRole, queryByRole, rerender } = render(
      <Menu label="Actions" trigger="More" items={items} />,
    );
    fireEvent.click(getByRole("button", { name: "Actions" }));
    rerender(<Menu label="Actions" trigger="More" items={items} disabled />);
    rerender(<Menu label="Actions" trigger="More" items={items} />);
    expect(queryByRole("menu")).toBeNull();
    fireEvent.click(getByRole("button", { name: "Actions" }));
    expect(queryByRole("menu")).not.toBeNull();
  });
});

describe("aria-invalid passed by the host", () => {
  it("survives on Input, Textarea and Select when there is no error text", () => {
    const { getByLabelText } = render(
      <>
        <Input label="Name" aria-invalid="true" />
        <Textarea label="Notes" aria-invalid="true" />
        <Select
          label="Folder"
          aria-invalid="true"
          options={[{ value: "a", label: "A" }]}
        />
      </>,
    );
    for (const name of ["Name", "Notes", "Folder"]) {
      expect(getByLabelText(name).getAttribute("aria-invalid")).toBe("true");
    }
  });

  it("is still set by `error`, which wins, and absent otherwise", () => {
    const { getByLabelText } = render(
      <>
        <Input label="Name" error="Required" aria-invalid="false" />
        <Input label="Plain" />
      </>,
    );
    expect(getByLabelText("Name").getAttribute("aria-invalid")).toBe("true");
    expect(getByLabelText("Plain").hasAttribute("aria-invalid")).toBe(false);
  });
});

describe("rovingTabStop", () => {
  it("keeps the selected item while it is enabled", () => {
    expect(rovingTabStop(2, [true, true, true])).toBe(2);
  });

  it("falls back to the first enabled item for a disabled or missing selection", () => {
    expect(rovingTabStop(0, [false, true, true])).toBe(1);
    expect(rovingTabStop(-1, [false, true])).toBe(1);
    expect(rovingTabStop(-1, [true, true])).toBe(0);
  });

  it("stays on the selection, or the first item, when nothing is enabled", () => {
    expect(rovingTabStop(1, [false, false])).toBe(1);
    expect(rovingTabStop(-1, [false, false])).toBe(0);
    expect(rovingTabStop(-1, [])).toBe(0);
  });
});

// A chord such as Alt+ArrowLeft (history back), Ctrl+ArrowRight (word jump,
// virtual desktop switch) or Cmd+ArrowDown belongs to the browser, the OS or the
// host app. A widget that treats it as a plain arrow both moves its own
// selection and cancels the shortcut, because it calls preventDefault.
// fireEvent returns false when the event was cancelled.
describe("keys that are not the widget's own", () => {
  const chords = [
    { altKey: true },
    { ctrlKey: true },
    { metaKey: true },
  ] as const;

  it("Tabs ignores arrow, Home and End chords and leaves them to the browser", () => {
    const onChange = vi.fn();
    const { getByRole } = render(<TabsHarness onChange={onChange} />);
    const one = getByRole("tab", { name: "One" });
    one.focus();
    for (const chord of chords) {
      for (const key of ["ArrowRight", "ArrowLeft", "Home", "End"]) {
        expect(fireEvent.keyDown(one, { key, ...chord })).toBe(true);
      }
    }
    expect(onChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(one);
    // The plain key still works, so the guard is not just a dead handler.
    expect(fireEvent.keyDown(one, { key: "ArrowRight" })).toBe(false);
    expect(onChange).toHaveBeenCalledWith("c");
  });

  it("SegmentedControl ignores chords", () => {
    const { getByRole } = render(<SegmentedHarness />);
    const system = getByRole("radio", { name: "System" });
    system.focus();
    for (const chord of chords) {
      expect(fireEvent.keyDown(system, { key: "ArrowRight", ...chord })).toBe(true);
    }
    expect(system.getAttribute("aria-checked")).toBe("true");
    expect(fireEvent.keyDown(system, { key: "ArrowRight" })).toBe(false);
    expect(getByRole("radio", { name: "Light" }).getAttribute("aria-checked")).toBe(
      "true",
    );
  });

  it("Tabs and SegmentedControl ignore keys pressed during IME composition", () => {
    const onChange = vi.fn();
    const { getByRole } = render(
      <>
        <TabsHarness onChange={onChange} />
        <SegmentedHarness />
      </>,
    );
    const one = getByRole("tab", { name: "One" });
    expect(fireEvent.keyDown(one, { key: "ArrowRight", isComposing: true })).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
    const system = getByRole("radio", { name: "System" });
    expect(fireEvent.keyDown(system, { key: "ArrowRight", isComposing: true })).toBe(
      true,
    );
    expect(system.getAttribute("aria-checked")).toBe("true");
  });

  it("Menu ignores chords on the trigger and on its items", () => {
    const { getByRole } = render(<MenuHarness />);
    const trigger = getByRole("button", { name: "Note actions" });
    for (const chord of chords) {
      expect(fireEvent.keyDown(trigger, { key: "ArrowDown", ...chord })).toBe(true);
    }
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(trigger);
    const rename = getByRole("menuitem", { name: "Rename" });
    expect(document.activeElement).toBe(rename);
    for (const chord of chords) {
      for (const key of ["ArrowDown", "ArrowUp", "End", "Home"]) {
        expect(fireEvent.keyDown(rename, { key, ...chord })).toBe(true);
      }
    }
    expect(document.activeElement).toBe(rename);
    expect(fireEvent.keyDown(rename, { key: "End" })).toBe(false);
    expect(document.activeElement).toBe(getByRole("menuitem", { name: "Delete" }));
  });

  describe("Escape and Tab while an input method is composing", () => {
    afterEach(() => resetOverlayStackForTests());

    it("Dialog leaves Escape to the input method", () => {
      const onDismiss = vi.fn();
      const { getByLabelText } = render(
        <Dialog title="Rename" onDismiss={onDismiss}>
          <Input label="Name" />
        </Dialog>,
      );
      const input = getByLabelText("Name");
      expect(fireEvent.keyDown(input, { key: "Escape", isComposing: true })).toBe(true);
      expect(onDismiss).not.toHaveBeenCalled();
      // Once composition has ended, Escape closes the dialog as before.
      expect(fireEvent.keyDown(input, { key: "Escape" })).toBe(false);
      expect(onDismiss).toHaveBeenCalledWith("escape");
    });

    it("Dialog also recognises Safari's keyCode 229 for the key that ends a composition", () => {
      const onDismiss = vi.fn();
      const { getByLabelText } = render(
        <Dialog title="Rename" onDismiss={onDismiss}>
          <Input label="Name" />
        </Dialog>,
      );
      const input = getByLabelText("Name");
      expect(fireEvent.keyDown(input, { key: "Escape", keyCode: 229 })).toBe(true);
      expect(onDismiss).not.toHaveBeenCalled();
    });

    it("Dialog does not wrap focus on a composing Tab", () => {
      const { getByRole } = render(
        <Dialog title="Rename" onDismiss={() => {}} actions={<Button>Done</Button>}>
          <Button>Cancel</Button>
        </Dialog>,
      );
      const done = getByRole("button", { name: "Done" });
      done.focus();
      expect(fireEvent.keyDown(done, { key: "Tab", isComposing: true })).toBe(true);
      expect(document.activeElement).toBe(done);
    });

    it("Tooltip stays open", () => {
      const { getByRole, queryByRole } = render(
        <Tooltip content="Tip">
          <button>Save</button>
        </Tooltip>,
      );
      fireEvent.focus(getByRole("button"));
      fireEvent.keyDown(document, { key: "Escape", isComposing: true });
      expect(queryByRole("tooltip")).not.toBeNull();
      fireEvent.keyDown(document, { key: "Escape" });
      expect(queryByRole("tooltip")).toBeNull();
    });
  });
});

// Preact accepts both `class` and `className`. The components used to spread the
// host's props and then set `class` themselves, so a host's `class` vanished
// without a warning.
describe("host class names", () => {
  it("keeps `class` as well as `className` on every spread-props component", () => {
    const { container } = render(
      <>
        <Button class="host-a">Save</Button>
        <IconButton class="host-b" icon={icon} label="Close" />
        <Badge class="host-c">New</Badge>
        <Card class="host-d" title="Note" />
        <Input class="host-e" label="Title" />
        <Textarea class="host-f" label="Body" />
        <Select class="host-g" label="Font" options={[{ value: "a", label: "Sans" }]} />
        <Checkbox class="host-h" label="Wrap" />
        <Switch class="host-i" label="Spell" />
      </>,
    );
    const expected: Record<string, string> = {
      "host-a": "ds-btn",
      "host-b": "ds-icon-btn",
      "host-c": "ds-badge",
      "host-d": "ds-card",
      "host-e": "ds-input",
      "host-f": "ds-textarea",
      "host-g": "ds-select",
      "host-h": "ds-check",
      "host-i": "ds-check",
    };
    for (const [host, own] of Object.entries(expected)) {
      const element = container.querySelector(`.${host}`);
      expect(element, host).not.toBeNull();
      expect(element!.classList.contains(own), `${host} keeps ${own}`).toBe(true);
    }
  });

  it("merges `class` and `className` when both are given", () => {
    const { getByRole } = render(
      <Button class="from-class" className="from-class-name">
        Save
      </Button>,
    );
    const button = getByRole("button", { name: "Save" });
    for (const name of ["ds-btn", "from-class", "from-class-name"]) {
      expect(button.classList.contains(name), name).toBe(true);
    }
  });
});
