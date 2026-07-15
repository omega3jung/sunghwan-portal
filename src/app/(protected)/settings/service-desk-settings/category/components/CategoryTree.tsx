import { UniqueIdentifier } from "@dnd-kit/core";
import { ChevronRight, Plus, X } from "lucide-react";
import { SetStateAction } from "react";

import { DragHandle } from "@/components/custom/dnd/DragHandle";
import { SortableTree } from "@/components/custom/dnd/tree/SortableTree";
import { SortableTreeItem } from "@/components/custom/dnd/tree/TreeItem";
import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SupportedLanguage } from "@/domain/config";
import { useLocalizedText } from "@/shared/hooks";
import { cn } from "@/shared/utils/presentation";

import { CategoryData, SubCategoryData } from "../types";

type Props = {
  tree: TreeNodes<CategoryData | SubCategoryData>;
  setTree: (
    value: SetStateAction<TreeNodes<CategoryData | SubCategoryData>>,
  ) => void;
  selectedId: UniqueIdentifier | null;
  setSelectedId: (value: SetStateAction<UniqueIdentifier | null>) => void;
  addSubCategory: (parentId: UniqueIdentifier) => void;
  removeCategory: (id: UniqueIdentifier) => void;
  language: SupportedLanguage;
  isLoading: boolean;
  readOnly?: boolean;
};

export const CategoryTree = ({
  tree,
  setTree,
  selectedId,
  setSelectedId,
  addSubCategory,
  removeCategory,
  language,
  isLoading,
  readOnly = false,
}: Props) => {
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
                  <div className="flex items-center gap-2 shrink-0">
                    {!readOnly &&
                      !isSub &&
                      limit != null &&
                      item.children.length < limit && (
                        <Button
                          variant="ghost"
                          type="button"
                          size="icon_xs"
                          disabled={isLoading}
                          onClick={() => addSubCategory(data.id)}
                        >
                          <Plus />
                        </Button>
                      )}
                    {!readOnly && data.isCreated ? (
                      <Button
                        variant="ghost"
                        type="button"
                        size="icon_xs"
                        disabled={isLoading}
                        onClick={() => removeCategory(data.id)}
                      >
                        <X />
                      </Button>
                    ) : (
                      <span className="w-5"></span>
                    )}
                    {!readOnly && <DragHandle {...dragHandleProps} />}
                  </div>
                </div>
              )}
            </SortableTreeItem>
          );
        }}
      />
    </ScrollArea>
  );
};
