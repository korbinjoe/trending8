const MAX_TWEET_LENGTH = 280;
const URL_DISPLAY_LENGTH = 23; // X counts all URLs as 23 chars

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + "…";
}

export function buildRepoCardTweet(
  owner: string,
  name: string,
  description: string,
  deltaStars: number,
): string {
  const suffix = ` | +${deltaStars} ⭐ via #Trending8`;
  const header = `🔥 ${owner}/${name}`;
  const budget = MAX_TWEET_LENGTH - URL_DISPLAY_LENGTH - 1 - header.length - suffix.length - 3;
  const desc = description ? ` — ${truncate(description, budget)}` : "";
  return `${header}${desc}${suffix}`;
}

const PERIOD_EN: Record<string, string> = {
  "filter.today": "today",
  "filter.week": "week",
  "filter.month": "month",
  "filter.halfYear": "6 months",
  "filter.year": "year",
};

export function buildRepoTweet(
  owner: string,
  name: string,
  description: string,
  deltaStars: number,
  periodKey: string,
): string {
  const period = PERIOD_EN[periodKey] ?? "today";
  const header = `🔥 ${owner}/${name}`;
  const footer = `⭐ +${deltaStars} stars this ${period}\n\nvia #Trending8`;
  const budget = MAX_TWEET_LENGTH - URL_DISPLAY_LENGTH - 1 - header.length - footer.length - 4;
  const desc = description ? ` — ${truncate(description, budget)}` : "";
  return `${header}${desc}\n\n${footer}`;
}

export function buildLaunchTweet(
  productName: string,
  tagline: string | undefined,
  votesCount: number,
): string {
  const header = `🚀 ${productName}`;
  const footer = `🏆 ${votesCount} upvotes on Product Hunt\n\nvia #Trending8`;
  const budget = MAX_TWEET_LENGTH - URL_DISPLAY_LENGTH - 1 - header.length - footer.length - 4;
  const desc = tagline ? ` — ${truncate(tagline, budget)}` : "";
  return `${header}${desc}\n\n${footer}`;
}

export function buildPhCardTweet(
  productName: string,
  tagline: string | undefined,
  votesCount: number,
): string {
  const suffix = ` | ${votesCount} upvotes via #Trending8`;
  const header = `🚀 ${productName}`;
  const budget = MAX_TWEET_LENGTH - URL_DISPLAY_LENGTH - 1 - header.length - suffix.length - 3;
  const desc = tagline ? ` — ${truncate(tagline, budget)}` : "";
  return `${header}${desc}${suffix}`;
}

const PERIOD_HEADER: Record<string, string> = {
  today: "Today's",
  week: "This Week's",
  month: "This Month's",
  halfYear: "Past 6 Months'",
  year: "This Year's",
};

const TOP8_FOOTER = "\n\nFull ranking → #Trending8";

function formatCompactDelta(n: number): string {
  if (n >= 10000) return `+${Math.round(n / 1000)}k`;
  if (n >= 1000) {
    const k = n / 1000;
    const rounded = k >= 10 ? Math.round(k) : Math.round(k * 10) / 10;
    return `+${String(rounded).replace(/\.0$/, "")}k`;
  }
  return `+${n}`;
}

function tweetTextBudget(extraFooter = TOP8_FOOTER): number {
  return MAX_TWEET_LENGTH - URL_DISPLAY_LENGTH - 1 - extraFooter.length;
}

export function buildTop8Tweet(
  items: { owner: string; name: string; description: string; deltaStars: number }[],
  period: string = "today",
): string {
  const label = PERIOD_HEADER[period] ?? "Today's";
  const top = items.slice(0, 8);
  const totalStars = top.reduce((sum, r) => sum + r.deltaStars, 0);
  const header = `🔥 ${label} Top 8 on GitHub (+${totalStars.toLocaleString()}⭐)\n\n`;
  const budget = tweetTextBudget();

  for (let count = Math.min(3, top.length); count >= 0; count--) {
    const bodyBudget = budget - header.length;
    if (count === 0) {
      return `${header.trimEnd()}${TOP8_FOOTER}`;
    }

    const lines = top.slice(0, count).map((r, i) =>
      `${i + 1}. ${r.owner}/${r.name} ${formatCompactDelta(r.deltaStars)}`,
    );
    if (top.length > count) {
      lines.push(`…+${top.length - count} more`);
    }
    const body = lines.join("\n");
    if (body.length <= bodyBudget) {
      return `${header}${body}${TOP8_FOOTER}`;
    }
  }

  return `🔥 ${label} Top 8 on GitHub (+${totalStars.toLocaleString()}⭐)${TOP8_FOOTER}`;
}

export function buildShareUrl(text: string, url: string): string {
  const params = new URLSearchParams({ text, url });
  return `https://x.com/intent/tweet?${params.toString()}`;
}
