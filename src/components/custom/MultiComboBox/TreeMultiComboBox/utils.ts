import type { MultiComboBoxItem } from "../types";
import type {
  TreeCheckState,
  TreeMultiComboBoxNode,
  TreeMultiComboBoxOption,
  TreeMultiComboBoxOptionIndex,
  TreeMultiComboBoxSelectedItem,
  TreeMultiComboBoxValue,
} from "./types";

const normalize = (value: string) => value.trim().toUpperCase();

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

  return { parentMap, childMap, childToParentMap };
};

export const createTreeBadgeOrderMap = (
  options: TreeMultiComboBoxOption[],
) => {
  const orderMap = new Map<string, number>();

  for (const [parentIndex, parent] of options.entries()) {
    orderMap.set(parent.value, parentIndex);

    for (const [childIndex, child] of parent.children.entries()) {
      orderMap.set(child.value, parentIndex + childIndex + 1);
    }
  }

  return orderMap;
};

export const flattenTreeOptions = (
  options: TreeMultiComboBoxOption[],
): TreeMultiComboBoxNode[] => {
  return options.flatMap<TreeMultiComboBoxNode>((parent) => [
    { ...parent, kind: "parent" },
    ...parent.children.map((child) => ({
      ...child,
      kind: "child" as const,
      parentValue: parent.value,
    })),
  ]);
};

const getEnabledChildValues = (
  parent: TreeMultiComboBoxOption,
): string[] => {
  return parent.children
    .filter((child) => !child.disabled)
    .map((child) => child.value);
};

const isChildDisabled = (
  childValue: string,
  index: TreeMultiComboBoxOptionIndex,
): boolean => {
  const child = index.childMap.get(childValue);
  const parent = index.childToParentMap.get(childValue);

  return !child || Boolean(child.disabled || parent?.disabled);
};

const getSelectedChildValuesForParent = (
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

export const getParentCheckState = (
  parent: TreeMultiComboBoxOption,
  values: TreeMultiComboBoxValue,
): TreeCheckState => {
  if (parent.children.length === 0) {
    return values.includes(parent.value) ? "checked" : "unchecked";
  }

  const totalChildCount = getEnabledChildValues(parent).length;

  if (totalChildCount === 0) {
    return "unchecked";
  }

  const selectedChildCount = getSelectedChildValuesForParent(
    parent,
    values,
  ).length;

  if (selectedChildCount === 0) {
    return "unchecked";
  }

  return selectedChildCount === totalChildCount ? "checked" : "partial";
};

export const isChildSelected = (
  childValue: string,
  values: TreeMultiComboBoxValue,
  index: TreeMultiComboBoxOptionIndex,
): boolean => {
  if (isChildDisabled(childValue, index)) {
    return false;
  }

  if (values.includes(childValue)) {
    return true;
  }

  const parent = index.childToParentMap.get(childValue);

  return Boolean(parent && values.includes(parent.value));
};

export const normalizeTreeValues = (
  values: TreeMultiComboBoxValue,
  options: TreeMultiComboBoxOption[],
): TreeMultiComboBoxValue => {
  const index = createTreeOptionIndex(options);
  const nextValueSet = new Set<string>();

  for (const value of values) {
    const parent = index.parentMap.get(value);

    if (parent) {
      if (!parent.disabled) {
        nextValueSet.add(value);
      }

      continue;
    }

    if (index.childMap.has(value) && !isChildDisabled(value, index)) {
      nextValueSet.add(value);
    }
  }

  for (const parent of options) {
    const enabledChildValues = getEnabledChildValues(parent);

    if (parent.disabled) {
      nextValueSet.delete(parent.value);

      for (const child of parent.children) {
        nextValueSet.delete(child.value);
      }

      continue;
    }

    if (parent.children.length === 0) {
      continue;
    }

    if (nextValueSet.has(parent.value)) {
      for (const childValue of enabledChildValues) {
        nextValueSet.delete(childValue);
      }

      continue;
    }

    if (
      enabledChildValues.length > 0 &&
      enabledChildValues.every((childValue) =>
        nextValueSet.has(childValue),
      )
    ) {
      for (const childValue of enabledChildValues) {
        nextValueSet.delete(childValue);
      }

      nextValueSet.add(parent.value);
    }
  }

  return [...nextValueSet];
};

const toggleParentValue = (
  parentValue: string,
  currentValues: TreeMultiComboBoxValue,
  options: TreeMultiComboBoxOption[],
): TreeMultiComboBoxValue => {
  const index = createTreeOptionIndex(options);
  const parent = index.parentMap.get(parentValue);

  if (!parent || parent.disabled) {
    return currentValues;
  }

  const childValues = parent.children.map((child) => child.value);
  const nextValues = currentValues.filter(
    (value) => value !== parentValue && !childValues.includes(value),
  );

  if (getParentCheckState(parent, currentValues) === "checked") {
    return normalizeTreeValues(nextValues, options);
  }

  return normalizeTreeValues([...nextValues, parentValue], options);
};

const toggleChildValue = (
  childValue: string,
  currentValues: TreeMultiComboBoxValue,
  options: TreeMultiComboBoxOption[],
): TreeMultiComboBoxValue => {
  const index = createTreeOptionIndex(options);
  const parent = index.childToParentMap.get(childValue);

  if (!parent || isChildDisabled(childValue, index)) {
    return currentValues;
  }

  const strippedValues = currentValues.filter(
    (value) =>
      value !== parent.value &&
      !parent.children.some((child) => child.value === value),
  );

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

  return normalizeTreeValues(
    [...strippedValues, ...selectedChildValues],
    options,
  );
};

export const toggleTreeValue = (
  targetValue: string,
  currentValues: TreeMultiComboBoxValue,
  options: TreeMultiComboBoxOption[],
): TreeMultiComboBoxValue => {
  const index = createTreeOptionIndex(options);

  if (index.parentMap.has(targetValue)) {
    return toggleParentValue(targetValue, currentValues, options);
  }

  if (index.childMap.has(targetValue)) {
    return toggleChildValue(targetValue, currentValues, options);
  }

  return currentValues;
};

export const getSelectedTreeItems = (
  values: TreeMultiComboBoxValue,
  options: TreeMultiComboBoxOption[],
): TreeMultiComboBoxSelectedItem[] => {
  const index = createTreeOptionIndex(options);

  return normalizeTreeValues(values, options).flatMap<TreeMultiComboBoxSelectedItem>(
    (value) => {
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
        ...child,
        kind: "child" as const,
        parentValue: index.childToParentMap.get(value)?.value ?? "",
      },
    ];
    },
  );
};

export const createTreeComboboxFilter = (
  options: TreeMultiComboBoxOption[],
) => {
  const index = createTreeOptionIndex(options);

  return (item: TreeMultiComboBoxNode, search: string): boolean => {
    const normalizedSearch = normalize(search);

    if (!normalizedSearch) {
      return true;
    }

    if (
      normalize(item.label).includes(normalizedSearch) ||
      normalize(item.value).includes(normalizedSearch)
    ) {
      return true;
    }

    if (item.kind === "parent") {
      return false;
    }

    const parent = index.parentMap.get(item.parentValue);

    return Boolean(
      parent &&
        (normalize(parent.label).includes(normalizedSearch) ||
          normalize(parent.value).includes(normalizedSearch)),
    );
  };
};

export const getParentRenderState = (
  parent: TreeMultiComboBoxOption,
  values: TreeMultiComboBoxValue,
) => {
  return {
    checkState: getParentCheckState(parent, values),
    selectedChildCount: getSelectedChildValuesForParent(parent, values).length,
    totalChildCount: getEnabledChildValues(parent).length,
    disabled: Boolean(parent.disabled),
  };
};
