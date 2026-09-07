import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({
  queries: [] as string[],
  release: vi.fn(),
}));

vi.mock("pg", () => ({
  Pool: class {
    async connect() {
      return {
        release: database.release,
        query: async (text: string) => {
          database.queries.push(text);
          if (text === "fail in middle") throw new Error("middle failure");
          return { rows: [] };
        },
      };
    }
  },
}));

import { withPortalApiTransaction } from "./portalApiClient";

describe("Category tree transaction boundary", () => {
  beforeEach(() => {
    database.queries.length = 0;
    database.release.mockClear();
    process.env.PORTAL_DATABASE_URL = "postgres://unit-test";
  });

  it("rolls back the complete transaction after a middle write failure", async () => {
    await expect(
      withPortalApiTransaction(async (query) => {
        await query("first category write");
        await query("fail in middle");
      }),
    ).rejects.toThrow("middle failure");

    expect(database.queries).toEqual([
      "begin",
      "first category write",
      "fail in middle",
      "rollback",
    ]);
    expect(database.release).toHaveBeenCalledOnce();
  });
});
