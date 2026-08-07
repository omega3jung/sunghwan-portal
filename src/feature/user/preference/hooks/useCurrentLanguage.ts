import { usePreferenceStore } from "@/lib/client/preference";

export const useCurrentLanguage = () => {
  return usePreferenceStore((s) => s.language);
};
