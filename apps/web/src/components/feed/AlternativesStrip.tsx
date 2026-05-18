import Link from "next/link";
import type { FeedItem } from "@github-trending/core/types";

interface AlternativesStripProps {
  alternatives: FeedItem["alternatives"];
  compareUrl?: string;
}

export function AlternativesStrip({
  alternatives,
  compareUrl,
}: AlternativesStripProps) {
  if (alternatives.length === 0) return null;

  return (
    <div className="alt-strip flex flex-wrap items-center gap-2 mt-2 text-xs text-muted">
      <span>Also:</span>
      {alternatives.map((alt) => (
        <Link
          key={alt.slug}
          href={`/repo/${alt.owner}/${alt.name}`}
          className="text-accent hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {alt.slug}
        </Link>
      ))}
      {compareUrl && (
        <Link
          href={compareUrl.replace(/^https?:\/\/[^/]+/, "")}
          className="text-accent-dim hover:underline ml-1"
          onClick={(e) => e.stopPropagation()}
        >
          Compare →
        </Link>
      )}
    </div>
  );
}


