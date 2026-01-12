"use client";

import { Check, Globe } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { ComboBox } from "@/components/custom/ComboBox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  usePostUserPreference,
  usePutUserPreference,
} from "@/feature/user/preference/queries";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { useLanguageState } from "@/services/language";
import {
  AvailableLanguages,
  ColorTheme,
  Preference,
  ScreenMode,
} from "@/types";
import { applyColorTheme, cn, isLocale } from "@/utils";

const themeButtons = [
  { name: "default", primary: "0,0%,9%", muted: "0,0%,96.1%" },
  { name: "emerald", primary: "168,75%,32%", muted: "168,40%,88%" },
  { name: "ruby", primary: "350,65%,48%", muted: "350,40%,88%" },
  { name: "sapphire", primary: "221,84%,34%", muted: "221,45%,88%" },
  { name: "topaz", primary: "38,90%,48%", muted: "38,55%,88%" },
] as { name: ColorTheme; primary: string; muted: string }[];

type PreferencesMenuProps = {
  children: React.ReactElement; // Popover trigger.
};

export const PreferencesMenu = ({ children }: PreferencesMenuProps) => {
  const { width } = useWindowDimensions();
  const { current, updateSession } = useCurrentSession();

  const [open, setOpen] = useState(false);

  const [colorTheme, setColorTheme] = useState("default");
  const { theme, setTheme } = useTheme();
  const { language, changeLanguage } = useLanguageState();

  const userPreference = useMemo(
    () => current.user?.preference,
    [current.user?.preference]
  );
  const { mutate: createUserPreference } = usePostUserPreference();
  const { mutate: updateUserPreference } = usePutUserPreference();

  const { t } = useTranslation("PreferencesMenu");

  useEffect(() => {
    setOpen(false);
  }, [width]);

  useEffect(() => {
    if (!userPreference) return;

    // color theme.
    if (userPreference.colorTheme) {
      setColorTheme(userPreference.colorTheme);
      applyColorTheme(userPreference.colorTheme);
    }

    // theme. light/dark mode
    if (userPreference.screenMode) {
      setTheme(userPreference.screenMode);
    }

    // language.
    if (userPreference.language) {
      changeLanguage(userPreference.language);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPreference]);

  const handleThemeChange = (newTheme: ScreenMode) => {
    if (!userPreference) return;

    setTheme(newTheme);

    handleSavePreferences({
      ...userPreference,
      screenMode: newTheme,
    });
  };

  const handleColorThemeChange = (newColor: ColorTheme) => {
    if (!userPreference) return;

    applyColorTheme(newColor);
    setColorTheme(newColor);

    handleSavePreferences({
      ...userPreference,
      colorTheme: newColor,
    });
  };

  const handleLanguageChange = (newLang: string) => {
    if (!userPreference) return;
    if (!isLocale(newLang)) return;

    changeLanguage(newLang);

    handleSavePreferences({
      ...userPreference,
      language: newLang,
    });
  };

  const handleSavePreferences = (payload: Preference) => {
    if (!userPreference) {
      createUserPreference({ userId: null, data: payload });
    } else {
      updateUserPreference({ userId: null, data: payload });
    }

    updateSession({ user: { preference: payload } });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="h-full w-80 p-6">
        <div id="PreferenceMenu" className="flex flex-col gap-2">
          <div className="font-semibold">{t("colorTheme")}</div>
          <div className="flex w-full items-center justify-between px-8 py-2">
            {themeButtons.map((item) => {
              return (
                <Button
                  key={item.name}
                  aria-label={`Color theme: ${item.name}`}
                  title={item.name}
                  style={
                    {
                      "--theme-primary": `hsl(${item.primary})`,
                      "--theme-muted": `hsl(${item.muted})`,
                    } as React.CSSProperties
                  }
                  className={cn(
                    "rounded-full bg-[var(--theme-primary)] hover:bg-[var(--theme-muted)] transition-colors",
                    colorTheme === item.name ? "h-8 w-8 p-0" : "h-4 w-4 p-0"
                  )}
                  onClick={() => handleColorThemeChange(item.name)}
                >
                  {colorTheme === item.name && (
                    <Check className="text-white/80" />
                  )}
                </Button>
              );
            })}
          </div>
          <div className="pt-4 font-semibold">{t("theme")}</div>
          <div>
            <RadioGroup
              value={theme}
              onValueChange={(value: string) =>
                handleThemeChange(value as ScreenMode)
              }
              orientation="horizontal"
              className="flex justify-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="screen-mode-light" />
                <Label htmlFor="screen-mode-light">{t("light")}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="screen-mode-dark" />
                <Label htmlFor="screen-mode-dark">{t("dark")}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="screen-mode-system" />
                <Label htmlFor="screen-mode-system">{t("system")}</Label>
              </div>
            </RadioGroup>
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
              onChange={handleLanguageChange}
              icon={<Globe />}
              value={language ?? "en"}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
