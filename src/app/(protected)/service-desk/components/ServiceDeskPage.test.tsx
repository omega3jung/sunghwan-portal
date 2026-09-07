// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ServiceDeskPage } from "./ServiceDeskPage";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  refetch: vi.fn(),
  startRouteLoading: vi.fn(),
  ticketList: vi.fn(),
  ticketPagination: vi.fn(),
  ticketSearchCriteria: vi.fn(),
  useSearchState: vi.fn(),
  useViewModel: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("react-i18next", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-i18next")>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/components/layout/RouteLoading", () => ({
  useRouteLoading: () => ({ startRouteLoadingForHref: mocks.startRouteLoading }),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/button-group", () => ({
  ButtonGroup: ({ children }: PropsWithChildren) => <div>{children}</div>,
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: PropsWithChildren) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: PropsWithChildren) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: PropsWithChildren) => <div>{children}</div>,
  DropdownMenuGroup: ({ children }: PropsWithChildren) => <div>{children}</div>,
  DropdownMenuLabel: ({ children }: PropsWithChildren) => <div>{children}</div>,
  DropdownMenuCheckboxItem: ({ children, onClick }: PropsWithChildren<{ onClick?: () => void }>) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: PropsWithChildren) => <div>{children}</div>,
}));

vi.mock("@/feature/serviceDesk/ticket/client", () => ({
  TicketList: (props: { onTicketSelected: (id: string) => void }) => {
    mocks.ticketList(props);
    return <button onClick={() => props.onTicketSelected("ticket-1")}>select-ticket</button>;
  },
  TicketListPagination: (props: unknown) => {
    mocks.ticketPagination(props);
    return <div>pagination</div>;
  },
}));

vi.mock("@/feature/serviceDesk/ticketDraft/client", () => ({
  CreateTicketDialog: () => <div>create-ticket</div>,
}));

vi.mock("@/feature/serviceDesk/ticketSearch/client", () => ({
  TicketSearchCriteria: (props: unknown) => {
    mocks.ticketSearchCriteria(props);
    return <div>search-criteria</div>;
  },
}));

vi.mock("../hooks/useServiceDeskSearchState", () => ({
  useServiceDeskSearchState: mocks.useSearchState,
}));

vi.mock("../hooks/useServiceDeskViewModel", () => ({
  useServiceDeskViewModel: mocks.useViewModel,
}));

afterEach(cleanup);

describe("ServiceDeskPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useSearchState.mockReturnValue({
      form: { id: "search-form" },
      tickets: [{ id: "ticket-1" }],
      ticketSearchResult: { items: [{ id: "ticket-1" }] },
      totalCount: 11,
      isTicketListLoading: true,
      page: 2,
      pageSize: 10,
      order: "desc",
      scope: "INTERNAL",
      sort: "ticketNumber",
      submitSearch: vi.fn(),
      changeSort: vi.fn(),
      toggleOrder: vi.fn(),
      changeScope: vi.fn(),
      changePage: vi.fn(),
      refetchTickets: mocks.refetch,
    });
    mocks.useViewModel.mockReturnValue({
      language: "en",
      categories: [{ id: "category-1" }],
      requesterOptions: [{ value: "requester" }],
      assigneeOptions: [{ value: "assignee" }],
      recipientOptions: [{ value: "recipient" }],
    });
  });

  it("connects list/search state to feature components and ticket navigation", () => {
    render(<ServiceDeskPage />);

    expect(mocks.ticketList).toHaveBeenCalledWith(
      expect.objectContaining({
        tickets: [{ id: "ticket-1" }],
        language: "en",
        isLoading: true,
      }),
    );
    expect(mocks.ticketPagination).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, pageSize: 10, totalCount: 11, disabled: true }),
    );
    expect(mocks.ticketSearchCriteria).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: [{ id: "category-1" }],
        requesters: [{ value: "requester" }],
        assignees: [{ value: "assignee" }],
      }),
    );

    fireEvent.click(screen.getByText("select-ticket"));

    expect(mocks.startRouteLoading).toHaveBeenCalledWith("/service-desk/ticket-1");
    expect(mocks.push).toHaveBeenCalledWith("/service-desk/ticket-1");
  });
});
