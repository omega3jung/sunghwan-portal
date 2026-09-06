// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SettingsAccessGuard } from "./SettingsAccessGuard";

const mocks = vi.hoisted(() => ({
  addToast: vi.fn(),
  replace: vi.fn(),
  useSettingsAccess: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/components/ui/toast", () => ({
  toast: { add: mocks.addToast },
}));

vi.mock("./SettingsAccessProvider", () => ({
  useSettingsAccess: mocks.useSettingsAccess,
}));

afterEach(cleanup);

describe("SettingsAccessGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders protected settings for an authorized session", () => {
    mocks.useSettingsAccess.mockReturnValue({
      isChecking: false,
      isForbidden: false,
      status: "authenticated",
    });

    render(<SettingsAccessGuard>settings</SettingsAccessGuard>);

    expect(screen.getByText("settings")).not.toBeNull();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("redirects an unauthenticated session to login", async () => {
    mocks.useSettingsAccess.mockReturnValue({
      isChecking: false,
      isForbidden: false,
      status: "unauthenticated",
    });

    render(<SettingsAccessGuard>settings</SettingsAccessGuard>);

    expect(screen.queryByText("settings")).toBeNull();
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/login"));
    expect(mocks.addToast).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "settings-access-guard:unauthenticated",
        type: "warning",
      }),
    );
  });

  it("redirects an authenticated user without settings permission home", async () => {
    mocks.useSettingsAccess.mockReturnValue({
      isChecking: false,
      isForbidden: true,
      status: "authenticated",
    });

    render(<SettingsAccessGuard>settings</SettingsAccessGuard>);

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/"));
    expect(mocks.addToast).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "settings-access-guard:forbidden",
        type: "warning",
      }),
    );
  });
});
