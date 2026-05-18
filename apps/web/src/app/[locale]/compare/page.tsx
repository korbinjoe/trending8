import { CompareClient } from "@/components/compare/CompareClient";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

export default async function ComparePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("compare");

  return (
    <section className="py-6">
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <CompareClient />
      </Suspense>
    </section>
  );
}
