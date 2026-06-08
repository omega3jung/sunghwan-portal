import { DEFAULT_COLOR } from "@/components/custom/ColorPicker";

export const DEFAULT_TENANT_COLOR = DEFAULT_COLOR;

export const TENANT_LOCALES = [
  {
    key: "en",
    labelKey: "serviceDeskSettings.tenant.field.english",
  },
  {
    key: "es",
    labelKey: "serviceDeskSettings.tenant.field.spanish",
  },
  {
    key: "fr",
    labelKey: "serviceDeskSettings.tenant.field.french",
  },
  {
    key: "ko",
    labelKey: "serviceDeskSettings.tenant.field.korean",
  },
] as const;
