import { ENVIRONMENT } from "@/lib/environment";

export const withBasePath = (path: string) => {
  if (!path.startsWith("/")) {
    throw new Error("withBasePath expects a leading slash");
  }

  return `${ENVIRONMENT.BASE_PATH}${path}`;
};

export const withLeadingSlash = (path: string) => {
  return path.startsWith("/") ? path : `/${path}`;
};
