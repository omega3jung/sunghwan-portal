import { UniqueIdentifier } from "@dnd-kit/core";
import { ChevronRight } from "lucide-react";
import { SetStateAction } from "react";
import { useTranslation } from "react-i18next";

import { SortableTree } from "@/components/custom/dnd/tree/SortableTree";
import { SortableTreeItem } from "@/components/custom/dnd/tree/TreeItem";
import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SupportedLanguage } from "@/domain/config";
import { NS } from "@/lib/i18n";
import { useLocalizedText } from "@/shared/hooks";
import { cn } from "@/shared/utils/presentation";

import { AssignmentRuleData, SubAssignmentRuleData } from "../types";

type Props = {
  tree: TreeNodes<AssignmentRuleData | SubAssignmentRuleData>;
  setTree: (
    value: SetStateAction<
      TreeNodes<AssignmentRuleData | SubAssignmentRuleData>
    >,
  ) => void;
  selectedId: UniqueIdentifier | null;
  setSelectedId: (value: SetStateAction<UniqueIdentifier | null>) => void;
  language: SupportedLanguage;
  readOnly?: boolean;
};

export const AsgginmentRuleTree = ({
  tree,
  setTree,
  selectedId,
  setSelectedId,
  language,
  readOnly = false,
}: Props) => {
  const { t } = useTranslation(NS.settings);
  const tLocal = useLocalizedText(language);

  return (
    <ScrollArea className="h-full w-full border-y md:h-[calc(100vh-var(--settings-offset))]">
      <SortableTree
        items={tree}
        onChange={(nextTree) => {
          if (!readOnly) setTree(nextTree);
        }}
        collapsible={true}
        renderItem={(item, { onCollapse }) => {
          const data = item.data;
          const isSub = item.depth > 0;

          return (
            <SortableTreeItem
              key={item.id}
              id={item.id}
              depth={item.depth}
              indentationWidth={20}
              onClick={() => setSelectedId(item.id)}
            >
              {() => (
                <div
                  data-selected={item.id === selectedId}
                  className={cn(
                    "flex items-center justify-between w-full pl-3 pr-5 py-2",
                    "border-b last:border-b-0",
                    "border-l-[3px] border-l-transparent",
                    "data-[selected='true']:border-l-primary",
                    "data-[selected='true']:bg-primary/5",
                    "transition-colors",
                    "bg-background hover:bg-muted/50 text-foreground",
                    isSub && "text-sm",
                  )}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {item.children.length ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCollapse?.(item.id);
                        }}
                      >
                        <ChevronRight
                          className={cn(
                            "transition-transform",
                            !item.collapsed && "rotate-90",
                          )}
                        />
                      </Button>
                    ) : (
                      <span className="w-4" />
                    )}

                    <span className="truncate">{tLocal(data.name)}</span>
                  </div>
                  <span className="grid grid-cols-3 gap-2">
                    {item.depth === 0 &&
                    data.jobFieldIds.length === 0 &&
                    data.assigneeUsernames.length === 0 ? (
                      <Badge variant="destructive">
                        {t(
                          "serviceDeskSettings.approvalStepTab.saveUnavailable",
                        )}
                      </Badge>
                    ) : (
                      <span />
                    )}
                    {data.jobFieldIds.length > 0 ? (
                      <Badge className="rounded-full w-fit" variant="secondary">
                        {data.jobFieldIds.length > 0 &&
                          `${data.jobFieldIds.length} ${t("serviceDeskSettings.assignmentRuleTab.jobField")}`}
                      </Badge>
                    ) : (
                      <span />
                    )}
                    {data.assigneeUsernames.length > 0 ? (
                      <Badge className="rounded-full">
                        {data.assigneeUsernames.length > 0 &&
                          `${data.assigneeUsernames.length} ${t("serviceDeskSettings.assignmentRuleTab.employee")}`}
                      </Badge>
                    ) : (
                      <span />
                    )}
                  </span>
                </div>
              )}
            </SortableTreeItem>
          );
        }}
      />
    </ScrollArea>
  );
};
