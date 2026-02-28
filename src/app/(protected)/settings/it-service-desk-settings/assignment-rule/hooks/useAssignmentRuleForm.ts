import { useState } from "react";

import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import { setProperty } from "@/components/custom/dnd/tree/utilities";
import { SupportedLanguage } from "@/domain/config";
import { AssigneeGroup } from "@/domain/itServiceDesk";
import { languageOptions } from "@/shared/constants";
import { Locale } from "@/shared/types";

import { AssignmentRuleData, MainAssignmentRuleData } from "../types";

type Params = {
  selectedNode: AssignmentRuleData | MainAssignmentRuleData | null;
  setTree: React.Dispatch<
    React.SetStateAction<TreeNodes<AssignmentRuleData | MainAssignmentRuleData>>
  >;
  language: SupportedLanguage;
};

export const useAssignmentRuleForm = ({
  selectedNode,
  setTree,
  language,
}: Params) => {
  const [languageTab, setLanguageTab] = useState<Locale>(language);

  const updateNode = (
    updater: (
      data: AssignmentRuleData | MainAssignmentRuleData,
    ) => AssignmentRuleData | MainAssignmentRuleData,
  ) => {
    if (!selectedNode) return;

    setTree((prev) =>
      setProperty(prev, selectedNode.id, "data", (data) => {
        const updated = updater(data);

        return updated;
      }),
    );
  };

  const assigneeChange = (key: keyof AssigneeGroup) => (ids: string[]) => {
    updateNode((data) => ({
      ...data,
      [key]: ids,
    }));
  };

  return {
    languageTab,
    setLanguageTab,
    languageOptions,
    assigneeChange,
    language,
  };
};
