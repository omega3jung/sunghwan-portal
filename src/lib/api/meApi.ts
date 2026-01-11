import { AppUser } from "@/types";

// lib/api/meApi.ts
export const meApi = {
  get: async (): Promise<AppUser> => {
    const res = await fetch("/api/me");
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  },
};
