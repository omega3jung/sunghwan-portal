import type { MultiComboBoxItem } from "../types";
import { EMPTY_OPTION_TEXT } from "../utils";
import type {
  TreeCheckState,
  TreeMultiComboBoxOption,
  TreeMultiComboBoxOptionIndex,
  TreeMultiComboBoxSelectedItem,
  TreeMultiComboBoxValue,
} from "./types";

const normalize = (value: string) => value.trim().toUpperCase();

export { EMPTY_OPTION_TEXT };

/**
 * Creates an index for fast parent and child lookup.
 */
export const createTreeOptionIndex = (
  options: TreeMultiComboBoxOption[],
): TreeMultiComboBoxOptionIndex => {
  const parentMap = new Map<string, TreeMultiComboBoxOption>();
  const childMap = new Map<string, MultiComboBoxItem>();
  const childToParentMap = new Map<string, TreeMultiComboBoxOption>();

  for (const parent of options) {
    parentMap.set(parent.value, parent);

    for (const child of parent.children) {
      childMap.set(child.value, child);
      childToParentMap.set(child.value, parent);
    }
  }

  return {
    parentMap,
    childMap,
    childToParentMap,
  };
};

/**
 * Flattens parent and child items into a single array.
 * Useful for search and rendering helpers.
 */
export const flattenTreeOptions = (options: TreeMultiComboBoxOption[]) => {
  return options.flatMap((parent) => [parent, ...parent.children]);
};

export const isParentValue = (
  value: string,
  index: TreeMultiComboBoxOptionIndex,
): boolean => {
  return index.parentMap.has(value);
};

export const isChildValue = (
  value: string,
  index: TreeMultiComboBoxOptionIndex,
): boolean => {
  return index.childMap.has(value);
};

export const getParentByChildValue = (
  childValue: string,
  index: TreeMultiComboBoxOptionIndex,
): TreeMultiComboBoxOption | undefined => {
  return index.childToParentMap.get(childValue);
};

export const getChildValues = (
  parent: TreeMultiComboBoxOption,
): string[] => {
  return parent.children.map((child) => child.value);
};

export const getEnabledChildValues = (
  parent: TreeMultiComboBoxOption,
): string[] => {
  return parent.children
    .filter((child) => !child.disabled)
    .map((child) => child.value);
};

export const isParentDisabled = (
  parent: TreeMultiComboBoxOption,
): boolean => {
  return Boolean(parent.disabled);
};

export const isLeafParent = (parent: TreeMultiComboBoxOption): boolean => {
  return parent.children.length === 0;
};

export const isChildDisabled = (
  childValue: string,
  index: TreeMultiComboBoxOptionIndex,
): boolean => {
  const child = index.childMap.get(childValue);

  if (!child) {
    return true;
  }

  const parent = getParentByChildValue(childValue, index);

  return Boolean(child.disabled || parent?.disabled);
};

/**
 * Resolves the set of selected child values under a given parent.
 * Uses the external value array as the source of truth.
 *
 * Rules:
 * - If the parent value exists, all enabled children are considered selected.
 * - If child values exist, only those children are considered selected.
 */
export const getSelectedChildValuesForParent = (
  parent: TreeMultiComboBoxOption,
  values: TreeMultiComboBoxValue,
): string[] => {
  if (values.includes(parent.value)) {
    return getEnabledChildValues(parent);
  }

  const valueSet = new Set(values);

  return parent.children
    .filter((child) => !child.disabled && valueSet.has(child.value))
    .map((child) => child.value);
};

export const getSelectedChildCountForParent = (
  parent: TreeMultiComboBoxOption,
  values: TreeMultiComboBoxValue,
): number => {
  return getSelectedChildValuesForParent(parent, values).length;
};

export const getTotalEnabledChildCountForParent = (
  parent: TreeMultiComboBoxOption,
): number => {
  return getEnabledChildValues(parent).length;
};

/**
 * Calculates the checkbox state for a parent row.
 */
export const getParentCheckState = (
  parent: TreeMultiComboBoxOption,
  values: TreeMultiComboBoxValue,
): TreeCheckState => {
  if (isLeafParent(parent)) {
    return values.includes(parent.value) ? "checked" : "unchecked";
  }

  const totalEnabledChildCount = getTotalEnabledChildCountForParent(parent);

  if (totalEnabledChildCount === 0) {
    return "unchecked";
  }

  const selectedChildCount = getSelectedChildCountForParent(parent, values);

  if (selectedChildCount === 0) {
    return "unchecked";
  }

  if (selectedChildCount === totalEnabledChildCount) {
    return "checked";
  }

  return "partial";
};

export const isChildSelected = (
  childValue: string,
  values: TreeMultiComboBoxValue,
  index: TreeMultiComboBoxOptionIndex,
): boolean => {
  const child = index.childMap.get(childValue);

  if (!child || isChildDisabled(childValue, index)) {
    return false;
  }

  if (values.includes(childValue)) {
    return true;
  }

  const parent = getParentByChildValue(childValue, index);

  return Boolean(parent && values.includes(parent.value));
};

export const isParentSelected = (
  parent: TreeMultiComboBoxOption,
  values: TreeMultiComboBoxValue,
): boolean => {
  return getParentCheckState(parent, values) === "checked";
};

/**
 * Toggles a parent selection.
 *
 * Rules:
 * - If already checked, deselect it.
 * - If unchecked or partial, select the full parent branch.
 * - Remove child values under that parent and normalize to the parent value.
 */
export const toggleParentValue = (
  parentKey: string,
  currentValues: TreeMultiComboBoxValue,
  options: TreeMultiComboBoxOption[],
): TreeMultiComboBoxValue => {
  const index = createTreeOptionIndex(options);
  const parent = index.parentMap.get(parentKey);

  if (!parent || isParentDisabled(parent)) {
    return currentValues;
  }

  const currentCheckState = getParentCheckState(parent, currentValues);
  const childValues = getChildValues(parent);
  const nextValues = currentValues.filter(
    (value) => value !== parentKey && !childValues.includes(value),
  );

  if (currentCheckState === "checked") {
    return normalizeTreeValues(nextValues, options);
  }

  return normalizeTreeValues([...nextValues, parentKey], options);
};

/**
 * Toggles a child selection.
 *
 * Rules:
 * - If the parent is currently selected, remove that compressed parent state
 *   and keep only the clicked child under that branch.
 * - If all enabled children become selected, collapse them into the parent value.
 */
export const toggleChildValue = (
  childValue: string,
  currentValues: TreeMultiComboBoxValue,
  options: TreeMultiComboBoxOption[],
): TreeMultiComboBoxValue => {
  const index = createTreeOptionIndex(options);
  const child = index.childMap.get(childValue);
  const parent = getParentByChildValue(childValue, index);

  if (!child || !parent || isChildDisabled(childValue, index)) {
    return currentValues;
  }

  const strippedValues = currentValues.filter((value) => {
    if (value === parent.value) {
      return false;
    }

    return !parent.children.some((item) => item.value === value);
  });

  if (currentValues.includes(parent.value)) {
    return normalizeTreeValues([...strippedValues, childValue], options);
  }

  const selectedChildValues = new Set(
    getSelectedChildValuesForParent(parent, currentValues),
  );

  if (selectedChildValues.has(childValue)) {
    selectedChildValues.delete(childValue);
  } else {
    selectedChildValues.add(childValue);
  }

  const nextValues = [...strippedValues, ...selectedChildValues];

  return normalizeTreeValues(nextValues, options);
};

/**
 * Toggles a single value without requiring the caller
 * to distinguish between parent and child nodes.
 */
export const toggleTreeValue = (
  value: string,
  currentValues: TreeMultiComboBoxValue,
  options: TreeMultiComboBoxOption[],
): TreeMultiComboBoxValue => {
  const index = createTreeOptionIndex(options);

  if (isParentValue(value, index)) {
    return toggleParentValue(value, currentValues, options);
  }

  if (isChildValue(value, index)) {
    return toggleChildValue(value, currentValues, options);
  }

  return currentValues;
};

/**
 * Normalizes a value array according to tree semantics.
 *
 * Normalization rules:
 * - Remove values that do not exist.
 * - Remove disabled children.
 * - Remove disabled parents.
 * - Keep leaf parents as standalone values.
 * - Remove child values when their parent value is selected.
 * - Collapse fully selected enabled children into a single parent value.
 * - Remove duplicates.
 */
export const normalizeTreeValues = (
  values: TreeMultiComboBoxValue,
  options: TreeMultiComboBoxOption[],
): TreeMultiComboBoxValue => {
  const index = createTreeOptionIndex(options);
  const nextValueSet = new Set<string>();

  for (const value of values) {
    if (isParentValue(value, index)) {
      const parent = index.parentMap.get(value);

      if (parent && !isParentDisabled(parent)) {
        nextValueSet.add(value);
      }

      continue;
    }

    if (isChildValue(value, index) && !isChildDisabled(value, index)) {
      nextValueSet.add(value);
    }
  }

  for (const parent of options) {
    const enabledChildValues = getEnabledChildValues(parent);

    if (isParentDisabled(parent)) {
      nextValueSet.delete(parent.value);

      for (const childValue of enabledChildValues) {
        nextValueSet.delete(childValue);
      }

      continue;
    }

    if (isLeafParent(parent)) {
      continue;
    }

    if (nextValueSet.has(parent.value)) {
      for (const childValue of enabledChildValues) {
        nextValueSet.delete(childValue);
      }

      continue;
    }

    const areAllEnabledChildrenSelected = enabledChildValues.every(
      (childValue) => nextValueSet.has(childValue),
    );

    if (areAllEnabledChildrenSelected) {
      for (const childValue of enabledChildValues) {
        nextValueSet.delete(childValue);
      }

      nextValueSet.add(parent.value);
    }
  }

  return [...nextValueSet];
};

/**
 * Builds the selected item list used by trigger badges.
 *
 * Rules:
 * - A fully selected parent is rendered as a single parent badge.
 * - Partial child selections are rendered as child badges.
 */
export const getSelectedTreeItems = (
  values: TreeMultiComboBoxValue,
  options: TreeMultiComboBoxOption[],
): TreeMultiComboBoxSelectedItem[] => {
  const normalizedValues = normalizeTreeValues(values, options);
  const index = createTreeOptionIndex(options);

  return normalizedValues.flatMap<TreeMultiComboBoxSelectedItem>((value) => {
    const parent = index.parentMap.get(value);

    if (parent) {
      return [
        {
          kind: "parent" as const,
          value: parent.value,
          label: parent.label,
          disabled: parent.disabled,
        },
      ];
    }

    const child = index.childMap.get(value);

    if (!child) {
      return [];
    }

    return [
      {
        kind: "child" as const,
        value: child.value,
        label: child.label,
        disabled: child.disabled,
      },
    ];
  });
};

/**
 * Creates a filter function for `Command`.
 *
 * Rules:
 * - Parent rows match against parent label and value.
 * - Child rows match against child label/value and parent label/value.
 *
 * For example, searching for "Hardware" also exposes children under "Hardware".
 */
export const createTreeCommandFilter = (options: TreeMultiComboBoxOption[]) => {
  const index = createTreeOptionIndex(options);

  return (itemValue: string, search: string) => {
    const normalizedSearch = normalize(search);

    if (!normalizedSearch) {
      return 1;
    }

    const parent = index.parentMap.get(itemValue);

    if (parent) {
      return normalize(parent.label).includes(normalizedSearch) ||
        normalize(parent.value).includes(normalizedSearch)
        ? 1
        : 0;
    }

    const child = index.childMap.get(itemValue);

    if (!child) {
      return 0;
    }

    const childParent = getParentByChildValue(child.value, index);

    return normalize(child.label).includes(normalizedSearch) ||
      normalize(child.value).includes(normalizedSearch) ||
      normalize(childParent?.label ?? "").includes(normalizedSearch) ||
      normalize(childParent?.value ?? "").includes(normalizedSearch)
      ? 1
      : 0;
  };
};

/**
 * Returns derived state used to render a parent row.
 */
export const getParentRenderState = (
  parent: TreeMultiComboBoxOption,
  values: TreeMultiComboBoxValue,
) => {
  return {
    item: parent,
    checkState: getParentCheckState(parent, values),
    selectedChildCount: getSelectedChildCountForParent(parent, values),
    totalChildCount: getTotalEnabledChildCountForParent(parent),
    disabled: isParentDisabled(parent),
  };
};

/**
 * Returns derived state used to render a child row.
 */
export const getChildRenderState = (
  child: MultiComboBoxItem,
  values: TreeMultiComboBoxValue,
  index: TreeMultiComboBoxOptionIndex,
) => {
  return {
    item: child,
    selected: isChildSelected(child.value, values, index),
    disabled: isChildDisabled(child.value, index),
  };
};
