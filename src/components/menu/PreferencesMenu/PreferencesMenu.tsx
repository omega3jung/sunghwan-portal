"use client";

import { Check, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { ComboBox } from "@/components/custom/ComboBox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
  useFetchUserPreference,
  usePostUserPreference,
  usePutUserPreference,
} from "@/hooks/useUserPreference";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { useLanguageState } from "@/services/language";
import { AvailableLanguages, ColorTheme } from "@/types";
import { cn } from "@/utils";

const themeButtons = [
  { name: "aquamarine", hex: "bg-[#1d0f9f]" },
  { name: "emerald", hex: "bg-[#0f9d9f]" },
  { name: "topaz", hex: "bg-[#f97414]" },
  { name: "ruby", hex: "bg-[#f17ead]" },
] as { name: ColorTheme; hex: string }[];

type PreferencesMenuProps = {
  children: React.ReactElement; // Popover trigger.
};

export const PreferencesMenu = ({ children }: PreferencesMenuProps) => {
  const { width } = useWindowDimensions();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(false);
  const [theme, setTheme] = useState("Aquamarine");

  const { language, setLanguage } = useLanguageState();

  const { data: userSetting } = useFetchUserPreference();
  const { mutate: createUserSetting } = usePostUserPreference();
  const { mutate: updateUserSetting } = usePutUserPreference();

  const { t } = useTranslation("PreferencesMenu");

  useEffect(() => {
    setOpen(false);
  }, [width]);

  useEffect(() => {
    if (!userSetting) return;

    // theme
    if (userSetting.colorTheme) {
      setTheme(userSetting.colorTheme);
      document
        .querySelector("html")
        ?.setAttribute("data-theme", userSetting.colorTheme);
    }

    // dark mode
    if (userSetting.screenMode === "dark") {
      document.documentElement.classList.add("dark");
      setMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setMode(false);
    }

    // language
    if (userSetting.language) {
      setLanguage(userSetting.language);
    }
  }, [userSetting]);

  const handleThemeChange = (newTheme: string) => {
    document.querySelector("html")?.setAttribute("data-theme", newTheme);
    setTheme(newTheme);

    const payload = {
      ...userSetting,
      colorTheme: newTheme,
    };

    if (!userSetting) {
      createUserSetting(payload);
    } else {
      updateUserSetting(payload);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="h-full w-80 p-6">
        <div id="SettingMenu" className="flex flex-col gap-2">
          <div className="font-semibold">{t("colorTheme")}</div>
          <div className="flex w-full items-center justify-between px-8 py-2">
            {themeButtons.map((item) => {
              return (
                <Button
                  key={item.name}
                  title={item.name}
                  className={cn(
                    "rounded-full",
                    item.hex,
                    theme === item.name ? "h-8 w-8 p-0" : "h-4 w-4 p-0"
                  )}
                  onClick={() => handleThemeChange(item.name)}
                >
                  <Check className={theme === item.name ? "" : "hidden"} />
                </Button>
              );
            })}
          </div>
          <div className="pt-4 font-semibold">{t("darkMode")}</div>
          <div>
            <Switch
              checked={mode}
              onCheckedChange={(isDark) => {
                setMode(isDark);

                document.documentElement.classList[isDark ? "add" : "remove"](
                  "dark"
                );

                const payload = {
                  ...userSetting,
                  screenMode: isDark ? "dark" : "light",
                };

                if (!userSetting) {
                  createUserSetting(payload);
                } else {
                  updateUserSetting(payload);
                }
              }}
            />
          </div>

          <div className="pt-6">
            <Label htmlFor="language-picker" className="font-semibold">
              {t("language")}
            </Label>
            <ComboBox
              id="language-picker"
              className="my-2"
              placeholder="Language Picker"
              variant="icon"
              options={AvailableLanguages}
              onChange={setLanguage}
              icon={<Globe />}
              value={language ?? "en"}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
