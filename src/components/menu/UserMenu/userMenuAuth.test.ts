import { beforeEach, describe, expect, it, vi } from "vitest";

const signOut = vi.hoisted(() => vi.fn());

vi.mock("next-auth/react", () => ({ signOut }));

import { signOutToHome } from "./userMenuAuth";

describe("User menu sign-out", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses home as the stable callback instead of retaining a protected path", () => {
    signOutToHome();

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" });
  });
});
