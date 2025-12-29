import { Preference } from "@/types";

export const remoteUserPreferenceRepo = {
  fetch: async () => {
    const res = await fetch("/api/user-rreference", { method: "GET" });
    if (!res.ok) throw new Error("Failed to fetch user preference");
    return await res.json();
  },

  post: async (data: Preference) => {
    const res = await fetch("/api/user-preference", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return await res.json();
  },

  put: async (data: Preference) => {
    const res = await fetch("/api/user-preference", {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return await res.json();
  },
};
