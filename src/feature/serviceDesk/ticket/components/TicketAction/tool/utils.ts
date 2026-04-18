import type { FieldPath, PathValue, UseFormReturn } from "react-hook-form";

import type { TicketActionDraftFormValues } from "@/feature/serviceDesk/ticket/forms/action";
import { NS } from "@/lib/i18n";

export type TicketActionFormMode =
  | "comment"
  | "note"
  | "assign"
  | "reject"
  | "merge"
  | "adjust";

export type Translate = (
  key: string,
  options?: Record<string, unknown>,
) => string;

export const EDITOR_PLACEHOLDER_KEY: Record<TicketActionFormMode, string> = {
  comment: "actionTool.form.editorPlaceholder.comment",
  note: "actionTool.form.editorPlaceholder.note",
  assign: "actionTool.form.editorPlaceholder.assign",
  adjust: "actionTool.form.editorPlaceholder.adjust",
  merge: "actionTool.form.editorPlaceholder.merge",
  reject: "actionTool.form.editorPlaceholder.reject",
};

export function getFieldGroupClassName(mode: TicketActionFormMode) {
  switch (mode) {
    case "assign":
      return "grid grid-cols-3";
    case "adjust":
      return "grid grid-cols-4";
    default:
      return undefined;
  }
}

export function getFieldClassName(mode: TicketActionFormMode) {
  switch (mode) {
    case "assign":
      return "col-span-3";
    case "adjust":
      return "col-span-4";
    default:
      return undefined;
  }
}

export function getFieldLabel(mode: TicketActionFormMode, t: Translate) {
  switch (mode) {
    case "comment":
      return t("field.comment", { ns: NS.common });
    case "note":
      return t("action.note");
    default:
      return t("actionTool.form.editorLabel");
  }
}

export function isControlledEditorMode(mode: TicketActionFormMode) {
  return (
    mode === "assign" ||
    mode === "adjust" ||
    mode === "merge" ||
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
