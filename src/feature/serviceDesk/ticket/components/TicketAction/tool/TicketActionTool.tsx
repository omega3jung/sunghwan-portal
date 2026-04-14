"use client";

import { type Editor } from "@tiptap/react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type {
  MainCategory,
  TicketActionType,
  TicketDetail,
} from "@/domain/serviceDesk";
import { useTicketActionMutation } from "@/feature/serviceDesk/ticket/api/action";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { NS } from "@/lib/i18n";
import type { ImageValueLabel } from "@/shared/types";
import { useMutationToast } from "@/shared/utils";

import { TicketActionForm } from "./TicketActionForm";
import { TicketActionToolFooter } from "./TicketActionToolFooter";
import { TicketActionToolHeader } from "./TicketActionToolHeader";
import { TicketActionToolLauncher } from "./TicketActionToolLauncher";

/**
 * TicketActionTool
 *
 * 역할:
 * - action mode 관리
 * - form state orchestration
 * - actionType → mutation 연결 (향후)
 * - UI entry point
 */

export type TicketActionMode =
  | "idle"
  | "comment"
  | "note"
  | "assign"
  | "reject"
  | "merge"
  | "adjust";

type TicketActionToolProps = {
  ticketId: string;
  ticket?: TicketDetail | null;
  users?: ImageValueLabel[];
  categories?: MainCategory[];
};

const ACTION_TYPE_BY_MODE: Record<
  Exclude<TicketActionMode, "idle">,
  TicketActionType
> = {
  comment: "COMMENT",
  note: "NOTE",
  assign: "ASSIGN",
  reject: "REJECT",
  merge: "MERGE",
  adjust: "ADJUST",
};

export function TicketActionTool({
  ticketId,
  ticket,
  users = [],
  categories = [],
}: TicketActionToolProps) {
  const { t } = useTranslation(NS.serviceDesk);
  const { current } = useCurrentSession();
  const mutationToast = useMutationToast();
  const { mutateAsync: createAction, isPending } = useTicketActionMutation();

  const [mode, setMode] = useState<TicketActionMode>("idle");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [assignContent, setAssignContent] = useState("");
  const [assignAssigneeIds, setAssignAssigneeIds] = useState<string[]>([]);
  const [assignCategoryId, setAssignCategoryId] = useState("");
  const [rejectContent, setRejectContent] = useState("");
  const [mergeContent, setMergeContent] = useState("");
  const [mergeTargetTicketId, setMergeTargetTicketId] = useState("");
  const [adjustContent, setAdjustContent] = useState("");
  const [adjustPriority, setAdjustPriority] = useState("");
  const [adjustRiskLevel, setAdjustRiskLevel] = useState("");
  const [adjustDueDate, setAdjustDueDate] = useState<Date | undefined>();

  const currentUser = current.user;
  const currentUserOption = useMemo(
    () => users.find((user) => user.value === currentUser?.id),
    [currentUser?.id, users],
  );

  const currentUserName =
    currentUserOption?.label ||
    currentUser?.displayName ||
    t("actionTool.currentUserFallback");
  const currentUserEmail =
    currentUserOption?.displayName || currentUser?.email || "";
  const currentUserImage = currentUserOption?.image || currentUser?.image;
  const isOpen = mode !== "idle";

  useEffect(() => {
    if (mode === "assign") {
      setAssignAssigneeIds(ticket?.assigneeIds ?? []);
      setAssignCategoryId(ticket?.categoryId ?? "");
    }

    if (mode === "adjust") {
      setAdjustPriority(ticket?.priority ?? "");
      setAdjustRiskLevel(ticket?.riskLevel ?? "");
      setAdjustDueDate(ticket?.dueAt ? new Date(ticket.dueAt) : undefined);
    }
  }, [
    mode,
    ticket?.assigneeIds,
    ticket?.categoryId,
    ticket?.dueAt,
    ticket?.priority,
    ticket?.riskLevel,
  ]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    editor?.commands.focus("end");
  }, [editor, isOpen]);

  const resetDraft = () => {
    editor?.commands.clearContent();
    setErrorMessage("");
    setAssignContent("");
    setAssignAssigneeIds(ticket?.assigneeIds ?? []);
    setAssignCategoryId(ticket?.categoryId ?? "");
    setRejectContent("");
    setMergeContent("");
    setMergeTargetTicketId("");
    setAdjustContent("");
    setAdjustPriority(ticket?.priority ?? "");
    setAdjustRiskLevel(ticket?.riskLevel ?? "");
    setAdjustDueDate(ticket?.dueAt ? new Date(ticket.dueAt) : undefined);
  };

  const openMode = (nextMode: Exclude<TicketActionMode, "idle">) => {
    setMode(nextMode);
    setErrorMessage("");
  };

  const closeMode = () => {
    resetDraft();
    setMode("idle");
  };

  const helperText = mode === "idle" ? "" : t(`actionTool.helper.${mode}`);
  const submitLabel = mode === "idle" ? "" : t(`actionTool.submit.${mode}`);
  const actionContent =
    mode === "assign"
      ? assignContent
      : mode === "reject"
        ? rejectContent
        : mode === "merge"
          ? mergeContent
          : mode === "adjust"
            ? adjustContent
            : "";

  const handleActionContentChange = (value: string) => {
    if (mode === "assign") {
      setAssignContent(value);
      return;
    }

    if (mode === "reject") {
      setRejectContent(value);
      return;
    }

    if (mode === "merge") {
      setMergeContent(value);
      return;
    }

    if (mode === "adjust") {
      setAdjustContent(value);
    }
  };

  const handleSubmit = async () => {
    if (!currentUser || mode === "idle") {
      return;
    }

    const plainText = editor?.getText().trim() ?? "";

    if (!plainText) {
      setErrorMessage(t("comment.editor.validationEmpty"));
      editor?.commands.focus("start");
      return;
    }

    const promise = createAction({
      ticketId,
      actionType: ACTION_TYPE_BY_MODE[mode],
      values: {
        id: currentUser.id,
        actionType: ACTION_TYPE_BY_MODE[mode],
        content: editor?.getHTML() ?? "",
        files: [],
        images: [],
      },
    });

    await mutationToast(promise, "create", "comment");
    closeMode();
  };

  const disableSubmit =
    isPending || (mode === "comment" || mode === "note" ? !editor : false);

  return (
    <section className="space-y-3">
      <TicketActionToolLauncher hidden={isOpen} onOpen={openMode} />

      {isOpen ? (
        <div className="space-y-4 rounded-lg border border-border/50 p-4">
          <TicketActionToolHeader
            currentUserEmail={currentUserEmail}
            currentUserImage={currentUserImage}
            currentUserName={currentUserName}
            mode={mode}
          />

          <TicketActionForm
            mode={mode}
            editor={editor}
            errorMessage={errorMessage}
            onEditorReady={setEditor}
            onTextChange={(hasText) => {
              if (errorMessage && hasText) {
                setErrorMessage("");
              }
            }}
            assigneeIds={assignAssigneeIds}
            categoryId={assignCategoryId}
            content={actionContent}
            categories={categories}
            users={users}
            onAssigneeAdd={(value) =>
              setAssignAssigneeIds((currentIds) =>
                currentIds.includes(value)
                  ? currentIds
                  : [...currentIds, value],
              )
            }
            onAssigneeRemove={(value) =>
              setAssignAssigneeIds((currentIds) =>
                currentIds.filter((item) => item !== value),
              )
            }
            onCategoryChange={setAssignCategoryId}
            onContentChange={handleActionContentChange}
            targetTicketId={mergeTargetTicketId}
            onTargetTicketIdChange={setMergeTargetTicketId}
            priority={adjustPriority}
            riskLevel={adjustRiskLevel}
            dueDate={adjustDueDate}
            onPriorityChange={setAdjustPriority}
            onRiskLevelChange={setAdjustRiskLevel}
            onDueDateChange={setAdjustDueDate}
          />

          <TicketActionToolFooter
            disabled={disableSubmit}
            errorMessage={errorMessage}
            helperText={helperText}
            isPending={isPending}
            submitLabel={submitLabel}
            onCancel={closeMode}
            onSubmit={handleSubmit}
          />
        </div>
      ) : null}
    </section>
  );
}
