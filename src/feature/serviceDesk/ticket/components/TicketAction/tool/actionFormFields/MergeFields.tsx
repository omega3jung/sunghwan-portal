import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import type { Translate } from "./utils";

type MergeFieldsProps = {
  targetTicketId?: string;
  onTargetTicketIdChange?: (value: string) => void;
  t: Translate;
};

export function MergeFields({
  targetTicketId = "",
  onTargetTicketIdChange = () => undefined,
  t,
}: MergeFieldsProps) {
  return (
    <Field>
      <FieldLabel>{t("actionTool.form.targetTicketId")}</FieldLabel>
      <Input
        value={targetTicketId}
        onChange={(event) => onTargetTicketIdChange(event.target.value)}
        placeholder={t("actionTool.form.mergeTargetPlaceholder")}
      />
    </Field>
  );
}
