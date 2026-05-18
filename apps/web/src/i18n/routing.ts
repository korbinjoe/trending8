import { defineRouting } from "next-intl/routing";

export const locales = [
  "en",
  "zh",
  "es",
  "ja",
  "ko",
  "fr",
  "de",
  "pt",
  "ru",
  "ar",
  "hi",
] as const;

export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale: "en",
  localePrefix: "as-needed",
});
