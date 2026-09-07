// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { InsightsPage } from "./InsightsPage";

const mocks = vi.hoisted(() => ({
  activeFilter: vi.fn(),
  chartGrid: vi.fn(),
  currentCompanyId: 1,
  push: vi.fn(),
  searchState: undefined as unknown,
  startRouteLoading: vi.fn(),
  ticketQuery: vi.fn(),
  ticketResults: vi.fn(),
  useInsightsViewModel: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/components/layout/RouteLoading", () => ({
  useRouteLoading: () => ({ startRouteLoadingForHref: mocks.startRouteLoading }),
}));

vi.mock("@/feature/auth/session/client", () => ({
  useCurrentSession: () => ({
    current: { user: { companyId: mocks.currentCompanyId } },
  }),
}));

vi.mock("@/feature/serviceDesk/ticket/client", () => ({
  useServiceDeskTicketSearchQuery: mocks.ticketQuery,
}));

vi.mock("@/feature/user/preference/client", () => ({
  useCurrentPreference: () => ({ current: { language: "en" } }),
}));

vi.mock("../hooks/useInsightsSearchState", () => ({
  useInsightsSearchState: () => mocks.searchState,
}));

vi.mock("../hooks/useInsightsViewModel", () => ({
  useInsightsViewModel: mocks.useInsightsViewModel,
}));

vi.mock("./InsightsToolbar", () => ({
  InsightsToolbar: () => <div>toolbar</div>,
}));

vi.mock("./InsightsChartGrid", () => ({
  InsightsChartGrid: (props: {
    showTenantChart: boolean;
    onChartSelect: (type: "tenant", item: { value: string; label: string; count: number }) => void;
  }) => {
    mocks.chartGrid(props);
    return (
      <div>
        chart-grid
        {props.showTenantChart ? (
          <button
            onClick={() =>
              props.onChartSelect("tenant", {
                value: "tenant-1",
                label: "Customer",
                count: 1,
              })
            }
          >
            select-tenant-chart
          </button>
        ) : null}
      </div>
    );
  },
}));

vi.mock("./InsightsActiveFilter", () => ({
  InsightsActiveFilter: (props: unknown) => {
    mocks.activeFilter(props);
    return <div>active-filter</div>;
  },
}));

vi.mock("./InsightsTicketResults", () => ({
  InsightsTicketResults: (props: { onTicketSelected: (id: string) => void }) => {
    mocks.ticketResults(props);
    return <button onClick={() => props.onTicketSelected("ticket-1")}>select-result</button>;
  },
}));

const criteria = {
  keyword: "network",
  category: [],
  status: [],
  assignee: [],
  requester: [],
  priority: [],
  riskLevel: [],
  period: {
    type: "last_3month",
    dateRange: {
      from: new Date("2026-06-01T00:00:00Z"),
      to: new Date("2026-09-01T00:00:00Z"),
    },
  },
};

afterEach(cleanup);

describe("InsightsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.currentCompanyId = 1;
    mocks.searchState = {
      hydrated: true,
      criteria,
      scope: "PORTAL",
      currentPeriodType: "last_3month",
      pickerRange: criteria.period.dateRange,
      handleScopeChange: vi.fn(),
      handlePeriodChange: vi.fn(),
      handleRangeChange: vi.fn(),
    };
    mocks.ticketQuery.mockReturnValue({
      data: { items: [{ id: "ticket-1" }], facets: { assignees: [] } },
      isLoading: false,
      refetch: vi.fn(),
    });
    mocks.useInsightsViewModel.mockImplementation(({ tickets, chartFilter }) => ({
      chartData: {
        status: [], category: [], department: [], tenant: [], assignee: [], sla: [],
      },
      filteredTickets: tickets,
      chartBaseDescription: "summary",
      ticketCountDescription: "count",
      filterFieldLabel: chartFilter?.type ?? null,
      showFilteredEmpty: false,
    }));
  });

  it("queries hydrated search state and exposes tenant insights only to the owner company", async () => {
    const { rerender } = render(<InsightsPage />);

    expect(mocks.ticketQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        criteria: expect.objectContaining({ keyword: "network", cat_scope: "PORTAL" }),
        page: 1,
        pageSize: 500,
        enabled: true,
      }),
    );
    expect(mocks.chartGrid).toHaveBeenLastCalledWith(
      expect.objectContaining({ showTenantChart: true }),
    );

    fireEvent.click(screen.getByText("select-tenant-chart"));
    expect(mocks.useInsightsViewModel).toHaveBeenLastCalledWith(
      expect.objectContaining({
        chartFilter: { type: "tenant", value: "tenant-1", label: "Customer" },
      }),
    );

    mocks.currentCompanyId = 22;
    rerender(<InsightsPage />);
    await waitFor(() =>
      expect(mocks.useInsightsViewModel).toHaveBeenLastCalledWith(
        expect.objectContaining({ chartFilter: null }),
      ),
    );
    expect(mocks.chartGrid).toHaveBeenLastCalledWith(
      expect.objectContaining({ showTenantChart: false }),
    );
  });

  it("keeps the query disabled before hydration and routes result selection", () => {
    mocks.searchState = {
      ...(mocks.searchState as Record<string, unknown>),
      hydrated: false,
    };

    render(<InsightsPage />);

    expect(mocks.ticketQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false }),
    );
    fireEvent.click(screen.getByText("select-result"));
    expect(mocks.startRouteLoading).toHaveBeenCalledWith("/service-desk/ticket-1");
    expect(mocks.push).toHaveBeenCalledWith("/service-desk/ticket-1");
  });
});
