import { UniqueIdentifier } from "@dnd-kit/core";
import { SetStateAction } from "react";
import { useTranslation } from "react-i18next";

import { SortableTree } from "@/components/custom/dnd/tree/SortableTree";
import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SupportedLanguage } from "@/lib/application/i18n";
import { NS } from "@/lib/application/i18n";
import { useLocalizedText } from "@/lib/client/i18n";

import { ServiceDeskSettingsTreeRow } from "../../components/ServiceDeskSettingsTreeRow";
import { type AssignmentRuleNodeData, isSubAssignmentRuleData } from "../types";

type Props = {
  tree: TreeNodes<AssignmentRuleNodeData>;
  setTree: (value: SetStateAction<TreeNodes<AssignmentRuleNodeData>>) => void;
  selectedId: UniqueIdentifier | null;
  setSelectedId: (value: SetStateAction<UniqueIdentifier | null>) => void;
  language: SupportedLanguage;
  errors: ReadonlyMap<string, "missingAssignee">;
};

export const AssignmentRuleTree = ({
  tree,
  setTree,
  selectedId,
  setSelectedId,
  language,
  errors,
}: Props) => {
  const { t } = useTranslation(NS.settings);
  const tLocal = useLocalizedText(language);

  return (
    <ScrollArea className="h-full min-h-0 w-full overflow-hidden border-y md:h-[calc(100dvh-21.5rem)]">
      <SortableTree
        items={tree}
        onChange={setTree}
        collapsible
        disabled
        indentationWidth={20}
        renderItem={(item, { isOverlay, onCollapse }) => {
          const data = item.data;
          const isSub = item.depth > 0;
          const assignee = isSubAssignmentRuleData(data)
            ? data.assignmentRule
            : data;

          return (
            <ServiceDeskSettingsTreeRow
              label={tLocal(data.name)}
              hasChildren={item.children.length > 0}
              collapsed={item.collapsed}
              selected={item.id === selectedId}
              overlay={isOverlay}
              child={isSub}
              collapseLabel={item.collapsed ? "Expand" : "Collapse"}
              onCollapse={() => onCollapse?.(item.id)}
              onClick={() => {
                if (!isOverlay) setSelectedId(item.id);
              }}
              actions={
                <>
                  {errors.has(item.id.toString()) && (
                    <Badge variant="destructive">
                      {t("serviceDeskSettings.approvalStepTab.saveUnavailable")}
                    </Badge>
                  )}
                  {assignee && assignee.jobFieldIds.length > 0 && (
                    <Badge className="rounded-full" variant="secondary">
                      {`${assignee.jobFieldIds.length} ${t("serviceDeskSettings.assignmentRuleTab.jobField")}`}
                    </Badge>
                  )}
                  {assignee && assignee.assigneeUsernames.length > 0 && (
                    <Badge className="rounded-full">
                      {`${assignee.assigneeUsernames.length} ${t("serviceDeskSettings.assignmentRuleTab.employee")}`}
                    </Badge>
                  )}
                </>
              }
            />
          );
        }}
      />
    </ScrollArea>
  );
};
