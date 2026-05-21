import { PhLaunchDetailView } from "@/components/launch/PhLaunchDetailView";
import { getCachedPhLaunchDetail } from "@/lib/cached-ph-launch-detail";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import "../../../launch-detail.css";

export const revalidate = 300;

interface LaunchPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: LaunchPageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getCachedPhLaunchDetail(slug);
  if (!detail) {
    return { title: "Launch not found · GitHub Trending+" };
  }

  const description =
    detail.signal.tagline?.trim() ||
    detail.signal.description?.trim() ||
    undefined;

  const robots =
    detail.linkage === "indexed"
      ? undefined
      : { index: false as const, follow: true as const };

  return {
    title: `${detail.productName} · GitHub Trending+`,
    description,
    robots,
  };
}

export default async function LaunchDetailPage({ params }: LaunchPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const detail = await getCachedPhLaunchDetail(slug);
  if (!detail) notFound();

  return <PhLaunchDetailView detail={detail} />;
}
