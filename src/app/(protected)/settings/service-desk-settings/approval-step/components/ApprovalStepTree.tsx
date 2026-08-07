import { UniqueIdentifier } from "@dnd-kit/core";
import { Plus, X } from "lucide-react";
import { SetStateAction } from "react";
import { useTranslation } from "react-i18next";

import {
  SortableTree,
  SortableTreeDragHandle,
  type TreeNodes,
} from "@/components/custom/SortableTree";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SupportedLanguage } from "@/lib/application/i18n";
import { NS } from "@/lib/application/i18n";
import { useLocalizedText } from "@/lib/client/i18n";

import { ServiceDeskSettingsTreeRow } from "../../components/ServiceDeskSettingsTreeRow";
import { ApprovalStepData, CategoryApprovalStepData } from "../types";

type Props = {
  tree: TreeNodes<CategoryApprovalStepData | ApprovalStepData>;
  setTree: (
    value: SetStateAction<
      TreeNodes<CategoryApprovalStepData | ApprovalStepData>
    >,
  ) => void;
  selectedId: UniqueIdentifier | null;
  setSelectedId: (value: SetStateAction<UniqueIdentifier | null>) => void;
  addApprovalStep: (parentId: UniqueIdentifier) => void;
  removeApprovalStep: (id: UniqueIdentifier) => void;
  language: SupportedLanguage;
  isLoading: boolean;
  errors: ReadonlyMap<string, "invalidAssignee">;
  canEdit?: boolean;
};

export const ApprovalStepTree = ({
  tree,
  setTree,
  selectedId,
  setSelectedId,
  addApprovalStep,
  removeApprovalStep,
  language,
  isLoading,
  errors,
  canEdit = true,
}: Props) => {
  const { t: tShared } = useTranslation(NS.shared);
  const { t: tSettings } = useTranslation(NS.settings);
  const tLocal = useLocalizedText(language);

  const getRiskBadgeClassName = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-50";
      case "medium":
        return "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-50";
      case "high":
        return "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50";
      case "critical":
        return "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-50";
      default:
        return "";
    }
  };

  return (
    <ScrollArea className="h-full min-h-0 w-full overflow-hidden border-y md:h-[calc(100dvh-21.5rem)]">
      <SortableTree
        items={tree}
        onChange={setTree}
        collapsible
        disabled={!canEdit}
        indentationWidth={20}
        reorderScope="sameDepth"
        renderItem={(item, { dragHandleProps, isOverlay, onCollapse }) => {
          const data = item.data;
          const isApprovalStep = data.nodeType === "approvalStep";
          const isInvalidApprovalStep =
            isApprovalStep && errors.has(item.id.toString());
          const limit = item.maximum;
          const canAddApprovalStep =
            canEdit &&
            !isApprovalStep &&
            limit != null &&
            item.children.length < limit;

          return (
            <ServiceDeskSettingsTreeRow
              label={tLocal(data.name)}
              hasChildren={item.children.length > 0}
              collapsed={item.collapsed}
              selected={item.id === selectedId}
              overlay={isOverlay}
              child={isApprovalStep}
              collapseLabel={item.collapsed ? "Expand" : "Collapse"}
              onCollapse={() => onCollapse?.(item.id)}
              onClick={() => {
                if (!isOverlay) setSelectedId(item.id);
              }}
              actions={
                <>
                  {!isApprovalStep && (
                    <Badge
                      variant="outline"
                      className={getRiskBadgeClassName(data.defaultRiskLevel)}
                    >
                      {`${tShared("enum.riskLevel.label")} ${tShared(`enum.riskLevel.options.${data.defaultRiskLevel}`)}`}
                    </Badge>
                  )}

                  {canAddApprovalStep && (
                    <Button
                      variant="ghost"
                      type="button"
                      size="icon-xs"
                      className="size-5 rounded-sm"
                      disabled={isLoading}
                      onClick={(event) => {
                        event.stopPropagation();
                        addApprovalStep(data.id);
                      }}
                    >
                      <Plus className="size-4" />
                    </Button>
                  )}

                  {isApprovalStep && isInvalidApprovalStep && (
                    <Badge variant="destructive">
                      {tSettings(
                        "serviceDeskSettings.approvalStepTab.saveUnavailable",
                      )}
                    </Badge>
                  )}

                  {canEdit && isApprovalStep && (
                    <Button
                      variant="ghost"
                      type="button"
                      size="icon-xs"
                      className="size-5 rounded-sm"
                      disabled={isLoading}
                      onClick={(event) => {
                        event.stopPropagation();
                        removeApprovalStep(data.id);
                      }}
                    >
                      <X className="size-4" />
                    </Button>
                  )}

                  {canEdit && isApprovalStep && !isOverlay && (
                    <SortableTreeDragHandle
                      {...dragHandleProps}
                      aria-label={tLocal(data.name)}
                    />
                  )}
                  {canEdit && isApprovalStep && isOverlay && (
                    <span className="size-5 shrink-0" aria-hidden="true" />
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
