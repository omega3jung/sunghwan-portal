// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { RichEditorPreset } from "@/components/custom/RichEditor";

import {
  ticketActionDraftFormDefaultValues,
  type TicketActionDraftFormValues,
} from "../../forms";
import type { TicketActionMode } from "../../types";
import { TicketActionForm } from "./TicketActionForm";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/lib/client/i18n", () => ({
  useLocalizedValue: () => (value: { en: string }) => value.en,
}));

vi.mock("@/components/custom/RichEditor", async (importOriginal) => {
  const original = await importOriginal<
    typeof import("@/components/custom/RichEditor")
  >();

  return {
    ...original,
    RichEditor: ({
      value,
      preset,
      onChange,
    }: {
      value: string;
      preset: RichEditorPreset;
      onChange: (value: string) => void;
    }) => (
      <div
        data-testid="rich-editor"
        data-image-enabled={preset.toolbar.flat().includes("image")}
      >
        <output data-testid="editor-value">{value}</output>
        <button type="button" onClick={() => onChange("Updated content")}>
          update-content
        </button>
        <button
          type="button"
          onClick={() => onChange('<p><img src="blob:image"></p>')}
        >
          add-embedded-image
        </button>
      </div>
    ),
  };
});

vi.mock("@/components/custom/FileAttachment", () => ({
  FileAttachment: ({
    form,
    name,
  }: {
    form: {
      setValue: (
        fieldName: string,
        value: File[],
        options: { shouldDirty: boolean },
      ) => void;
    };
    name: string;
  }) => (
    <button
      type="button"
      onClick={() =>
        form.setValue(name, [new File(["file"], "report.txt")], {
          shouldDirty: true,
        })
      }
    >
      attach-file
    </button>
  ),
}));

vi.mock("./actionFormFields/AssignFields", () => ({
  AssignFields: () => <div>assign-fields</div>,
}));

vi.mock("./actionFormFields/AdjustFields", () => ({
  AdjustFields: () => <div>adjust-fields</div>,
}));

vi.mock("./actionFormFields/MergeFields", () => ({
  MergeFields: () => <div>merge-fields</div>,
}));

afterEach(cleanup);

function FormHarness({
  mode,
  isRemoteMode = false,
}: {
  mode: TicketActionMode;
  isRemoteMode?: boolean;
}) {
  const form = useForm<TicketActionDraftFormValues>({
    defaultValues: ticketActionDraftFormDefaultValues,
  });

  return (
    <>
      <button
        type="button"
        onClick={() =>
          form.setError("content", {
            type: "validate",
            message: "actionTool.validation.contentRequired",
          })
        }
      >
        set-content-error
      </button>
      <TicketActionForm
        ticketId="ticket-1"
        mode={mode}
        form={form}
        isRemoteMode={isRemoteMode}
      />
    </>
  );
}

describe("TicketActionForm composition", () => {
  it.each([
    ["assign", "assign-fields"],
    ["adjust", "adjust-fields"],
    ["merge", "merge-fields"],
  ] as const)("renders only the fields owned by %s mode", (mode, marker) => {
    render(<FormHarness mode={mode} />);

    expect(screen.getByText(marker)).toBeInTheDocument();
    for (const otherMarker of [
      "assign-fields",
      "adjust-fields",
      "merge-fields",
    ]) {
      if (otherMarker !== marker) {
        expect(screen.queryByText(otherMarker)).not.toBeInTheDocument();
      }
    }
  });

  it.each(["approve", "decline"] as const)(
    "removes file and embedded-image attachment controls for %s",
    (mode) => {
      render(<FormHarness mode={mode} />);

      expect(screen.queryByText("attach-file")).not.toBeInTheDocument();
      expect(screen.getByTestId("rich-editor")).toHaveAttribute(
        "data-image-enabled",
        "false",
      );
    },
  );

  it("keeps attachment controls and image editing for a general action", () => {
    render(<FormHarness mode="comment" />);

    expect(screen.getByText("attach-file")).toBeInTheDocument();
    expect(screen.getByTestId("rich-editor")).toHaveAttribute(
      "data-image-enabled",
      "true",
    );
  });

  it("shows replacement notices only for REMOTE attachments that are present", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <FormHarness mode="comment" isRemoteMode />,
    );

    expect(
      screen.queryByText("ticketDraft.notice.remoteImagesReplaced"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("ticketDraft.notice.remoteFilesReplaced"),
    ).not.toBeInTheDocument();

    await user.click(screen.getByText("add-embedded-image"));
    await user.click(screen.getByText("attach-file"));

    expect(
      screen.getByText("ticketDraft.notice.remoteImagesReplaced"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("ticketDraft.notice.remoteFilesReplaced"),
    ).toBeInTheDocument();

    rerender(<FormHarness mode="comment" isRemoteMode={false} />);

    expect(
      screen.queryByText("ticketDraft.notice.remoteImagesReplaced"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("ticketDraft.notice.remoteFilesReplaced"),
    ).not.toBeInTheDocument();
  });

  it("updates the controlled form content through the editor", async () => {
    render(<FormHarness mode="comment" />);

    await userEvent.setup().click(screen.getByText("update-content"));

    expect(screen.getByTestId("editor-value")).toHaveTextContent(
      "Updated content",
    );
  });

  it("projects a translated content validation error", async () => {
    render(<FormHarness mode="comment" />);

    await userEvent.setup().click(screen.getByText("set-content-error"));

    expect(
      screen.getByText("actionTool.validation.contentRequired"),
    ).toBeInTheDocument();
  });
});
