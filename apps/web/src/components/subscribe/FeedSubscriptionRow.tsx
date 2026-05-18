"use client";

interface FeedSubscriptionRowProps {
  title: string;
  description: string;
  url: string;
}

export function FeedSubscriptionRow({
  title,
  description,
  url,
}: FeedSubscriptionRowProps) {
  return (
    <div className="feed-item flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-4 border-b border-border">
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        <code className="text-xs bg-surface px-2 py-1 rounded font-mono truncate max-w-[240px]">
          {url}
        </code>
        <button
          type="button"
          className="text-xs text-accent border border-border px-2 py-1 rounded shrink-0"
          onClick={() => navigator.clipboard.writeText(url)}
        >
          Copy
        </button>
      </div>
    </div>
  );
}
