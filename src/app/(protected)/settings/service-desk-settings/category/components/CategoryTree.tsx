import { UniqueIdentifier } from "@dnd-kit/core";
import { Plus, X } from "lucide-react";
import { SetStateAction } from "react";

import { DragHandle } from "@/components/custom/dnd/DragHandle";
import { SortableTree } from "@/components/custom/dnd/tree/SortableTree";
import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SupportedLanguage } from "@/lib/application/i18n";
import { useLocalizedText } from "@/lib/client/i18n";

import { ServiceDeskSettingsTreeRow } from "../../components/ServiceDeskSettingsTreeRow";
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
    <ScrollArea className="h-full min-h-0 w-full overflow-hidden border-y md:h-[calc(100dvh-21.5rem)]">
      <SortableTree
        items={tree}
        onChange={setTree}
        collapsible
        disabled={readOnly}
        indentationWidth={20}
        reorderScope="sameDepth"
        renderItem={(item, { dragHandleProps, isOverlay, onCollapse }) => {
          const data = item.data;
          const isSubCategory = item.depth > 0;
          const canAddSubCategory =
            !readOnly &&
            !isSubCategory &&
            item.maximum != null &&
            item.children.length < item.maximum;

          return (
            <ServiceDeskSettingsTreeRow
              label={tLocal(data.name)}
              hasChildren={item.children.length > 0}
              collapsed={item.collapsed}
              selected={item.id === selectedId}
              overlay={isOverlay}
              child={isSubCategory}
              collapseLabel={item.collapsed ? "Expand" : "Collapse"}
              onCollapse={() => onCollapse?.(item.id)}
              onClick={() => {
                if (!isOverlay) setSelectedId(item.id);
              }}
              actions={
                <>
                  {canAddSubCategory && (
                    <Button
                      variant="ghost"
                      type="button"
                      size="icon-xs"
                      className="size-5 rounded-sm"
                      disabled={isLoading}
                      onClick={(event) => {
                        event.stopPropagation();
                        addSubCategory(data.id);
                      }}
                    >
                      <Plus className="size-4" />
                    </Button>
                  )}

                  {!readOnly && data.isCreated ? (
                    <Button
                      variant="ghost"
                      type="button"
                      size="icon-xs"
                      className="size-5 rounded-sm"
                      disabled={isLoading}
                      onClick={(event) => {
                        event.stopPropagation();
                        removeCategory(data.id);
                      }}
                    >
                      <X className="size-4" />
                    </Button>
                  ) : (
                    !readOnly && (
                      <span className="size-5 shrink-0" aria-hidden="true" />
                    )
                  )}

                  {!readOnly && !isOverlay && (
                    <DragHandle
                      {...dragHandleProps}
                      aria-label={tLocal(data.name)}
                    />
                  )}
                  {!readOnly && isOverlay && (
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
