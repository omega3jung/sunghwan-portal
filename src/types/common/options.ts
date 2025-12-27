export type ValueLabel<T extends string = string> = {
  value: T;
  label: string;
};

export type ImageValueLabel<T extends string = string> = ValueLabel<T> & {
  image?: string;
};
