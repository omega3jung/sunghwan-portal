import type { MultiComboBoxItem } from "./types";

export const EMPTY_OPTION_TEXT = "No option found.";

const normalize = (value: string) => value.trim().toUpperCase();

/**
 * Creates a value-keyed map for fast option lookup.
 * This helper is also reused by `TreeMultiComboBox`.
 */
export const createOptionMap = <T extends MultiComboBoxItem>(options: T[]) => {
  return new Map(options.map((option) => [option.value, option]));
};

/**
 * Creates a value-keyed map of the original `options` order.
 * Useful when selected values should keep their own render order,
 * while derived UI like palette colors must stay aligned with source options.
 */
export const createOptionOrderMap = <T extends MultiComboBoxItem>(
  options: T[],
) => {
  return new Map(options.map((option, index) => [option.value, index]));
};

/**
 * Rebuilds the selected option list in the order of `selectedValues`,
 * not in the original `options` order.
 * Used when rendering badges.
 */
export const getSelectedOptions = <T extends MultiComboBoxItem>(
  options: T[],
  selectedValues: string[],
): T[] => {
  const optionMap = createOptionMap(options);

  return selectedValues
    .map((selectedValue) => optionMap.get(selectedValue))
    .filter((option): option is T => Boolean(option));
};

/**
 * Returns whether a value points to a selectable option.
 * Disabled options are treated as non-selectable.
 */
export const isSelectableOption = (
  options: MultiComboBoxItem[],
  value: string,
): boolean => {
  const optionMap = createOptionMap(options);
  const option = optionMap.get(value);

  return Boolean(option && !option.disabled);
};

/**
 * Returns the next selection state for a single toggle action.
 * Disabled options keep the current state unchanged.
 *
 * This works well with the current `onSelect` / `onRemove` API
 * and can be reused later if the component moves to an `onChange` API.
 */
export const getToggledValues = (
  currentValues: string[],
  targetValue: string,
  options: MultiComboBoxItem[],
): string[] => {
  if (!isSelectableOption(options, targetValue)) {
    return currentValues;
  }

  if (currentValues.includes(targetValue)) {
    return currentValues.filter((value) => value !== targetValue);
  }

  return [...currentValues, targetValue];
};

/**
 * Creates a filter function for `Command`.
 * Matching is based on `label` and `value`.
 *
 * Disabled options are still searchable and visible,
 * but they remain non-selectable.
 */
export const createCommandFilter = <T extends MultiComboBoxItem>(
  options: T[],
) => {
  const optionMap = createOptionMap(options);

  return (itemValue: string, search: string) => {
    const normalizedSearch = normalize(search);

    if (!normalizedSearch) {
      return 1;
    }

    const matchedOption = optionMap.get(itemValue);

    if (!matchedOption) {
      return 0;
    }

    return normalize(matchedOption.label).includes(normalizedSearch) ||
      normalize(matchedOption.value).includes(normalizedSearch)
      ? 1
      : 0;
  };
};
