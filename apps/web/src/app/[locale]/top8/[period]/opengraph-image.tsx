import { getCachedFeed } from "@/lib/cached-feed";
import { parseFeedPeriod } from "@/lib/feed-params";
import { ImageResponse } from "next/og";

export const revalidate = 300;
export const alt = "Top 8 trending repos on GitHub";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PERIOD_LABEL: Record<string, string> = {
  today: "Today's",
  week: "This Week's",
  month: "This Month's",
  halfYear: "Past 6 Months'",
  year: "This Year's",
};

export default async function OgImage({
  params,
}: {
  params: Promise<{ period: string }>;
}) {
  const { period: rawPeriod } = await params;
  const period = parseFeedPeriod(rawPeriod);
  const label = PERIOD_LABEL[period] ?? "Today's";

  const feed = await getCachedFeed({
    view: "velocity",
    period,
    includeNoise: true,
    phGithub: "all",
  });

  const top8 = feed.items.slice(0, 8);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "48px 64px",
          background: "linear-gradient(135deg, #0c0e12 0%, #151921 100%)",
          color: "#e8eaed",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "32px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span
              style={{
                fontSize: "16px",
                color: "#8b95a8",
                letterSpacing: "0.05em",
                textTransform: "uppercase" as const,
              }}
            >
              Trending8
            </span>
            <h1
              style={{
                fontSize: "36px",
                fontWeight: 700,
                margin: 0,
                color: "#e8eaed",
              }}
            >
              {label} Top 8 on GitHub
            </h1>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            flex: 1,
          }}
        >
          {top8.map((item, i) => (
            <div
              key={item.slug}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "8px 16px",
                borderRadius: "8px",
                background:
                  i === 0
                    ? "rgba(61, 214, 140, 0.1)"
                    : "rgba(255, 255, 255, 0.03)",
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: i < 3 ? "#3dd68c" : "#8b95a8",
                  minWidth: "28px",
                }}
              >
                {i + 1}
              </span>
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#e8eaed",
                  flex: "0 0 auto",
                  maxWidth: "340px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap" as const,
                }}
              >
                {item.owner}/{item.name}
              </span>
              <span
                style={{
                  fontSize: "16px",
                  color: "#6b7280",
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap" as const,
                }}
              >
                {item.description
                  ? item.description.length > 60
                    ? item.description.slice(0, 59) + "..."
                    : item.description
                  : ""}
              </span>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#3dd68c",
                  whiteSpace: "nowrap" as const,
                }}
              >
                +{item.deltaStars.toLocaleString()} ★
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
