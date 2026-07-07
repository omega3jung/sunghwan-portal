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

export type HierarchicalSelectProps = {
  id?: string;
  value?: string | null;
  items: HierarchicalSelectItem[];
  placeholder?: string;
  disabled?: boolean;
  emptyText?: string;
  backLabel?: string;
  selectableStrategy?: HierarchicalSelectSelectableStrategy;
  onValueChange: (value: string) => void;
  getDisplayLabel?: (
    selected: HierarchicalSelectItem,
    path: HierarchicalSelectItem[],
  ) => string;
  className?: string;
  triggerClassName?: string;
};
