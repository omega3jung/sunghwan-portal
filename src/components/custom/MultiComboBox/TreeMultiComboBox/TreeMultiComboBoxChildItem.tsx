import type { MultiComboBoxItem } from "../types";
import { TreeMultiComboBoxOptionItem } from "./TreeMultiComboBoxOptionItem";
import type {
  TreeMultiComboBoxOptionIndex,
  TreeMultiComboBoxValue,
} from "./types";
import { getChildRenderState } from "./utils";

type TreeMultiComboBoxChildItemProps = {
  item: MultiComboBoxItem;
  values: TreeMultiComboBoxValue;
  index: TreeMultiComboBoxOptionIndex;
  onToggleValue: (value: string) => void;
};

export function TreeMultiComboBoxChildItem({
  item,
  values,
  index,
  onToggleValue,
}: TreeMultiComboBoxChildItemProps) {
  const childState = getChildRenderState(item, values, index);

  return (
    <TreeMultiComboBoxOptionItem
      value={childState.item.value}
      label={childState.item.label}
      selected={childState.selected}
      disabled={childState.disabled}
      depth={1}
      onSelect={onToggleValue}
    />
  );
}
