const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

export const STORYBOOK_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:6006"
    : `${basePath}/storybook-static/index.html`;
