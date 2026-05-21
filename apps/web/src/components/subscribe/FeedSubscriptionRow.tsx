"use client";

import { useCallback, useMemo, useState } from "react";

interface FeedSubscriptionRowProps {
  title: string;
  description: string;
  url: string;
}

function resolveFeedUrl(path: string): string {
  if (typeof window === "undefined") return path;
  try {
    return new URL(path, window.location.origin).href;
  } catch {
    return path;
  }
}

export function FeedSubscriptionRow({
  title,
  description,
  url,
}: FeedSubscriptionRowProps) {
  const [copied, setCopied] = useState(false);
  const feedUrl = useMemo(() => resolveFeedUrl(url), [url]);

  const handleCopy = useCallback(async () => {
    const absolute = resolveFeedUrl(url);
    try {
      await navigator.clipboard.writeText(absolute);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [url]);

  return (
    <div className="feed-item flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-4 border-b border-border">
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        <code className="text-xs bg-surface px-2 py-1 rounded font-mono truncate max-w-[240px]">
          {feedUrl}
        </code>
        <button
          type="button"
          className="text-xs text-accent border border-border px-2 py-1 rounded shrink-0"
          onClick={() => void handleCopy()}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
