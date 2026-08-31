// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ChangeEvent, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WorkSessionToolContent } from "./WorkSessionToolContent";

const workflowMocks = vi.hoisted(() => ({
  submitWorkSession: vi.fn(),
  mutationToast: vi.fn(),
  isPending: false,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/lib/client/toast", () => ({
  useMutationToast: () => workflowMocks.mutationToast,
}));

vi.mock("../../api/client", () => ({
  useSubmitTicketWorkSession: () => ({
    mutateAsync: workflowMocks.submitWorkSession,
    isPending: workflowMocks.isPending,
  }),
}));

vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: ReactNode }) => (
    <button type="button">{children}</button>
  ),
  TabsContent: ({ children, value }: { children: ReactNode; value: string }) =>
    value === "duration" ? <div>{children}</div> : null,
}));

vi.mock("./WorkSessionToolFields", () => ({
  WorkSessionDurationField: ({
    value,
    onChange,
    label,
    error,
  }: {
    value: unknown;
    onChange: (value: string) => void;
    label: string;
    error?: string;
  }) => (
    <label>
      {label}
      <input
        aria-label={label}
        value={typeof value === "string" || typeof value === "number" ? value : ""}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <span role="alert">{error}</span> : null}
    </label>
  ),
  WorkSessionStatusField: ({
    value,
    onValueChange,
    options,
  }: {
    value?: string;
    onValueChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
  }) => (
    <select
      aria-label="work-status"
      value={value}
      onChange={(event: ChangeEvent<HTMLSelectElement>) =>
        onValueChange(event.target.value)
      }
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
  WorkSessionNoteField: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <input
      aria-label="work-note"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
  WorkSessionDateTimeField: () => null,
}));

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  workflowMocks.isPending = false;
  workflowMocks.submitWorkSession.mockResolvedValue({ workSessionNo: 1 });
  workflowMocks.mutationToast.mockImplementation(
    async (promise: Promise<unknown>) => promise,
  );
});

describe("WorkSessionToolContent workflow", () => {
  it("requires a ticket and positive duration before submission", async () => {
    const { rerender } = render(
      <WorkSessionToolContent ticket={null} onClose={vi.fn()} />,
    );

    expect(
      screen.getByRole("button", { name: "action.workSession.submit" }),
    ).toBeDisabled();

    rerender(
      <WorkSessionToolContent
        ticket={{
          id: "ticket-1",
          status: "Working",
          workMinutes: 10,
          isCurrentWorker: true,
        }}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "action.workSession.submit" }),
    ).toBeDisabled();
    expect(workflowMocks.submitWorkSession).not.toHaveBeenCalled();
  });

  it("submits duration and note through the mutation pipeline then closes", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <WorkSessionToolContent
        ticket={{
          id: "ticket-1",
          status: "Working",
          workMinutes: 10,
          isCurrentWorker: true,
        }}
        onClose={onClose}
      />,
    );

    await user.type(screen.getByLabelText("field.durationMinutes"), "30");
    await user.type(screen.getByLabelText("work-note"), "Investigated logs");
    await user.click(
      screen.getByRole("button", { name: "action.workSession.submit" }),
    );

    await waitFor(() => {
      expect(workflowMocks.submitWorkSession).toHaveBeenCalledWith(
        expect.objectContaining({
          ticketId: "ticket-1",
          inputMode: "duration",
          durationMinutes: 30,
          note: "Investigated logs",
          startAt: expect.any(String),
          endAt: expect.any(String),
        }),
      );
      expect(onClose).toHaveBeenCalledOnce();
    });
    expect(workflowMocks.mutationToast).toHaveBeenCalledWith(
      expect.any(Promise),
      "update",
      "field.workSession",
    );
  });

  it("allows only the current worker to request a status transition", async () => {
    const user = userEvent.setup();
    const ticket = {
      id: "ticket-1",
      status: "Working" as const,
      workMinutes: 10,
      isCurrentWorker: true,
    };
    const { rerender } = render(
      <WorkSessionToolContent ticket={ticket} onClose={vi.fn()} />,
    );

    await user.selectOptions(screen.getByLabelText("work-status"), "Pending");
    await user.type(screen.getByLabelText("field.durationMinutes"), "5");
    await user.click(
      screen.getByRole("button", {
        name: "action.workSession.submitWithStatus",
      }),
    );

    await waitFor(() => {
      expect(workflowMocks.submitWorkSession).toHaveBeenCalledWith(
        expect.objectContaining({ nextStatus: "Pending" }),
      );
    });

    rerender(
      <WorkSessionToolContent
        ticket={{ ...ticket, isCurrentWorker: false }}
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByLabelText("work-status")).not.toBeInTheDocument();
  });

  it("keeps the tool open when work-session submission fails", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    workflowMocks.submitWorkSession.mockRejectedValue(new Error("failed"));
    render(
      <WorkSessionToolContent
        ticket={{
          id: "ticket-1",
          status: "Working",
          workMinutes: 10,
          isCurrentWorker: true,
        }}
        onClose={onClose}
      />,
    );

    await user.type(screen.getByLabelText("field.durationMinutes"), "15");
    await user.click(
      screen.getByRole("button", { name: "action.workSession.submit" }),
    );

    await waitFor(() => {
      expect(workflowMocks.submitWorkSession).toHaveBeenCalledOnce();
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("disables submission while a work-session command is pending", async () => {
    workflowMocks.isPending = true;
    render(
      <WorkSessionToolContent
        ticket={{
          id: "ticket-1",
          status: "Working",
          workMinutes: 10,
          isCurrentWorker: true,
        }}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "action.workSession.submitting" }),
    ).toBeDisabled();
  });
});
