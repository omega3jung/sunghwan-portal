import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DbAuthLoginUserRow } from "./authAccountRow";

const repositories = vi.hoisted(() => ({
  findLoginAuthUser: vi.fn(),
  findEligibleImpersonationEmployeesByCompanyId: vi.fn(),
  findImpersonationTarget: vi.fn(),
  updateAuthAccountLastLoginAt: vi.fn(),
}));
const comparePasswordHash = vi.hoisted(() => vi.fn());

vi.mock("./authAccountRepository", () => repositories);
vi.mock("@/server/shared/security/password", () => ({
  comparePasswordHash,
}));

import {
  getImpersonationTargetAuthUser,
  verifyLoginCredentials,
} from "./authAccountService";

const loginAccount: DbAuthLoginUserRow = {
  aa_id: "account-1",
  aa_password_hash: "stored-hash",
  aa_role: "MANAGER",
  aa_access_level: 7,
  aa_user_scope: "INTERNAL",
  aa_last_login_at: null,
  e_username: "operator",
  e_name: {
    en: { first: "Portal", last: "Operator" },
    ko: { first: "포털", last: "운영자" },
  },
  e_email: "operator@example.com",
  e_company_id: 11,
};

describe("REMOTE authentication identity boundary", () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([
    ["missing account", null, true],
    ["wrong password", loginAccount, false],
  ])("rejects a %s without recording a login", async (_, account, matches) => {
    repositories.findLoginAuthUser.mockResolvedValue(account);
    comparePasswordHash.mockResolvedValue(matches);

    await expect(
      verifyLoginCredentials("operator", "candidate-password"),
    ).resolves.toBeNull();

    expect(repositories.updateAuthAccountLastLoginAt).not.toHaveBeenCalled();
  });

  it("returns trusted account claims and records login only after password verification", async () => {
    repositories.findLoginAuthUser.mockResolvedValue(loginAccount);
    comparePasswordHash.mockResolvedValue(true);

    await expect(
      verifyLoginCredentials("operator", "candidate-password"),
    ).resolves.toEqual({
      id: "account-1",
      username: "operator",
      role: "MANAGER",
      permission: 7,
      userScope: "INTERNAL",
      displayName: { en: "Portal Operator", ko: "포털 운영자" },
      email: "operator@example.com",
      companyId: 11,
      dataScope: "REMOTE",
      accessToken: "auth-account-1",
    });

    expect(comparePasswordHash).toHaveBeenCalledWith(
      "candidate-password",
      "stored-hash",
    );
    expect(repositories.updateAuthAccountLastLoginAt).toHaveBeenCalledWith(
      "account-1",
    );
  });

  it("projects only authorization claims for an impersonation target", async () => {
    repositories.findImpersonationTarget.mockResolvedValue({
      e_username: "customer",
      aa_access_level: 3,
      aa_user_scope: "CLIENT",
    });

    await expect(getImpersonationTargetAuthUser("customer")).resolves.toEqual({
      username: "customer",
      permission: 3,
      userScope: "CLIENT",
    });
  });
});
