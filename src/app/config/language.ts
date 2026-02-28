import { Locale } from "@/shared/types/locale";

// NOTE:
// In real production, supported languages should be
// managed via application settings and stored in DB.
// For demo purposes, it is defined as a static constant.
export const SUPPORTED_LANGUAGES: Locale[] = ["en", "ko", "fr", "es"] as const;
