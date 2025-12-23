import { Preference } from "@/types";

export const remoteUserSettingRepo = {
  fetch: async () => {
    const res = await fetch("/api/user-setting", { method: "GET" });
    if (!res.ok) throw new Error("Failed to fetch user setting");
    return await res.json();
  },

  post: async (data: Preference) => {
    const res = await fetch("/api/user-setting", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return await res.json();
  },

  put: async (data: Preference) => {
    const res = await fetch("/api/user-setting", {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return await res.json();
  },
};
