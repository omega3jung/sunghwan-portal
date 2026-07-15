import type { FieldPath, PathValue, UseFormReturn } from "react-hook-form";

import { NS } from "@/lib/application/i18n";

import type { TicketActionDraftFormValues } from "../../forms";
import type { TicketActionMode } from "../../types";

export type Translate = (
  key: string,
  options?: Record<string, unknown>,
) => string;

export const EDITOR_PLACEHOLDER_KEY: Record<TicketActionMode, string> = {
  approve: "actionTool.form.editorPlaceholder.approve",
  decline: "actionTool.form.editorPlaceholder.decline",
  comment: "actionTool.form.editorPlaceholder.comment",
  note: "actionTool.form.editorPlaceholder.note",
  assign: "actionTool.form.editorPlaceholder.assign",
  assignSelf: "actionTool.form.editorPlaceholder.assignSelf",
  adjust: "actionTool.form.editorPlaceholder.adjust",
  merge: "actionTool.form.editorPlaceholder.merge",
  reject: "actionTool.form.editorPlaceholder.reject",
  reopen: "actionTool.form.editorPlaceholder.reopen",
  resubmit: "actionTool.form.editorPlaceholder.resubmit",
  cancel: "actionTool.form.editorPlaceholder.cancel",
};

export function getFieldGroupClassName(mode: TicketActionMode) {
  switch (mode) {
    case "assign":
      return "grid grid-cols-1 gap-3 md:grid-cols-3";
    case "adjust":
      return "grid grid-cols-1 gap-3 md:grid-cols-4";
    default:
      return undefined;
  }
}

export function getFieldClassName(mode: TicketActionMode) {
  switch (mode) {
    case "assign":
      return "col-span-full md:col-span-3";
    case "adjust":
      return "col-span-full md:col-span-4";
    default:
      return undefined;
  }
}

export function getFieldLabel(mode: TicketActionMode, t: Translate) {
  switch (mode) {
    case "approve":
      return t("actionTool.form.approvalNoteLabel");
    case "decline":
      return t("actionTool.form.declineReasonLabel");
    case "comment":
      return t("field.comment", { ns: NS.common });
    case "note":
      return t("action.note");
    default:
      return t("actionTool.form.editorLabel");
  }
}

export function isControlledEditorMode(mode: TicketActionMode) {
  return (
    mode === "assign" ||
    mode === "adjust" ||
    mode === "merge" ||
    mode === "approve" ||
    mode === "decline" ||
    mode === "reject"
  );
}

export const setActionFieldValue = <
  TFieldName extends FieldPath<TicketActionDraftFormValues>,
>(
  form: UseFormReturn<TicketActionDraftFormValues>,
  fieldName: TFieldName,
  value: PathValue<TicketActionDraftFormValues, TFieldName>,
) => {
  form.setValue(fieldName, value, {
    shouldDirty: true,
    shouldValidate:
      form.formState.isSubmitted ||
      Boolean(form.getFieldState(fieldName).error),
  });
};

export function resolveActionErrorMessage(
  message: string | undefined,
  t: Translate,
) {
  return message ? t(message) : "";
}
