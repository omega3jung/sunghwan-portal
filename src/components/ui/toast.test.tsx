// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import type { ToastData } from "@/shared/client/toast";

import { createToastManager, Toaster } from "./toast";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it("renders load and discard together outside the description and keeps both actions clickable", async () => {
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
  const manager = createToastManager<ToastData>();
  const load = vi.fn();
  const discard = vi.fn();
  const consoleError = vi.spyOn(console, "error");
  render(<Toaster toastManager={manager} />);
  await act(async () => {
    manager.add({
      title: "Saved draft",
      description: "Load or discard your draft.",
      actionProps: { children: "Load", onClick: load },
      data: { secondaryActionProps: { children: "Discard Draft", onClick: discard } },
      timeout: 0,
    });
  });

  const loadButton = screen.getByRole("button", { name: "Load" });
  const discardButton = screen.getByRole("button", { name: "Discard Draft" });
  const actions = loadButton.parentElement;
  expect(actions).toBe(discardButton.parentElement);
  expect(actions?.classList.contains("flex-col")).toBe(true);
  expect(actions?.classList.contains("items-end")).toBe(true);
  expect(actions?.querySelectorAll("button")).toHaveLength(2);
  expect(screen.getByText("Load or discard your draft.").querySelector("button")).toBeNull();
  expect(discardButton.closest("p")).toBeNull();
  fireEvent.click(loadButton);
  fireEvent.click(discardButton);
  expect(load).toHaveBeenCalledOnce();
  expect(discard).toHaveBeenCalledOnce();
  expect(consoleError).not.toHaveBeenCalled();
});
