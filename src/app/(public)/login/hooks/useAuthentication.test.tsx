// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({
  signIn: vi.fn(),
  status: "unauthenticated" as "loading" | "authenticated" | "unauthenticated",
}));
const router = vi.hoisted(() => ({ replace: vi.fn() }));
const toast = vi.hoisted(() => ({ add: vi.fn() }));

vi.mock("next-auth/react", () => ({
  signIn: auth.signIn,
  useSession: () => ({ status: auth.status }),
}));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => `translated:${key}` }),
}));
vi.mock("@/components/ui/toast", () => ({ toast }));

import { adminAuth } from "@/mocks/domain/user";

import { useAuthentication } from "./useAuthentication";

describe("useAuthentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.status = "unauthenticated";
  });

  afterEach(cleanup);

  it("replaces the current route with the trusted redirect after authentication", async () => {
    auth.status = "authenticated";

    renderHook(() =>
      useAuthentication({
        redirectHref: "/service-desk?tab=mine",
        onCredentialsExpired: vi.fn(),
      }),
    );

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith("/service-desk?tab=mine");
    });
  });

  it("submits login credentials and restores pending state after success", async () => {
    let resolveSignIn: ((value: { ok: boolean }) => void) | undefined;
    auth.signIn.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSignIn = resolve;
        }),
    );
    const { result } = renderHook(() =>
      useAuthentication({
        redirectHref: "/",
        onCredentialsExpired: vi.fn(),
      }),
    );

    let loginPromise: Promise<void>;
    act(() => {
      loginPromise = result.current.login({
        username: "employee",
        password: "secret",
      });
    });
    expect(result.current.isLoginPending).toBe(true);
    expect(result.current.isDemoPending).toBe(false);

    await act(async () => {
      resolveSignIn?.({ ok: true });
      await loginPromise!;
    });

    expect(auth.signIn).toHaveBeenCalledWith("credentials", {
      username: "employee",
      password: "secret",
      mode: "login",
      redirect: false,
    });
    expect(result.current.isLoginPending).toBe(false);
    expect(toast.add).not.toHaveBeenCalled();
  });

  it("reports ordinary authentication failures and clears the error on demand", async () => {
    auth.signIn.mockResolvedValue({ ok: false, error: "credentials-dont-match" });
    const { result } = renderHook(() =>
      useAuthentication({ redirectHref: "/", onCredentialsExpired: vi.fn() }),
    );

    await act(async () => {
      await result.current.login({ username: "employee", password: "wrong" });
    });

    expect(result.current.errorMessage).toBe(
      "translated:errors.credentials-dont-match",
    );
    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "translated:errors.title",
        description: "translated:errors.credentials-dont-match",
      }),
    );
    expect(result.current.isLoginPending).toBe(false);

    act(() => result.current.clearError());
    expect(result.current.errorMessage).toBeNull();
  });

  it("routes expired credentials to password change without showing a generic error", async () => {
    auth.signIn.mockResolvedValue({ ok: false, error: "expired-credentials" });
    const onCredentialsExpired = vi.fn();
    const { result } = renderHook(() =>
      useAuthentication({ redirectHref: "/", onCredentialsExpired }),
    );

    await act(async () => {
      await result.current.login({ username: "employee", password: "expired" });
    });

    expect(onCredentialsExpired).toHaveBeenCalledWith("employee");
    expect(result.current.errorMessage).toBeNull();
    expect(toast.add).not.toHaveBeenCalled();
    expect(result.current.isLoginPending).toBe(false);
  });

  it("uses the fixed demo credential and demo mode", async () => {
    auth.signIn.mockResolvedValue({ ok: true });
    const { result } = renderHook(() =>
      useAuthentication({ redirectHref: "/", onCredentialsExpired: vi.fn() }),
    );

    await act(async () => result.current.loginAsDemo());

    expect(auth.signIn).toHaveBeenCalledWith("credentials", {
      username: adminAuth.username,
      password: adminAuth.username,
      mode: "demo",
      redirect: false,
    });
    expect(result.current.isDemoPending).toBe(false);
  });
});
