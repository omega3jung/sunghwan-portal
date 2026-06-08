function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function toHex(value: number) {
  return Math.round(value).toString(16).padStart(2, "0");
}

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

function parseCssColorValueToHex(value: string) {
  const normalizedValue = value.trim();

  if (/^#[0-9A-Fa-f]{6}$/.test(normalizedValue)) {
    return normalizedValue;
  }

  const hslTokens = normalizedValue.match(
    /^(-?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/,
  );

  if (!hslTokens) {
    return null;
  }

  return hslToHex(
    Number(hslTokens[1]),
    Number(hslTokens[2]),
    Number(hslTokens[3]),
  );
}

/**
 * Resolves a CSS custom property on the root document element to a hex color.
 *
 * Use for:
 * - Converting theme HSL tokens such as `--primary` into hex values for native inputs
 * - Reusing theme-aware color defaults in client components
 *
 * @param variableName - CSS custom property name like `--primary`
 * @param fallbackColor - Hex fallback used when the variable is missing or cannot be parsed
 * @returns A 6-digit hex color string
 */
export function resolveCssHexColor(
  variableName: `--${string}`,
  fallbackColor: string,
) {
  if (typeof window === "undefined") {
    return fallbackColor;
  }

  const cssVariableValue = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();

  return parseCssColorValueToHex(cssVariableValue) ?? fallbackColor;
}
