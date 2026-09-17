import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { HierarchicalSelect } from "@/components/custom/HierarchicalSelect";
import { Field, FieldLabel } from "@/components/ui/field";
import type { Department, JobField } from "@/domain/organization";
import { ApprovalAssigneeType, AssigneeByType } from "@/domain/serviceDesk";
import { SupportedLanguage } from "@/lib/application/i18n";
import { NS } from "@/lib/application/i18n";
import { useLocalizedText } from "@/lib/client/i18n";

import { buildJobFieldItems } from "../../../utils/jobFieldItems";

type Props = {
  stepAssignee: AssigneeByType<"JOB_FIELD">;
  onChange: (value: ApprovalAssigneeType) => void;
  language: SupportedLanguage;
  canEdit?: boolean;
  departments?: Department[];
  jobFields?: JobField[];
  isLoading?: boolean;
};

export function JobFieldField({
  stepAssignee,
  onChange,
  language,
  canEdit = true,
  departments = [],
  jobFields = [],
  isLoading,
}: Props) {
  const { t } = useTranslation(NS.settings);
  const tLocal = useLocalizedText(language);
  const jobFieldItems = useMemo(
    () =>
      buildJobFieldItems({
        departments,
        jobFields,
        selectedJobFieldIds: stepAssignee.jobFieldId
          ? [stepAssignee.jobFieldId]
          : [],
        getLocalizedText: tLocal,
        fallbackDepartmentLabel: t(
          "serviceDeskSettings.approvalStepTab.department",
        ),
      }),
    [departments, jobFields, stepAssignee.jobFieldId, t, tLocal],
  );

  return (
    <Field className="col-span-2">
      <FieldLabel htmlFor="approval-select-job-field">
        {t("serviceDeskSettings.approvalStepTab.jobField")}
      </FieldLabel>
      <HierarchicalSelect
        id="approval-select-job-field"
        value={stepAssignee.jobFieldId}
        items={jobFieldItems}
        placeholder={t(
          "serviceDeskSettings.approvalStepTab.jobFieldPlaceholder",
        )}
        backLabel={t("action.back", { ns: NS.common })}
        emptyText={t("empty.withItem", {
          ns: NS.common,
          item: t("serviceDeskSettings.approvalStepTab.jobField"),
        })}
        selectableStrategy="leaf-only"
        disabled={!canEdit || isLoading}
        onValueChange={(jobFieldId) =>
          onChange({ type: "JOB_FIELD", jobFieldId })
        }
      />
    </Field>
  );
}
