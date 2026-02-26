import { UniqueIdentifier } from "@dnd-kit/core";
import { ChevronRight, Plus, X } from "lucide-react";
import { SetStateAction } from "react";

import { DragHandle } from "@/components/custom/dnd/DragHandle";
import { SortableTree } from "@/components/custom/dnd/tree/SortableTree";
import { SortableTreeItem } from "@/components/custom/dnd/tree/TreeItem";
import { TreeNodes } from "@/components/custom/dnd/tree/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SupportedLanguage } from "@/domain/config";
import { cn } from "@/utils";

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
}: Props) => {
  return (
    <div
      className="col-span-2 flex flex-col gap-2 p-2 pr-10"
      style={{ "--settings-offset": "18rem" } as React.CSSProperties}
    >
      <ScrollArea className="h-full w-full border-y md:h-[calc(100vh-var(--settings-offset))]">
        <SortableTree
          items={tree}
          onChange={(nextTree) => {
            setTree(nextTree);
          }}
          collapsible={true}
          renderItem={(item, { onCollapse }) => {
            const data = item.data;
            const isSub = data.nodeType === "approvalStep";
            const limit = item.maximum;

            return (
              <SortableTreeItem
                key={item.id}
                id={item.id}
                depth={item.depth}
                indentationWidth={20}
                onClick={() => setSelectedId(item.id)}
              >
                {({ dragHandleProps }) => (
                  <div
                    data-selected={item.id === selectedId}
                    className={cn(
                      "flex items-center justify-between w-full pl-3 pr-5 py-2",
                      "border-b last:border-b-0",
                      "border-l-[3px] border-l-transparent",
                      "data-[selected='true']:border-l-primary",
                      "data-[selected='true']:bg-primary/5",
                      "data-[selected='true']:text-primary",
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

                      {data.nodeType === "category" && (
                        <>
                          <span className="truncate">{data.name.en}</span>

                          {language !== "en" && data.name[language] && (
                            <span className="text-muted-foreground truncate">
                              {data.name[language]}
                            </span>
                          )}
                        </>
                      )}

                      {data.nodeType === "approvalStep" && (
                        <>
                          <span className="truncate">
                            {data.name.en || `step ${item.index}`}
                          </span>

                          {language !== "en" && data.name[language] && (
                            <span className="text-muted-foreground truncate">
                              {data.name[language]}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!isSub &&
                        !isSub &&
                        limit != null &&
                        item.children.length < limit && (
                          <>
                            <Button
                              variant="ghost"
                              type="button"
                              size="icon_xs"
                              disabled={isLoading}
                              onClick={() => addApprovalStep(data.id)}
                            >
                              <Plus />
                            </Button>
                            <span className="w-10"></span>
                          </>
                        )}
                      {isSub && (
                        <Button
                          variant="ghost"
                          type="button"
                          size="icon_xs"
                          disabled={isLoading}
                          onClick={() => removeApprovalStep(data.id)}
                        >
                          <X />
                        </Button>
                      )}
                      {isSub && <DragHandle {...dragHandleProps} />}
                    </div>
                  </div>
                )}
              </SortableTreeItem>
            );
          }}
        />
      </ScrollArea>
    </div>
  );
};
