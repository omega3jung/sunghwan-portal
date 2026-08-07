import type { ButtonHTMLAttributes } from "react";

import type {
  BadgeVariant,
  ComboBoxSize,
  ComboBoxVariant,
  MultiComboBoxItem,
  PaletteIndex,
} from "../types";

export type TreeMultiComboBoxOption = MultiComboBoxItem & {
  children: MultiComboBoxItem[];
};

export type TreeMultiComboBoxNode =
  | ({
      kind: "parent";
    } & TreeMultiComboBoxOption)
  | ({
      kind: "child";
      parentValue: string;
    } & MultiComboBoxItem);

export type TreeCheckState = "checked" | "partial" | "unchecked";

/**
 * A parent value represents its entire branch. Child values represent a
 * partial branch selection.
 */
export type TreeMultiComboBoxValue = string[];

export type TreeMultiComboBoxSelectedItem =
  | (MultiComboBoxItem & {
      kind: "parent";
    })
  | (MultiComboBoxItem & {
      kind: "child";
      parentValue: string;
    });

export type TreeMultiComboBoxOptionIndex = {
  parentMap: Map<string, TreeMultiComboBoxOption>;
  childMap: Map<string, MultiComboBoxItem>;
  childToParentMap: Map<string, TreeMultiComboBoxOption>;
};

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

export type TreeMultiComboBoxActionProps = {
  onSelect?: (value: string) => void;
  onRemove?: (value: string) => void;
  onChange?: (value: TreeMultiComboBoxValue) => void;
};

export interface TreeMultiComboBoxProps
  extends
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "onSelect">,
    TreeMultiComboBoxBaseProps,
    TreeMultiComboBoxActionProps {
  value: TreeMultiComboBoxValue;
  variant?: ComboBoxVariant;
  size?: ComboBoxSize;
  modal?: boolean;
}
