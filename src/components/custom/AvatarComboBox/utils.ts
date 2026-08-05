import type { ImageValueLabel } from "@/shared/types/options";

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

export const createComboboxFilter = () => {
  return (item: ImageValueLabel, search: string) => {
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
