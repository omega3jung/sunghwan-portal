"use client";

import { Check, Globe, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { InputGroupAddon } from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ColorTheme,
  MenuMode,
  PortalPreference,
  Preference,
  ScreenMode,
} from "@/domain/user/preference";
import { useCurrentSession } from "@/feature/auth/session/client";
import { preferenceKeys } from "@/feature/user/preference";
import { useUpdateUserPreference } from "@/feature/user/preference/client";
import { useCurrentPreference } from "@/feature/user/preference/client";
import { isLocale, NS } from "@/lib/application/i18n";
import { languageOptions } from "@/lib/client/i18n";
import { applyColorTheme } from "@/lib/client/theme";
import { useWindowDimensions } from "@/shared/client/useWindowDimensions";
import { cn } from "@/shared/utils/presentation";

const themeButtons = [
  {
    name: "default",
    primary: "0,0%,9%",
    darkPrimary: "0,0%,90%",
    muted: "0,0%,96.1%",
  },
  { name: "emerald", primary: "168,75%,32%", muted: "168,40%,88%" },
  { name: "ruby", primary: "350,65%,48%", muted: "350,40%,88%" },
  { name: "sapphire", primary: "221,84%,34%", muted: "221,45%,88%" },
  { name: "topaz", primary: "38,90%,48%", muted: "38,55%,88%" },
] as {
  name: ColorTheme;
  primary: string;
  darkPrimary?: string;
  muted: string;
}[];

type PreferencesMenuProps = {
  trigger?: (props: { label: string }) => React.ReactElement;
};

/**
 * Applies preference changes to client state before persisting the complete
 * preference payload through the active local or remote repository. Responsive
 * layout changes close the popover because they may replace its trigger.
 */
export const PreferencesMenu = ({ trigger }: PreferencesMenuProps) => {
  const { width } = useWindowDimensions();
  const { data: currentSession } = useCurrentSession();
  const isRemote = currentSession?.user.dataScope === "REMOTE";

  const [open, setOpen] = useState(false);

  const {
    current: userPreference,
    setMenu,
    setLanguage,
    setColorTheme,
    setScreenMode,
  } = useCurrentPreference();
  const { mutate: updateUserPreference } = useUpdateUserPreference();

  const { t } = useTranslation(NS.settings, { keyPrefix: "preferences" });
  const { t: tComponent } = useTranslation(NS.component);

  useEffect(() => {
    // An anchored popover cannot retain focus reliably when its trigger is replaced.
    setOpen(false);
  }, [width]);

  const handleMenuChange = (menu: MenuMode) => {
    setMenu(menu);

    handleSavePreferences({
      preferenceKey: preferenceKeys.home.preference,
      preferenceMeta: {
        ...userPreference,
        menu,
      },
    });
  };

  const handleThemeChange = (newTheme: ScreenMode) => {
    if (!userPreference) return;

    setScreenMode(newTheme);

    handleSavePreferences({
      preferenceKey: preferenceKeys.home.preference,
      preferenceMeta: {
        ...userPreference,
        screenMode: newTheme,
      },
    });
  };

  const handleColorThemeChange = (newColor: ColorTheme) => {
    if (!userPreference) return;

    applyColorTheme(newColor);
    setColorTheme(newColor);

    handleSavePreferences({
      preferenceKey: preferenceKeys.home.preference,
      preferenceMeta: {
        ...userPreference,
        colorTheme: newColor,
      },
    });
  };

  const handleLanguageChange = (newLang: string) => {
    if (!userPreference) return;
    if (!isLocale(newLang)) return;

    setLanguage(newLang);

    handleSavePreferences({
      preferenceKey: preferenceKeys.home.preference,
      preferenceMeta: {
        ...userPreference,
        language: newLang,
      },
    });
  };

  const handleSavePreferences = (payload: Preference<PortalPreference>) => {
    updateUserPreference({ isRemote, data: payload });
  };

  const label = t("preferences");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          trigger ? (
            trigger({ label })
          ) : (
            <Button
              className="w-full justify-start px-2 font-normal"
              variant="ghost"
            >
              <Settings2 />
              <span>{label}</span>
            </Button>
          )
        }
      />
      <PopoverContent className="h-full w-80 p-6">
        <PopoverHeader className="sr-only">
          <PopoverTitle>{label}</PopoverTitle>
        </PopoverHeader>

        <FieldGroup id="PreferenceMenu" className="gap-6">
          <FieldSet className="gap-2">
            <FieldLegend variant="label" className="mb-0 font-semibold">
              {t("menu")}
            </FieldLegend>

            <RadioGroup
              value={userPreference.menu}
              onValueChange={(value: string) =>
                handleMenuChange(value as MenuMode)
              }
              className="flex justify-around gap-4"
            >
              <Field orientation="horizontal" className="w-auto gap-2">
                <RadioGroupItem
                  value="collapsible"
                  id="menu-mode-collapsible"
                />
                <FieldLabel htmlFor="menu-mode-collapsible">
                  {t("collapsible")}
                </FieldLabel>
              </Field>

              <Field orientation="horizontal" className="w-auto gap-2">
                <RadioGroupItem value="group" id="menu-mode-group" />
                <FieldLabel htmlFor="menu-mode-group">{t("group")}</FieldLabel>
              </Field>
            </RadioGroup>
          </FieldSet>

          <FieldSet className="gap-2">
            <FieldLegend variant="label" className="mb-0 font-semibold">
              {t("colorTheme")}
            </FieldLegend>

            <RadioGroup
              value={userPreference.colorTheme}
              onValueChange={(value: string) =>
                handleColorThemeChange(value as ColorTheme)
              }
              className="flex w-full h-12 items-center justify-between px-8 py-2"
            >
              {themeButtons.map((item) => {
                const selected = userPreference.colorTheme === item.name;
                const itemId = `color-theme-${item.name}`;

                return (
                  <Field
                    key={item.name}
                    orientation="horizontal"
                    className="relative w-auto gap-0"
                  >
                    <RadioGroupItem
                      value={item.name}
                      id={itemId}
                      title={item.name}
                      style={
                        {
                          "--theme-primary": `hsl(${item.primary})`,
                          "--theme-primary-dark": `hsl(${
                            item.darkPrimary ?? item.primary
                          })`,
                          "--theme-muted": `hsl(${item.muted})`,
                        } as React.CSSProperties
                      }
                      className={cn(
                        "border-0 bg-(--theme-primary) transition-[width,height,background-color] hover:bg-(--theme-muted) data-checked:bg-(--theme-primary) dark:bg-(--theme-primary-dark) dark:hover:bg-(--theme-muted) dark:data-checked:bg-(--theme-primary-dark) [&_[data-slot=radio-group-indicator]]:hidden",
                        selected ? "size-8" : "size-6",
                      )}
                    />
                    <FieldLabel htmlFor={itemId} className="sr-only">
                      {item.name}
                    </FieldLabel>

                    {selected && (
                      <Check
                        aria-hidden="true"
                        className={cn(
                          "pointer-events-none absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 text-white/80",
                          item.name === "default" && "dark:text-black/80",
                        )}
                      />
                    )}
                  </Field>
                );
              })}
            </RadioGroup>
          </FieldSet>

          <FieldSet className="gap-2">
            <FieldLegend variant="label" className="mb-0 font-semibold">
              {t("theme")}
            </FieldLegend>

            <RadioGroup
              value={userPreference.screenMode}
              onValueChange={(value: string) =>
                handleThemeChange(value as ScreenMode)
              }
              className="flex justify-center gap-4"
            >
              <Field orientation="horizontal" className="w-auto gap-2">
                <RadioGroupItem value="light" id="screen-mode-light" />
                <FieldLabel htmlFor="screen-mode-light">
                  {t("light")}
                </FieldLabel>
              </Field>

              <Field orientation="horizontal" className="w-auto gap-2">
                <RadioGroupItem value="dark" id="screen-mode-dark" />
                <FieldLabel htmlFor="screen-mode-dark">{t("dark")}</FieldLabel>
              </Field>

              <Field orientation="horizontal" className="w-auto gap-2">
                <RadioGroupItem value="system" id="screen-mode-system" />
                <FieldLabel htmlFor="screen-mode-system">
                  {t("system")}
                </FieldLabel>
              </Field>
            </RadioGroup>
          </FieldSet>

          <Field className="gap-2">
            <FieldLabel htmlFor="language-picker" className="font-semibold">
              {t("language")}
            </FieldLabel>
            <Combobox
              items={languageOptions}
              itemToStringValue={(option) => option.label}
              value={
                languageOptions.find(
                  (option) =>
                    option.value === (userPreference.language ?? "en"),
                ) ?? null
              }
              onValueChange={(option) => {
                if (option) {
                  handleLanguageChange(option.value);
                }
              }}
            >
              <ComboboxInput
                id="language-picker"
                className="w-full"
                placeholder={t("languagePicker")}
              >
                <InputGroupAddon align="inline-start">
                  <Globe />
                </InputGroupAddon>
              </ComboboxInput>
              <ComboboxContent>
                <ComboboxEmpty>{tComponent("comboBox.empty")}</ComboboxEmpty>
                <ComboboxList>
                  {(option) => (
                    <ComboboxItem key={option.value} value={option}>
                      {option.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Field>
        </FieldGroup>
      </PopoverContent>
    </Popover>
  );
};
