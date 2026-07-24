import { useState } from "react";

import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import { setProperty } from "@/components/custom/dnd/tree/utilities";
import { AssigneeGroup } from "@/domain/serviceDesk";
import { SupportedLanguage } from "@/lib/application/i18n";
import { Locale } from "@/shared/types";

import { AssignmentRuleData, SubAssignmentRuleData } from "../types";

type UseAssignmentRuleFormOptions = {
  selectedNode: AssignmentRuleData | SubAssignmentRuleData | null;
  setTree: React.Dispatch<
    React.SetStateAction<TreeNodes<AssignmentRuleData | SubAssignmentRuleData>>
  >;
  language: SupportedLanguage;
};

export const useAssignmentRuleForm = ({
  selectedNode,
  setTree,
  language,
}: UseAssignmentRuleFormOptions) => {
  const [languageTab, setLanguageTab] = useState<Locale>(language);

  const updateNode = (
    updater: (
      data: AssignmentRuleData | SubAssignmentRuleData,
    ) => AssignmentRuleData | SubAssignmentRuleData,
  ) => {
    if (!selectedNode) return;

    setTree((prev) =>
      setProperty(prev, selectedNode.id, "data", (data) => {
        const updated = updater(data);

        return updated;
      }),
    );
  };

  const assigneeChange =
    (key: Exclude<keyof AssigneeGroup, "includeTenantCompany">) =>
    (ids: string[]) => {
      updateNode((data) => ({
        ...data,
        [key]: ids,
      }));
    };

  const includeTenantCompanyChange = (checked: boolean) => {
    updateNode((data) => ({
      ...data,
      includeTenantCompany: checked,
    }));
  };

  return {
    languageTab,
    setLanguageTab,
    assigneeChange,
    includeTenantCompanyChange,
    language,
  };
};
