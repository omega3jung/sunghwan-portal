import { Preference } from "@/types";

export const localUserSettingRepo = {
  fetch: async () => {
    const raw = localStorage.getItem("user_setting");
    return raw
      ? JSON.parse(raw)
      : { screen_mode: "system", color_theme: "aquamarine", language: "en" };
  },

  post: async (data: Preference) => {
    localStorage.setItem("screen_mode", JSON.stringify(data.screenMode));
    localStorage.setItem("color_theme", JSON.stringify(data.colorTheme));
    localStorage.setItem("language", JSON.stringify(data.screenMode));
    return data;
  },

  put: async (data: Preference) => {
    localStorage.setItem("screen_mode", JSON.stringify(data.screenMode));
    localStorage.setItem("color_theme", JSON.stringify(data.colorTheme));
    localStorage.setItem("language", JSON.stringify(data.screenMode));
    return data;
  },
};
