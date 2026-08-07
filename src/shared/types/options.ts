/** String value paired with its presentation label. */
export type ValueLabel<T extends string = string> = {
  value: T;
  label: string;
};

/** Value-label option with optional avatar or alternate display text. */
export type ImageValueLabel<T extends string = string> = ValueLabel<T> & {
  image?: string;
  displayName?: string;
};
