import type { BadgeProps } from "@/components/ui/badge";

export type HierarchicalSelectItem = {
  value: string;
  label: string;
  disabled?: boolean;
  children?: HierarchicalSelectItem[];
};

export type HierarchicalSelectSelectableStrategy =
  | "leaf-only"
  | "parent-without-children"
  | "all";

type HierarchicalSelectBaseProps = {
  id?: string;
  items: HierarchicalSelectItem[];
  placeholder?: string;
  disabled?: boolean;
  emptyText?: string;
  backLabel?: string;
  selectableStrategy?: HierarchicalSelectSelectableStrategy;
  getDisplayLabel?: (
    selected: HierarchicalSelectItem,
    path: HierarchicalSelectItem[],
  ) => string;
  className?: string;
  triggerClassName?: string;
};

export type HierarchicalSelectProps = HierarchicalSelectBaseProps & {
  value?: string | null;
  onValueChange: (value: string) => void;
};

export type MultiHierarchicalSelectProps = HierarchicalSelectBaseProps & {
  value: string[];
  onValueChange: (value: string[]) => void;
  readOnly?: boolean;
  isLoading?: boolean;
  badgeVariant?: BadgeProps["variant"];
};
