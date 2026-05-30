export function createPreferenceKey<
  TModuleKey extends string,
  TPreferenceType extends string,
>(moduleKey: TModuleKey, preferenceType: TPreferenceType) {
  return `${moduleKey}.${preferenceType}` as `${TModuleKey}.${TPreferenceType}`;
}

export function parsePreferenceKey(preferenceKey: string) {
  const lastDotIndex = preferenceKey.lastIndexOf(".");

  if (lastDotIndex <= 0 || lastDotIndex === preferenceKey.length - 1) {
    throw new Error(`Invalid preference key: ${preferenceKey}`);
  }

  return {
    moduleKey: preferenceKey.slice(0, lastDotIndex),
    preferenceType: preferenceKey.slice(lastDotIndex + 1),
  };
}
