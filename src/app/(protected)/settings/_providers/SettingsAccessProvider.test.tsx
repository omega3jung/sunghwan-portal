// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SettingsAccessProvider, useSettingsAccess } from "./SettingsAccessProvider";

const mocks = vi.hoisted(() => ({
  useCurrentSession: vi.fn(),
}));

vi.mock("@/feature/auth/session/client", () => ({
  useCurrentSession: mocks.useCurrentSession,
}));

function AccessSnapshot() {
  const access = useSettingsAccess();

  return <pre>{JSON.stringify(access)}</pre>;
}

function renderProvider() {
  return render(
    <SettingsAccessProvider
      userScope="INTERNAL"
      permission={9}
      companyId="1"
    >
      <AccessSnapshot />
    </SettingsAccessProvider>,
  );
}

function readAccess() {
  return JSON.parse(screen.getByText(/"type"/).textContent ?? "{}");
}

afterEach(cleanup);

describe("SettingsAccessProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the synchronized current user instead of layout claims", () => {
    mocks.useCurrentSession.mockReturnValue({
      status: "authenticated",
      data: { user: { username: "tenant-admin" } },
      current: {
        user: {
          username: "tenant-admin",
          userScope: "CLIENT",
          permission: 9,
          companyId: 22,
        },
      },
    });

    renderProvider();

    expect(readAccess()).toMatchObject({
      type: "TENANT_ADMIN",
      isForbidden: false,
      isChecking: false,
      principal: {
        userScope: "CLIENT",
        permission: 9,
        companyId: 22,
      },
    });
  });

  it("keeps checking while an impersonated identity is not synchronized", () => {
    mocks.useCurrentSession.mockReturnValue({
      status: "authenticated",
      data: {
        impersonation: { impersonatedUser: { username: "impersonated" } },
      },
      current: {
        user: {
          username: "original",
          userScope: "INTERNAL",
          permission: 3,
          companyId: 1,
        },
      },
    });

    renderProvider();

    expect(readAccess()).toMatchObject({
      type: null,
      isForbidden: false,
      isChecking: true,
    });
  });

  it("fails closed for a synchronized non-admin user", () => {
    mocks.useCurrentSession.mockReturnValue({
      status: "authenticated",
      data: { user: { username: "user" } },
      current: {
        user: {
          username: "user",
          userScope: "CLIENT",
          permission: 3,
          companyId: 22,
        },
      },
    });

    renderProvider();

    expect(readAccess()).toMatchObject({
      type: null,
      isForbidden: true,
      isChecking: false,
    });
  });
});
