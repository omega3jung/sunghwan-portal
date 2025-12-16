export const ENVIRONMENT = {
    BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  
    API: {
      PORTAL: process.env.NEXT_PUBLIC_PORTAL_API_URL ?? "",
      NODE: process.env.NEXT_PUBLIC_NODE_API_URL ?? "",
    },
  
    ASSET: {
      LOGO: process.env.NEXT_PUBLIC_ASSET_LOGO ?? "",
    },
  
    CONTEXT: (process.env.NEXT_PUBLIC_CONTEXT ??
      process.env.NODE_ENV) as
      | "development"
      | "production"
      | "demo",
  } as const;