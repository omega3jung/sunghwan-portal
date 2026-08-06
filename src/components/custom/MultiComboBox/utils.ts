import type { MultiComboBoxItem } from "./types";

const normalize = (value: string) => value.trim().toUpperCase();

/** Shared by flat and tree selectors to preserve one value-to-option lookup rule. */
export const createOptionMap = <T extends MultiComboBoxItem>(options: T[]) => {
  return new Map(options.map((option) => [option.value, option]));
};

// Badge colors follow source-option order even when selected badges use value order.
export const createOptionOrderMap = <T extends MultiComboBoxItem>(
  options: T[],
) => {
  return new Map(options.map((option, index) => [option.value, index]));
};

/** Selected badges follow caller-provided value order, not source-option order. */
export const getSelectedOptions = <T extends MultiComboBoxItem>(
  options: T[],
  selectedValues: string[],
): T[] => {
  const optionMap = createOptionMap(options);

  return selectedValues
    .map((selectedValue) => optionMap.get(selectedValue))
    .filter((option): option is T => Boolean(option));
};

/** Disabled options are valid display data but never selectable values. */
export const isSelectableOption = (
  options: MultiComboBoxItem[],
  value: string,
): boolean => {
  const optionMap = createOptionMap(options);
  const option = optionMap.get(value);

  return Boolean(option && !option.disabled);
};

/** A disabled or unknown option leaves the current selection unchanged. */
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

// Disabled options remain discoverable in search; selection guards reject them later.
export const createComboboxFilter = () => {
  return (item: MultiComboBoxItem, search: string) => {
    const normalizedSearch = normalize(search);

    if (!normalizedSearch) {
      return true;
    }

    return (
      normalize(item.label).includes(normalizedSearch) ||
      normalize(item.value).includes(normalizedSearch)
    );
  };
};
