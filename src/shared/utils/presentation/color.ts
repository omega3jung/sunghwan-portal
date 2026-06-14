function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function toHex(value: number) {
  return Math.round(value).toString(16).padStart(2, "0");
}

const CSS_HEX_COLOR_REGEX = /^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
const CSS_HSL_COLOR_REGEX =
  /^hsl\(\s*(-?\d+(?:\.\d+)?)(?:deg)?(?:\s+|,\s*)(\d+(?:\.\d+)?)%(?:\s+|,\s*)(\d+(?:\.\d+)?)%(?:\s*\/\s*[\d.]+%?)?\s*\)$/i;
const CSS_HSL_TOKEN_REGEX =
  /^(-?\d+(?:\.\d+)?)(?:deg)?(?:\s+|,\s*)(\d+(?:\.\d+)?)%(?:\s+|,\s*)(\d+(?:\.\d+)?)%(?:\s*\/\s*[\d.]+%?)?$/i;
const CSS_VARIABLE_REFERENCE_REGEX =
  /^var\(\s*(--[\w-]+)(?:\s*,\s*(.+))?\s*\)$/;

function hslToHex(hue: number, saturation: number, lightness: number) {
  const normalizedHue = ((hue % 360) + 360) % 360;
  const normalizedSaturation = clamp(saturation / 100, 0, 1);
  const normalizedLightness = clamp(lightness / 100, 0, 1);

  const chroma =
    (1 - Math.abs(2 * normalizedLightness - 1)) * normalizedSaturation;
  const segment = normalizedHue / 60;
  const secondary = chroma * (1 - Math.abs((segment % 2) - 1));
  const lightnessMatch = normalizedLightness - chroma / 2;

  let red = 0;
  let green = 0;
  let blue = 0;

  if (segment >= 0 && segment < 1) {
    red = chroma;
    green = secondary;
  } else if (segment < 2) {
    red = secondary;
    green = chroma;
  } else if (segment < 3) {
    green = chroma;
    blue = secondary;
  } else if (segment < 4) {
    green = secondary;
    blue = chroma;
  } else if (segment < 5) {
    red = secondary;
    blue = chroma;
  } else {
    red = chroma;
    blue = secondary;
  }

  return `#${toHex((red + lightnessMatch) * 255)}${toHex(
    (green + lightnessMatch) * 255,
  )}${toHex((blue + lightnessMatch) * 255)}`;
}

function normalizeHexColor(value: string) {
  const normalizedValue = value.trim();

  if (!CSS_HEX_COLOR_REGEX.test(normalizedValue)) {
    return null;
  }

  if (normalizedValue.length === 7) {
    return normalizedValue;
  }

  return `#${normalizedValue
    .slice(1)
    .split("")
    .map((channel) => `${channel}${channel}`)
    .join("")}`;
}

function parseCssHslColorValueToHex(value: string) {
  const normalizedValue = value.trim();
  const hslValue = CSS_HSL_COLOR_REGEX.test(normalizedValue)
    ? normalizedValue.slice(4, -1).trim()
    : normalizedValue;
  const hslTokens = hslValue.match(CSS_HSL_TOKEN_REGEX);

  if (!hslTokens) {
    return null;
  }

  return hslToHex(
    Number(hslTokens[1]),
    Number(hslTokens[2]),
    Number(hslTokens[3]),
  );
}

function getRootCssCustomPropertyValue(variableName: `--${string}`) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
}

function resolveCssVariableReferenceValue(
  value: string,
  visited: Set<`--${string}`>,
): string | null {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  const variableReference = normalizedValue.match(CSS_VARIABLE_REFERENCE_REGEX);

  if (!variableReference) {
    return normalizedValue;
  }

  const [, referencedVariableName, fallbackValue] = variableReference;
  const resolvedReferenceValue = getResolvedCssCustomPropertyValue(
    referencedVariableName as `--${string}`,
    visited,
  );

  if (resolvedReferenceValue) {
    return resolvedReferenceValue;
  }

  return fallbackValue
    ? resolveCssVariableReferenceValue(fallbackValue, visited)
    : null;
}

function getResolvedCssCustomPropertyValue(
  variableName: `--${string}`,
  visited = new Set<`--${string}`>(),
): string | null {
  if (visited.has(variableName)) {
    return null;
  }

  const cssVariableValue = getRootCssCustomPropertyValue(variableName);

  if (!cssVariableValue) {
    return null;
  }

  return resolveCssVariableReferenceValue(
    cssVariableValue,
    new Set(visited).add(variableName),
  );
}

function resolveCssVariableColor(
  variableName: `--${string}`,
  fallbackColor: string,
  resolver: (value: string) => string | null,
) {
  if (typeof window === "undefined") {
    return fallbackColor;
  }

  const cssVariableValue = getResolvedCssCustomPropertyValue(variableName);

  if (!cssVariableValue) {
    return fallbackColor;
  }

  return resolver(cssVariableValue) ?? fallbackColor;
}

/**
 * Resolves a raw CSS color value to a hex color string.
 *
 * Use for:
 * - Converting a computed CSS custom property value into hex after it has already been read from the DOM
 * - Normalizing either hex literals or HSL tokens into a single 6-digit hex format
 *
 * @param value - Raw CSS color value such as `#171717`, `38 90% 48%`, or `hsl(38 90% 48%)`
 * @param fallbackColor - Hex fallback used when the value cannot be parsed
 * @returns A 6-digit hex color string
 */
export function resolveCssColorValue(value: string, fallbackColor: string) {
  return normalizeHexColor(value) ?? parseCssHslColorValueToHex(value) ?? fallbackColor;
}

/**
 * Resolves a CSS custom property on the root document element to a hex color.
 *
 * Use for:
 * - Reading theme tokens that are already stored as hex values
 * - Following aliased CSS variables such as `--brand: var(--primary)`
 *
 * @param variableName - CSS custom property name like `--primary`
 * @param fallbackColor - Hex fallback used when the variable is missing or cannot be parsed
 * @returns A 6-digit hex color string
 */
export function resolveCssHexColor(
  variableName: `--${string}`,
  fallbackColor: string,
) {
  return resolveCssVariableColor(variableName, fallbackColor, normalizeHexColor);
}

/**
 * Resolves a CSS custom property on the root document element from HSL to hex.
 *
 * Use for:
 * - Converting theme HSL tokens such as `--primary` into hex values for native inputs
 * - Following aliased CSS variables such as `--brand: var(--primary)`
 *
 * @param variableName - CSS custom property name like `--primary`
 * @param fallbackColor - Hex fallback used when the variable is missing or cannot be parsed
 * @returns A 6-digit hex color string
 */
export function resolveCssHslColor(
  variableName: `--${string}`,
  fallbackColor: string,
) {
  return resolveCssVariableColor(
    variableName,
    fallbackColor,
    parseCssHslColorValueToHex,
  );
}

/**
 * Resolves a CSS custom property on the root document element to a hex color.
 *
 * The function inspects the resolved CSS variable value and automatically
 * chooses the appropriate hex or HSL parser.
 *
 * @param variableName - CSS custom property name like `--primary`
 * @param fallbackColor - Hex fallback used when the variable is missing or cannot be parsed
 * @returns A 6-digit hex color string
 */
export function resolveCssColor(
  variableName: `--${string}`,
  fallbackColor: string,
) {
  return resolveCssVariableColor(variableName, fallbackColor, (value) =>
    resolveCssColorValue(value, fallbackColor),
  );
}
