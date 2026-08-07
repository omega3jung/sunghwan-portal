import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { HierarchicalSelect } from "@/components/custom/HierarchicalSelect";
import { Field, FieldLabel } from "@/components/ui/field";
import type { Department } from "@/domain/organization";
import { ApprovalAssigneeType, AssigneeByType } from "@/domain/serviceDesk";
import { SupportedLanguage } from "@/lib/application/i18n";
import { NS } from "@/lib/application/i18n";
import { useLocalizedText } from "@/lib/client/i18n";

import { buildHierarchicalSelectItems } from "./hierarchy";

type Props = {
  stepAssignee: AssigneeByType<"DEPARTMENT">;
  onChange: (value: ApprovalAssigneeType) => void;
  language: SupportedLanguage;
  canEdit?: boolean;
  departments?: Department[];
  isLoading?: boolean;
};

export function DepartmentField({
  stepAssignee,
  onChange,
  language,
  canEdit = true,
  departments = [],
  isLoading,
}: Props) {
  const { t } = useTranslation(NS.settings);
  const tLocal = useLocalizedText(language);
  const departmentItems = useMemo(
    () =>
      buildHierarchicalSelectItems(
        departments.map((department) => ({
          id: department.id,
          parentId: department.parentId,
          label: tLocal(department.name),
        })),
        stepAssignee.departmentId,
      ),
    [departments, stepAssignee.departmentId, tLocal],
  );

  return (
    <Field className="col-span-2">
      <FieldLabel htmlFor="approval-select-department">
        {t("serviceDeskSettings.approvalStepTab.department")}
      </FieldLabel>
      <HierarchicalSelect
        id="approval-select-department"
        value={stepAssignee.departmentId}
        items={departmentItems}
        placeholder={t(
          "serviceDeskSettings.approvalStepTab.departmentPlaceholder",
        )}
        backLabel={t("action.back", { ns: NS.common })}
        emptyText={t("empty.withItem", {
          ns: NS.common,
          item: t("serviceDeskSettings.approvalStepTab.department"),
        })}
        selectableStrategy="all"
        disabled={!canEdit || isLoading}
        onValueChange={(departmentId) =>
          onChange({ type: "DEPARTMENT", departmentId })
        }
        getDisplayLabel={(_, path) =>
          path.map((item) => item.label).join(" / ")
        }
      />
    </Field>
  );
}
