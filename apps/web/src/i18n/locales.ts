import type { Locale } from "./routing";

export interface LocaleMeta {
  code: Locale;
  label: string;
  htmlLang: string;
  dir: "ltr" | "rtl";
}

export const localeCatalog: LocaleMeta[] = [
  { code: "en", label: "English", htmlLang: "en", dir: "ltr" },
  { code: "zh", label: "中文", htmlLang: "zh-CN", dir: "ltr" },
  { code: "es", label: "Español", htmlLang: "es", dir: "ltr" },
  { code: "ja", label: "日本語", htmlLang: "ja", dir: "ltr" },
  { code: "ko", label: "한국어", htmlLang: "ko", dir: "ltr" },
  { code: "fr", label: "Français", htmlLang: "fr", dir: "ltr" },
  { code: "de", label: "Deutsch", htmlLang: "de", dir: "ltr" },
  { code: "pt", label: "Português", htmlLang: "pt", dir: "ltr" },
  { code: "ru", label: "Русский", htmlLang: "ru", dir: "ltr" },
  { code: "ar", label: "العربية", htmlLang: "ar", dir: "rtl" },
  { code: "hi", label: "हिन्दी", htmlLang: "hi", dir: "ltr" },
];

export function getLocaleMeta(code: string): LocaleMeta {
  const found = localeCatalog.find((l) => l.code === code);
  return found ?? localeCatalog[0]!;
}
