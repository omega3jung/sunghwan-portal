"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type Editor } from "@tiptap/react";
import { useEffect, useMemo, useState } from "react";
import { type FieldErrors, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type { MainCategory, TicketDetail } from "@/domain/serviceDesk";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { NS } from "@/lib/i18n";
import type { ImageValueLabel } from "@/shared/types";
import { useMutationToast } from "@/shared/utils";

import { useTicketActionMutation } from "../../api";
import {
  ACTION_ADJUST_NO_CHANGES_KEY,
  buildTicketActionPayload,
  createTicketActionDraftValues,
  hasTicketActionAdjustChanges,
  ticketActionDraftFormDefaultValues,
  ticketActionDraftFormSchema,
  type TicketActionDraftFormValues,
} from "../../forms";
import { mapActionModeToActionType } from "../../mapper";
import type { TicketActionMode } from "../../types";
import { TicketActionForm } from "./TicketActionForm";
import { TicketActionToolFooter } from "./TicketActionToolFooter";
import { TicketActionToolHeader } from "./TicketActionToolHeader";
import { TicketActionToolLauncher } from "./TicketActionToolLauncher";

/**
 * TicketActionTool
 *
 * ??븷:
 * - action mode 愿由? * - form state orchestration
 * - actionType ??mutation ?곌껐 (?ν썑)
 * - UI entry point
 */

type TicketActionToolProps = {
  ticketId: string;
  ticket?: TicketDetail | null;
  users?: ImageValueLabel[];
  categories?: MainCategory[];
};

function resolveFormErrorMessage(
  errors: FieldErrors<TicketActionDraftFormValues>,
) {
  const errorFieldNames: Array<keyof TicketActionDraftFormValues> = [
    "content",
    "assigneeIds",
    "targetTicketId",
    "priority",
    "riskLevel",
    "dueAt",
  ];

  for (const fieldName of errorFieldNames) {
    const error = errors[fieldName];

    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      return error.message;
    }
  }

  return "";
}

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
  const actionForm = useForm<TicketActionDraftFormValues>({
    resolver: zodResolver(ticketActionDraftFormSchema),
    defaultValues: ticketActionDraftFormDefaultValues,
  });

  const [mode, setMode] = useState<TicketActionMode>("idle");
  const [editor, setEditor] = useState<Editor | null>(null);

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
  const errorMessageKey = resolveFormErrorMessage(actionForm.formState.errors);
  const errorMessage = errorMessageKey ? t(errorMessageKey) : "";

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    editor?.commands.focus("end");
  }, [editor, isOpen]);

  const resetDraft = () => {
    actionForm.reset(ticketActionDraftFormDefaultValues);
  };

  const openMode = (nextMode: Exclude<TicketActionMode, "idle">) => {
    actionForm.reset(
      createTicketActionDraftValues(
        mapActionModeToActionType(nextMode),
        ticket,
      ),
    );
    setMode(nextMode);
  };

  const closeMode = () => {
    resetDraft();
    setMode("idle");
  };

  const helperText = mode === "idle" ? "" : t(`actionTool.helper.${mode}`);
  const submitLabel = mode === "idle" ? "" : t(`actionTool.submit.${mode}`);

  const handleSubmit = actionForm.handleSubmit(
    async (values) => {
      if (!currentUser || mode === "idle") {
        return;
      }

      if (
        values.actionType === "ADJUST" &&
        !hasTicketActionAdjustChanges(values, ticket)
      ) {
        actionForm.setError("priority", {
          type: "validate",
          message: ACTION_ADJUST_NO_CHANGES_KEY,
        });
        actionForm.setError("riskLevel", {
          type: "validate",
          message: ACTION_ADJUST_NO_CHANGES_KEY,
        });
        actionForm.setError("dueAt", {
          type: "validate",
          message: ACTION_ADJUST_NO_CHANGES_KEY,
        });
        return;
      }

      const payload = buildTicketActionPayload({
        userId: currentUser.id,
        values,
      });

      const promise = createAction({
        ticketId,
        actionType: payload.actionType,
        values: payload,
      });

      await mutationToast(promise, "create", "comment");
      closeMode();
    },
    (errors) => {
      if (errors.content) {
        editor?.commands.focus("start");
      }
    },
  );

  const disableSubmit = isPending || !editor;

  if (!ticket) return null;

  return (
    <section className="space-y-3">
      <TicketActionToolLauncher
        hidden={isOpen}
        onOpen={openMode}
        ticket={ticket}
      />

      {isOpen ? (
        <div className="space-y-4 rounded-lg border border-border/50 p-4">
          <TicketActionToolHeader
            currentUserEmail={currentUserEmail}
            currentUserImage={currentUserImage}
            currentUserName={currentUserName}
            mode={mode}
          />

          <TicketActionForm
            ticketId={ticketId}
            originalCategoryId={ticket?.categoryId}
            mode={mode}
            form={actionForm}
            onEditorReady={setEditor}
            categories={categories}
            users={users}
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
