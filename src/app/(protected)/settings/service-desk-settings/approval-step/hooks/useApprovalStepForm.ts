import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import { setProperty } from "@/components/custom/dnd/tree/utilities";
import { AccessLevel } from "@/domain/auth";
import {
  APPROVAL_ASSIGNEE_TYPES,
  ApprovalAssigneeType,
  ApprovalAssigneeTypeValue,
} from "@/domain/serviceDesk";
import { SupportedLanguage } from "@/lib/application/i18n";
import { NS } from "@/lib/i18n";
import { Locale } from "@/shared/types";
import { camelCase } from "@/shared/utils/value";

import { getDefaultAssigneePayload } from "../constants";
import { ApprovalStepData, CategoryApprovalStepData } from "../types";

type UseApprovalStepFormOptions = {
  selectedNode: CategoryApprovalStepData | ApprovalStepData | null;
  language: SupportedLanguage;
  setTree: React.Dispatch<
    React.SetStateAction<TreeNodes<CategoryApprovalStepData | ApprovalStepData>>
  >;
};

export const useApprovalStepForm = ({
  selectedNode,
  language,
  setTree,
}: UseApprovalStepFormOptions) => {
  const { t } = useTranslation(NS.settings);

  const [languageTab, setLanguageTab] = useState<Locale>(language);

  const approvalTypeValueLabels = useMemo(
    () =>
      APPROVAL_ASSIGNEE_TYPES.map((type) => ({
        value: type,
        label: t(
          `serviceDeskSettings.approvalStepTab.assigneeTypes.${camelCase(
            type.toLocaleLowerCase(),
          )}`,
        ),
      })),
    [t],
  );

  const updateNode = (
    updater: (data: ApprovalStepData) => ApprovalStepData,
  ) => {
    if (!selectedNode || selectedNode.nodeType !== "approvalStep") return;

    setTree((prev) =>
      setProperty(prev, selectedNode.id, "data", (data) => {
        if (data.nodeType !== "approvalStep") return data;

        const updated = updater(data);

        return updated;
      }),
    );
  };

  const updateTranslation =
    (key: "name" | "description") => (value: string) => {
      updateNode((data) => ({
        ...data,
        [key]: {
          ...data[key],
          [languageTab]: value,
        },
      }));
    };

  const assigneeTypeValueChange = (approvalValue: ApprovalAssigneeType) => {
    updateNode((data) => ({
      ...data,
      stepAssignee: approvalValue,
    }));
  };

  const onAssigneeTypeChange = (approvalType: ApprovalAssigneeTypeValue) => {
    assigneeTypeValueChange(getDefaultAssigneePayload(approvalType));
  };

  const onSkipAccessLevelChange = (value: string) => {
    updateNode((data) => ({
      ...data,
      skipAccessLevel: parseInt(value) as AccessLevel,
    }));
  };

  return {
    languageTab,
    setLanguageTab,
    approvalTypeValueLabels,
    updateTranslation,
    assigneeTypeValueChange,
    onAssigneeTypeChange,
    onSkipAccessLevelChange,
  };
};
