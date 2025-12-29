import { detectBrowserLanguage } from "@/lib/i18n/detectLanguage";
import { Preference } from "@/types";

export const localUserPreferenceRepo = {
  fetch: async () => {
    const raw = localStorage.getItem("sunghwan_portal_user_preference");
    return raw
      ? (JSON.parse(raw) as Preference)
      : ({
          screenMode: "system",
          colorTheme: "default",
          language: detectBrowserLanguage(),
        } as Preference);
  },

  post: async (data: Preference) => {
    localStorage.setItem(
      "sunghwan_portal_user_preference",
      JSON.stringify(data)
    );
    return data;
  },

  put: async (data: Preference) => {
    localStorage.setItem(
      "sunghwan_portal_user_preference",
      JSON.stringify(data)
    );
    return data;
  },
};
