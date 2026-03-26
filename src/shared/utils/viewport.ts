/**
 * Returns the current responsive breakpoint label based on the browser window width.
 *
 * Use for:
 * - Branching UI behavior by Tailwind-like breakpoint names
 * - Reading the active viewport range in client-only logic
 *
 * @param none - This function does not accept any arguments
 * @returns A breakpoint label of `sm`, `md`, `lg`, `xl`, or `xxl` for the current window width
 */
export const getCurrentBreakpoint = (): string => {
  const width = window.innerWidth;

  if (width < 640) {
    return "sm";
  } else if (width < 768) {
    return "md";
  } else if (width < 1024) {
    return "lg";
  } else if (width < 1280) {
    return "xl";
  } else {
    return "xxl";
  }
};
