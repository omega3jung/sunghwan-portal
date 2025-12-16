import { UserSettings } from "@/types";

export const localUserSettingRepo = {
  fetch: async () => {
    const raw = localStorage.getItem("user_setting");
    return raw ? JSON.parse(raw) : { theme: "system", lang: "en" };
  },

  post: async (data: UserSettings) => {
    localStorage.setItem("screen_mode", JSON.stringify(data.screenMode));
    localStorage.setItem("color_theme", JSON.stringify(data.colorTheme));
    localStorage.setItem("language", JSON.stringify(data.screenMode));
    return data;
  },

  put: async (data: UserSettings) => {
    localStorage.setItem("screen_mode", JSON.stringify(data.screenMode));
    localStorage.setItem("color_theme", JSON.stringify(data.colorTheme));
    localStorage.setItem("language", JSON.stringify(data.screenMode));
    return data;
  },
};
