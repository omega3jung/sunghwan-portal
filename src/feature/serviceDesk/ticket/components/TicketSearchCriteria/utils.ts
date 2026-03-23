export const appendUnique = <T extends string>(values: T[], value: T) => {
  if (values.includes(value)) {
    return values;
  }

  return [...values, value];
};

export const removeValue = <T extends string>(values: T[], value: T) => {
  return values.filter((item) => item !== value);
};
