import type { ButtonHTMLAttributes } from "react";

import type {
  BadgeVariant,
  ComboBoxSize,
  ComboBoxVariant,
  MultiComboBoxItem,
  PaletteIndex,
} from "../types";

/**
 * The top-level option type for `TreeMultiComboBox`.
 * The current implementation supports only 2-depth trees,
 * so options are managed as an array of parent items.
 */
export type TreeMultiComboBoxOption = MultiComboBoxItem & {
  children: MultiComboBoxItem[];
};

/**
 * A flattened node shape used when parent and child items
 * need to be handled uniformly during rendering or state calculation.
 */
export type TreeMultiComboBoxNode =
  | ({
      kind: "parent";
    } & TreeMultiComboBoxOption)
  | ({
      kind: "child";
    } & MultiComboBoxItem);

/**
 * Checkbox state.
 * Parent items can also be partially selected.
 */
export type TreeCheckState = "checked" | "partial" | "unchecked";

/**
 * External values are stored as `string[]`.
 * - A parent value means the entire parent branch is selected.
 * - A child value means only part of the branch is selected.
 *
 * Examples:
 * ["hardware"]            -> the entire "hardware" branch is selected
 * ["monitor", "keyboard"] -> individual children are selected
 * ["hardware", "network"] -> multiple parent branches are selected
 */
export type TreeMultiComboBoxValue = string[];

/**
 * A normalized item used for badge and summary rendering.
 * Helps the trigger area render parent and child selections differently.
 */
export type TreeMultiComboBoxSelectedItem =
  | (MultiComboBoxItem & {
      kind: "parent";
    })
  | (MultiComboBoxItem & {
      kind: "child";
      parentValue: string;
    });

/**
 * An index structure for fast lookup.
 * Used by helpers such as `createTreeOptionIndex`.
 */
export type TreeMultiComboBoxOptionIndex = {
  parentMap: Map<string, TreeMultiComboBoxOption>;
  childMap: Map<string, MultiComboBoxItem>;
  childToParentMap: Map<string, TreeMultiComboBoxOption>;
};

/**
 * Derived state required to render a parent row.
 */
export type TreeMultiComboBoxParentState = {
  item: TreeMultiComboBoxOption;
  checkState: TreeCheckState;
  selectedChildCount: number;
  totalChildCount: number;
  disabled: boolean;
};

/**
 * Derived state required to render a child row.
 */
export type TreeMultiComboBoxChildState = {
  item: MultiComboBoxItem;
  selected: boolean;
  disabled: boolean;
};

/** Shared props for `TreeMultiComboBox`. */
export type TreeMultiComboBoxBaseProps = {
  placeholder?: string;
  options?: TreeMultiComboBoxOption[];
  badgeVariant?: BadgeVariant;
  paletteStart?: PaletteIndex;
  palettePick?: PaletteIndex;
  isLoading?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
};

/**
 * Action-style props that intentionally mirror the flat `MultiComboBox` API.
 * `onSelect` and `onRemove` remain available for compatibility.
 *
 * Parent and child interactions both pass a single string value,
 * while the actual tree semantics are resolved in `utils.ts`.
 */
export type TreeMultiComboBoxActionProps = {
  onSelect?: (value: string) => void;
  onRemove?: (value: string) => void;
  onChange?: (value: TreeMultiComboBoxValue) => void;
};

/**
 * Recommended props for the tree component.
 * In practice, `onChange(value[])` is the most natural API for trees,
 * but action props are still supported to stay aligned with `MultiComboBox`.
 */
export interface TreeMultiComboBoxProps
  extends
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "onSelect">,
    TreeMultiComboBoxBaseProps,
    TreeMultiComboBoxActionProps {
  value: TreeMultiComboBoxValue;
  asChild?: boolean;
  variant?: ComboBoxVariant;
  size?: ComboBoxSize;
}
