// @vitest-environment jsdom

import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TicketSearchResponse } from "@/lib/application/contracts/serviceDesk";

import { useServiceDeskViewModel } from "./useServiceDeskViewModel";

const mocks = vi.hoisted(() => ({
  useCategoryListQuery: vi.fn(),
  useCurrentSession: vi.fn(),
  useEmployeeListQuery: vi.fn(),
}));

vi.mock("@/feature/auth/session/client", () => ({
  useCurrentSession: mocks.useCurrentSession,
}));

vi.mock("@/feature/organization/employee/client", () => ({
  useEmployeeListQuery: mocks.useEmployeeListQuery,
}));

vi.mock("@/feature/serviceDesk/category/client", () => ({
  useServiceDeskCategoryListQuery: mocks.useCategoryListQuery,
}));

vi.mock("@/feature/user/preference/client", () => ({
  useCurrentPreference: () => ({ current: { language: "en" } }),
}));

vi.mock("@/lib/client/i18n", () => ({
  useLocalizedValue: () => (value: Record<string, unknown>) => value.en,
}));

afterEach(cleanup);

describe("useServiceDeskViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useCurrentSession.mockReturnValue({
      current: { user: { companyId: 22 } },
    });
    mocks.useCategoryListQuery.mockReturnValue({
      data: [
        {
          categories: [
            {
              id: "category-1",
              name: { en: "Account" },
              subCategories: [
                null,
                { id: "subcategory-1", name: { en: "Login" } },
              ],
            },
            null,
          ],
        },
      ],
    });
    mocks.useEmployeeListQuery.mockReturnValue({
      data: [
        {
          username: "worker",
          email: "worker@example.com",
          name: { en: { first: "Work", last: "Er" } },
          imageUrl: "/worker.png",
        },
      ],
    });
  });

  it("scopes supporting data to the effective company and builds UI options", () => {
    const ticketSearchResult = {
      facets: {
        requesters: [
          {
            username: "requester",
            name: { en: { first: "Request", last: "Er" } },
            image: null,
          },
        ],
        assignees: [
          {
            username: "assignee",
            name: { en: { first: "Assign", last: "Ee" } },
            image: "/assignee.png",
          },
        ],
      },
    } as TicketSearchResponse;

    const { result } = renderHook(() =>
      useServiceDeskViewModel({ ticketSearchResult }),
    );

    expect(JSON.stringify(mocks.useCategoryListQuery.mock.calls[0][0])).toContain("22");
    expect(JSON.stringify(mocks.useEmployeeListQuery.mock.calls[0][0])).toContain("22");
    expect(result.current.categories).toHaveLength(1);
    expect(result.current.categories[0].subCategories).toEqual([
      expect.objectContaining({ id: "subcategory-1" }),
    ]);
    expect(result.current.requesterOptions[0]).toMatchObject({
      value: "requester",
      label: "Request Er",
    });
    expect(result.current.assigneeOptions[0]).toMatchObject({
      value: "assignee",
      label: "Assign Ee",
    });
    expect(result.current.recipientOptions[0]).toMatchObject({
      value: "worker@example.com",
      label: "Work Er",
    });
  });

  it("does not request company-scoped supporting data before identity is ready", () => {
    mocks.useCurrentSession.mockReturnValue({ current: { user: null } });

    const { result } = renderHook(() => useServiceDeskViewModel({}));

    expect(mocks.useCategoryListQuery).toHaveBeenCalledWith(undefined);
    expect(mocks.useEmployeeListQuery).toHaveBeenCalledWith(undefined);
    expect(result.current.requesterOptions).toEqual([]);
    expect(result.current.assigneeOptions).toEqual([]);
  });
});
