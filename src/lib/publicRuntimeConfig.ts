type Context = "development" | "test" | "staging" | "production" | "demo";

const getEnv = () => {
  return {
    BASE_PATH: (process.env.NEXT_PUBLIC_BASE_PATH as string) || "",

    // APIs
    PORTAL_API_URL: (process.env.NEXT_PUBLIC_PORTAL_API_URL as string) || "",
    NODE_API_URL: (process.env.NEXT_PUBLIC_NODE_API_URL as string) || "",

    MENU_IMAGE: (process.env.NEXT_PUBLIC_MENU_IMAGE as string) || "",
    NODE_ENV: process.env.NODE_ENV,
    CONTEXT: (process.env.NEXT_PUBLIC_CONTEXT ||
      process.env.NODE_ENV) as Context,
  };
};

export const ENVIRONMENT = getEnv();
