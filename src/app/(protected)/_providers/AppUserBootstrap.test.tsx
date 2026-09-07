// @vitest-environment jsdom

import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const store = vi.hoisted(() => ({
  originalUser: null as { username: string } | null,
  impersonatedUser: null as { username: string } | null,
  syncFromSession: vi.fn(),
}));

vi.mock("@/lib/client/auth", () => ({
  useImpersonationStore: (selector: (state: typeof store) => unknown) =>
    selector(store),
}));

import { adminProfile, userProfile } from "@/mocks/domain/user";

import { AppUserBootstrap } from "./AppUserBootstrap";

describe("AppUserBootstrap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.originalUser = null;
    store.impersonatedUser = null;
  });

  afterEach(cleanup);

  it("bootstraps the session user and renders children", async () => {
    const view = render(
      <AppUserBootstrap user={adminProfile}>
        <span>protected content</span>
      </AppUserBootstrap>,
    );

    expect(view.getByText("protected content")).toBeTruthy();
    await waitFor(() => {
      expect(store.syncFromSession).toHaveBeenCalledWith({
        originalUser: adminProfile,
        impersonatedUser: null,
      });
    });
  });

  it("does not overwrite identity while impersonation is active", () => {
    store.originalUser = adminProfile;
    store.impersonatedUser = userProfile;

    render(
      <AppUserBootstrap user={userProfile}>content</AppUserBootstrap>,
    );

    expect(store.syncFromSession).not.toHaveBeenCalled();
  });

  it("does not reset an already synchronized original user", () => {
    store.originalUser = adminProfile;

    render(
      <AppUserBootstrap user={adminProfile}>content</AppUserBootstrap>,
    );

    expect(store.syncFromSession).not.toHaveBeenCalled();
  });

  it("synchronizes a changed session identity when impersonation is inactive", async () => {
    store.originalUser = adminProfile;

    render(<AppUserBootstrap user={userProfile}>content</AppUserBootstrap>);

    await waitFor(() => {
      expect(store.syncFromSession).toHaveBeenCalledWith({
        originalUser: userProfile,
        impersonatedUser: null,
      });
    });
  });
});
