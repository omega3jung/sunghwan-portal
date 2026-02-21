import { ACCESS_LEVEL } from "@/domain/auth";

export const accessLevelOptions = [
  { label: "admin", value: ACCESS_LEVEL.ADMIN },
  { label: "manager", value: ACCESS_LEVEL.MANAGER },
  { label: "user", value: ACCESS_LEVEL.USER },
  { label: "guest", value: ACCESS_LEVEL.GUEST },
] as const;
