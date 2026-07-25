"use client";

import { Globe } from "lucide-react";
import { useEffect } from "react";
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
import { InputGroupAddon } from "@/components/ui/input-group";
import type { PortalPreference } from "@/domain/user/preference";
import {
  useCreateUserPreference,
  useLanguageState,
  useUpdateUserPreference,
  useUserPreferenceQuery,
} from "@/feature/user/preference/client";
import { preferenceKeys } from "@/feature/user/preference/preferenceKeys";
import { isLocale, NS } from "@/lib/application/i18n";
import { languageOptions } from "@/lib/client/i18n";
import { createDefaultPreference } from "@/lib/client/preference";

import { authSelectClassName } from "./styles";

const footerLinkClassName =
  "px-1.5 text-foreground/80 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40";

export function LoginFooter() {
  const { t } = useTranslation(NS.auth);
  const { data: userPreference } = useUserPreferenceQuery<PortalPreference>({
    isRemote: false,
    preferenceKey: preferenceKeys.home.preference,
  });
  const { mutate: createUserPreference } = useCreateUserPreference();
  const { mutate: updateUserPreference } = useUpdateUserPreference();
  const { language, changeLanguage } = useLanguageState();

  useEffect(() => {
    const preferredLanguage = userPreference?.preferenceMeta?.language;
    if (preferredLanguage && preferredLanguage !== language) {
      changeLanguage(preferredLanguage);
    }
  }, [changeLanguage, language, userPreference?.preferenceMeta]);

  const handleLanguageChange = (nextLanguage: string) => {
    if (!isLocale(nextLanguage)) {
      return;
    }

    changeLanguage(nextLanguage);

    const preferenceMeta = {
      ...(userPreference?.preferenceMeta ?? createDefaultPreference()),
      language: nextLanguage,
    };
    const data = {
      preferenceKey: preferenceKeys.home.preference,
      preferenceMeta,
    };

    if (userPreference) {
      updateUserPreference({ isRemote: false, data });
      return;
    }

    createUserPreference({ isRemote: false, data });
  };

  return (
    <footer className="grid grid-cols-2 border-t-2 border-border pt-6 text-center">
      <div>
        <nav aria-label={t("login.helpCenter")}>
          <Button variant="link" className={footerLinkClassName}>
            {t("login.helpCenter")}
          </Button>
          <span className="px-1" aria-hidden="true">
            &middot;
          </span>
          <Button variant="link" className={footerLinkClassName}>
            {t("login.privacyAndTerms")}
          </Button>
        </nav>
      </div>
      <div className="flex justify-end items-center">
        <Combobox
          items={languageOptions}
          itemToStringValue={(option) => option.label}
          value={
            languageOptions.find(
              (option) => option.value === (language ?? "en"),
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
            aria-label={t("common.language")}
            className={`w-48 ${authSelectClassName}`}
            placeholder={t("common.languagePlaceholder")}
          >
            <InputGroupAddon align="inline-start">
              <Globe />
            </InputGroupAddon>
          </ComboboxInput>
          <ComboboxContent>
            <ComboboxEmpty>No option found.</ComboboxEmpty>
            <ComboboxList>
              {(option) => (
                <ComboboxItem key={option.value} value={option}>
                  {option.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </footer>
  );
}
