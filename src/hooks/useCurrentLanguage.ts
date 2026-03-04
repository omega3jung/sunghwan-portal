import { usePreferenceStore } from "@/lib/preferenceStore";

export const useCurrentLanguage = () => {
  return usePreferenceStore((s) => s.language);
};
