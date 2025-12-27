import { Preference } from "@/types";

export const localUserPreferenceRepo = {
  fetch: async () => {
    const raw = localStorage.getItem("user_preference");
    return raw
      ? JSON.parse(raw)
      : { screenMode: "system", colorTheme: "Aquamarine", language: "en" };
  },

  post: async (data: Preference) => {
    localStorage.setItem("screenMode", JSON.stringify(data.screenMode));
    localStorage.setItem("colorTheme", JSON.stringify(data.colorTheme));
    localStorage.setItem("language", JSON.stringify(data.language));
    return data;
  },

  put: async (data: Preference) => {
    localStorage.setItem("screenMode", JSON.stringify(data.screenMode));
    localStorage.setItem("colorTheme", JSON.stringify(data.colorTheme));
    localStorage.setItem("language", JSON.stringify(data.language));
    return data;
  },
};
