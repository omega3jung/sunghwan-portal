import type { ImageValueLabel } from "@/shared/types/options";

export const EMPTY_OPTION_TEXT = "No option found.";

const normalize = (value: string) => value.trim().toUpperCase();

export const splitOptionsBySelection = (
  options: ImageValueLabel[],
  selectedValues: string[],
) => {
  const selectedValueSet = new Set(selectedValues);

  const selectedOptions = selectedValues
    .map((selectedValue) =>
      options.find((option) => option.value === selectedValue),
    )
    .filter((option): option is ImageValueLabel => Boolean(option));

  const unselectedOptions = options.filter(
    (option) => !selectedValueSet.has(option.value),
  );

  return { selectedOptions, unselectedOptions };
};

export const createCommandFilter = (options: ImageValueLabel[]) => {
  return (itemValue: string, search: string) => {
    const normalizedSearch = normalize(search);

    if (!normalizedSearch) {
      return 1;
    }

    const matchedOption = options.find(
      ({ label, value }) =>
        value === itemValue &&
        (normalize(label).includes(normalizedSearch) ||
          normalize(value).includes(normalizedSearch)),
    );

    return matchedOption ? 1 : 0;
  };
};
