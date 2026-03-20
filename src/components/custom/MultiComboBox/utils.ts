import type { ValueLabel } from "@/shared/types/options";

export const EMPTY_OPTION_TEXT = "No option found.";

const normalize = (value: string) => value.trim().toUpperCase();

export const getSelectedOptions = (
  options: ValueLabel[],
  selectedValues: string[],
) => {
  return selectedValues
    .map((selectedValue) =>
      options.find((option) => option.value === selectedValue),
    )
    .filter((option): option is ValueLabel => Boolean(option));
};

export const createCommandFilter = (options: ValueLabel[]) => {
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
