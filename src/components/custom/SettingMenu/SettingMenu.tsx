import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Check, Globe, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ComboBox } from "@/components/custom/ComboBox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useLanguageState } from "@/services/language";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { AvailableLanguages, ColorTheme } from "@/types";
import {
  useFetchUserSetting,
  usePostUserSetting,
  usePutUserSetting,
} from "@/hooks/useUserSetting";

type Props = {
  displayExtra: boolean;
  onExtraClick: (status: boolean) => void;
};

const themeButtons = [
  { name: "Emerald", hex: "bg-[#008844]" },
  { name: "Topaz", hex: "bg-[#F97414]" },
  { name: "Ruby", hex: "bg-[#F17EAD]" },
  { name: "Aquamarine", hex: "bg-[#0F9D9F]" },
] as { name: ColorTheme; hex: string }[];

export const SettingMenu = (props: Partial<Props>) => {
  const { language, setLanguage } = useLanguageState();
  const { width } = useWindowDimensions();

  const [open, setOpen] = useState(false);

  const [mode, setMode] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [theme, setTheme] = useState(() =>
    localStorage.getItem("selectedTheme")
  );

  const { data: userSetting } = useFetchUserSetting();
  const { mutate: createUserSetting } = usePostUserSetting();
  const { mutate: updateUserSetting } = usePutUserSetting();

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
  }, [setLanguage, userSetting]);

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
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild className="gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-18 h-8 rounded-full hover:bg-transparent"
          ref={buttonRef}
        >
          <Settings name="settings" className="text-[#D9D9D9]" size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverPrimitive.Portal>
        <PopoverContent className="h-full w-80 p-6">
          <div id="SettingMenu" className="flex flex-col gap-2">
            <div className="font-semibold">Color theme</div>
            <div className="flex w-full items-center justify-between px-8 py-2">
              {themeButtons.map((e) => {
                return (
                  <Button
                    key={e.name}
                    className={cn(
                      "rounded-full",
                      e.hex,
                      theme === e.name ? "h-8 w-8 p-0" : "h-4 w-4 p-0"
                    )}
                    onClick={() => handleThemeChange(e.name)}
                  >
                    <Check className={theme === e.name ? "" : "hidden"} />
                  </Button>
                );
              })}
            </div>
            <div className="pt-4 font-semibold">Dark Mode</div>
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
                Language
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
      </PopoverPrimitive.Portal>
    </Popover>
  );
};
