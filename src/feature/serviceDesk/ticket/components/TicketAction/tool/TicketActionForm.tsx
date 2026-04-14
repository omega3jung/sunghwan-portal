import type { Editor } from "@tiptap/react";
import { useTranslation } from "react-i18next";

import { FieldGroup } from "@/components/ui/field";
import type { MainCategory } from "@/domain/serviceDesk";
import { NS } from "@/lib/i18n";
import { useLocalizedValue } from "@/shared/hooks";
import type { ImageValueLabel } from "@/shared/types";

import { AdjustFields } from "./actionFormFields/AdjustFields";
import { AssignFields } from "./actionFormFields/AssignFields";
import { EditorField } from "./actionFormFields/EditorField";
import { MergeFields } from "./actionFormFields/MergeFields";
import {
  getFieldClassName,
  getFieldGroupClassName,
  getFieldLabel,
  isControlledEditorMode,
  type TicketActionFormMode,
} from "./actionFormFields/utils";

type TicketActionFormProps = {
  mode: TicketActionFormMode;
  editor?: Editor | null;
  errorMessage?: string;
  onEditorReady?: (editor: Editor | null) => void;
  onTextChange?: (hasText: boolean) => void;
  assigneeIds?: string[];
  categoryId?: string;
  content?: string;
  categories?: MainCategory[];
  users?: ImageValueLabel[];
  onAssigneeAdd?: (value: string) => void;
  onAssigneeRemove?: (value: string) => void;
  onCategoryChange?: (value: string) => void;
  onContentChange?: (value: string) => void;
  priority?: string;
  riskLevel?: string;
  dueDate?: Date;
  onPriorityChange?: (value: string) => void;
  onRiskLevelChange?: (value: string) => void;
  onDueDateChange?: (value?: Date) => void;
  targetTicketId?: string;
  onTargetTicketIdChange?: (value: string) => void;
};

export function TicketActionForm(props: TicketActionFormProps) {
  const { t } = useTranslation(NS.serviceDesk);
  const tLocal = useLocalizedValue();
  const { mode } = props;

  return (
    <FieldGroup className={getFieldGroupClassName(mode)}>
      {mode === "assign" ? (
        <AssignFields
          assigneeIds={props.assigneeIds}
          categoryId={props.categoryId}
          categories={props.categories}
          users={props.users}
          onAssigneeAdd={props.onAssigneeAdd}
          onAssigneeRemove={props.onAssigneeRemove}
          onCategoryChange={props.onCategoryChange}
          t={t}
          tLocal={tLocal}
        />
      ) : null}

      {mode === "adjust" ? (
        <AdjustFields
          priority={props.priority}
          riskLevel={props.riskLevel}
          dueDate={props.dueDate}
          onPriorityChange={props.onPriorityChange}
          onRiskLevelChange={props.onRiskLevelChange}
          onDueDateChange={props.onDueDateChange}
          t={t}
        />
      ) : null}

      {mode === "merge" ? (
        <MergeFields
          targetTicketId={props.targetTicketId}
          onTargetTicketIdChange={props.onTargetTicketIdChange}
          t={t}
        />
      ) : null}

      <EditorField
        mode={mode}
        className={getFieldClassName(mode)}
        label={getFieldLabel(mode, t)}
        editor={props.editor}
        errorMessage={props.errorMessage}
        content={isControlledEditorMode(mode) ? props.content : undefined}
        onEditorReady={props.onEditorReady}
        onTextChange={props.onTextChange}
        onContentChange={
          isControlledEditorMode(mode) ? props.onContentChange : undefined
        }
      />
    </FieldGroup>
  );
}
