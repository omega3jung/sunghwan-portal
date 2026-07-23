"use client";

import { datePickerLocales } from "@/components/custom/DatePicker/locales";
import { fileAttachmentLocales } from "@/components/custom/FileAttachment/locales";
import { preferencesMenuLocales } from "@/components/menu/PreferencesMenu/locales";
import { userMenuLocales } from "@/components/menu/UserMenu/locales";
import { ticketStatusLocales } from "@/feature/serviceDesk/shared";
import { SUPPORTED_LANGUAGES } from "@/lib/application/i18n";
import i18n from "@/lib/client/i18n/runtime";

SUPPORTED_LANGUAGES.forEach((language) => {
  i18n.addResourceBundle(
    language,
    "DatePicker",
    datePickerLocales[language],
    true,
    false,
  );
  i18n.addResourceBundle(
    language,
    "PreferencesMenu",
    preferencesMenuLocales[language],
    true,
    false,
  );
  i18n.addResourceBundle(
    language,
    "UserMenu",
    userMenuLocales[language],
    true,
    false,
  );
  i18n.addResourceBundle(
    language,
    "FileAttachment",
    fileAttachmentLocales[language],
    true,
    false,
  );
  i18n.addResourceBundle(
    language,
    "TicketStatusBadge",
    ticketStatusLocales[language],
    true,
    false,
  );
});

export default i18n;
