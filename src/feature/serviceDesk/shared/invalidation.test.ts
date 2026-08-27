import type { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import {
  invalidateServiceDeskOrganizationDependencies,
  invalidateServiceDeskTenantDependencies,
} from "./invalidation";

describe("Service Desk dependency invalidation", () => {
  it("invalidates tenant-dependent settings families without a global invalidation", async () => {
    const invalidateQueries = vi.fn().mockResolvedValue(undefined);
    const client = { invalidateQueries } as unknown as QueryClient;

    await invalidateServiceDeskTenantDependencies(client);

    expect(
      invalidateQueries.mock.calls.map(([input]) => input.queryKey),
    ).toEqual([
      ["service-desk", "tenant", "list"],
      ["service-desk", "category"],
      ["service-desk", "approval-step"],
      ["service-desk", "assignment-rule"],
    ]);
  });

  it("limits Employee/Job Field changes to recommendation dependencies", async () => {
    const invalidateQueries = vi.fn().mockResolvedValue(undefined);
    const client = { invalidateQueries } as unknown as QueryClient;

    await invalidateServiceDeskOrganizationDependencies(client);

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["service-desk", "assignment-rule", "recommendations"],
    });
  });
});
