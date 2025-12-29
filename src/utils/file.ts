export const makeFile = (text: string, name: string, type = "text/plain") => {
  const blob = new Blob([text], { type });

  return new File([blob], `${name ?? new Date().toISOString()}`, { type });
};
