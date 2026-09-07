// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TicketDetailPage } from "./TicketDetailPage";

const mocks = vi.hoisted(() => ({
  actionTool: vi.fn(),
  autoStart: vi.fn(),
  navigationLabel: vi.fn(),
  replace: vi.fn(),
  useDetailData: vi.fn(),
  useDetailViewModel: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("react-i18next", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-i18next")>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: PropsWithChildren) => <div>{children}</div>,
}));

vi.mock("@/feature/navigation/navigationBar/client", () => ({
  useNavigationBarCurrentLabel: mocks.navigationLabel,
}));

vi.mock("@/feature/serviceDesk/shared/client", () => ({
  TicketAttachmentList: () => <div>attachments</div>,
}));

vi.mock("@/feature/serviceDesk/ticket/client", () => ({
  useAutoStartAssignedTicketOnView: mocks.autoStart,
}));

vi.mock("@/feature/serviceDesk/ticketAction/client", () => ({
  TicketActionList: () => <div>action-list</div>,
  TicketActionTool: (props: unknown) => {
    mocks.actionTool(props);
    return <div>action-tool</div>;
  },
}));

vi.mock("../hooks/useTicketDetailData", () => ({
  useTicketDetailData: mocks.useDetailData,
}));

vi.mock("../hooks/useTicketDetailViewModel", () => ({
  useTicketDetailViewModel: mocks.useDetailViewModel,
}));

vi.mock(".", () => ({
  TicketHeader: () => <div>ticket-header</div>,
  TicketHistorySheet: () => <div>history-sheet</div>,
  TicketRecentActivity: () => <div>recent-activity</div>,
  TicketSummary: () => <div>ticket-summary</div>,
  TicketDetailsAside: () => <div>ticket-aside</div>,
  TicketDetailsAsideSkeleton: () => <div>aside-skeleton</div>,
  TicketDetailSkeleton: () => <div>detail-skeleton</div>,
}));

const emptyViewModel = {
  language: "en",
  dateLocale: {},
  categories: [],
  assigneeOptions: [],
  recipientOptions: [],
  ticketAssignees: [],
  requesterName: undefined,
  activeActions: [],
  latestAction: undefined,
  latestHistory: undefined,
  latestActionOwnerName: undefined,
};

afterEach(cleanup);

describe("TicketDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useDetailViewModel.mockReturnValue(emptyViewModel);
  });

  it("shows a detail skeleton while ticket data is loading", () => {
    mocks.useDetailData.mockReturnValue({
      ticket: undefined,
      ticketActions: undefined,
      ticketHistories: undefined,
      isTicketLoading: true,
      isTicketActionsLoading: true,
      isTicketHistoriesLoading: true,
    });

    render(<TicketDetailPage ticketId="ticket-1" />);

    expect(screen.getByText("detail-skeleton")).not.toBeNull();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("redirects to the list when the loaded ticket is unavailable", async () => {
    mocks.useDetailData.mockReturnValue({
      ticket: undefined,
      ticketActions: [],
      ticketHistories: [],
      isTicketLoading: false,
      isTicketActionsLoading: false,
      isTicketHistoriesLoading: false,
    });

    const { container } = render(<TicketDetailPage ticketId="missing" />);

    expect(container.firstChild).toBeNull();
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/service-desk"));
  });

  it("connects the loaded ticket and view model to the action workflow", () => {
    const ticket = {
      id: "ticket-1",
      ticketNumber: "SP-2026-0001",
      content: "<p>Request</p>",
      files: [],
      images: [],
    };
    mocks.useDetailData.mockReturnValue({
      ticket,
      ticketActions: [{ actionNo: 1 }],
      ticketHistories: [{ historyNo: 1 }],
      isTicketLoading: false,
      isTicketActionsLoading: false,
      isTicketHistoriesLoading: false,
    });
    mocks.useDetailViewModel.mockReturnValue({
      ...emptyViewModel,
      categories: [{ id: "category-1" }],
      assigneeOptions: [{ value: "worker" }],
    });

    render(<TicketDetailPage ticketId="ticket-1" />);

    expect(mocks.navigationLabel).toHaveBeenCalledWith("SP-2026-0001");
    expect(mocks.autoStart).toHaveBeenCalledWith({ ticket });
    expect(mocks.actionTool).toHaveBeenCalledWith({
      ticketId: "ticket-1",
      ticket,
      users: [{ value: "worker" }],
      categories: [{ id: "category-1" }],
    });
    expect(screen.getByText("ticket-summary")).not.toBeNull();
    expect(screen.getByText("recent-activity")).not.toBeNull();
  });
});
