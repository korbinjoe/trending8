import { FeedPeriodSchema } from "@github-trending/core/types";
import { redirect } from "next/navigation";

export default async function Top8Page({
  params,
}: {
  params: Promise<{ locale: string; period: string }>;
}) {
  const { locale, period } = await params;
  const parsed = FeedPeriodSchema.safeParse(period);
  const validPeriod = parsed.success ? parsed.data : "today";
  redirect(`/${locale}?period=${validPeriod}`);
}
