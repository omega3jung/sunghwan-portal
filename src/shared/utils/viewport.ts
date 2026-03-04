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
