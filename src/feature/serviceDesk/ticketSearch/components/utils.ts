/** Documents the append unique responsibility exposed by this client feature module. */
export const appendUnique = <T extends string>(values: T[], value: T) => {
  if (values.includes(value)) {
    return values;
  }

  return [...values, value];
};

/** Documents the remove value responsibility exposed by this client feature module. */
export const removeValue = <T extends string>(values: T[], value: T) => {
  return values.filter((item) => item !== value);
};
