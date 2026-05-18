export interface GraphQLError {
  message: string;
  type?: string;
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

export interface RateLimitInfo {
  remaining: number;
  resetAt: string;
  cost: number;
}

export class GitHubRateLimitError extends Error {
  constructor(
    message: string,
    public readonly resetAt: string,
  ) {
    super(message);
    this.name = "GitHubRateLimitError";
  }
}

export class GitHubGraphQLClient {
  private readonly token: string;

  constructor(token?: string) {
    const t = token ?? process.env.GITHUB_TOKEN;
    if (!t) {
      throw new Error("GITHUB_TOKEN is required");
    }
    this.token = t;
  }

  async query<T>(
    query: string,
    variables?: Record<string, unknown>,
  ): Promise<{ data: T; rateLimit: RateLimitInfo | null }> {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (res.status === 403 || res.status === 429) {
      const reset = res.headers.get("x-ratelimit-reset");
      const resetAt = reset
        ? new Date(Number(reset) * 1000).toISOString()
        : new Date(Date.now() + 3600_000).toISOString();
      throw new GitHubRateLimitError("GitHub API rate limit exceeded", resetAt);
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GitHub GraphQL HTTP ${res.status}: ${text}`);
    }

    const json = (await res.json()) as GraphQLResponse<T> & {
      data?: T & { rateLimit?: RateLimitInfo };
    };

    if (json.errors?.length) {
      const rateLimited = json.errors.some(
        (e) =>
          e.type === "RATE_LIMITED" ||
          e.message.toLowerCase().includes("rate limit"),
      );
      if (rateLimited) {
        throw new GitHubRateLimitError(
          json.errors[0]?.message ?? "Rate limited",
          new Date(Date.now() + 3600_000).toISOString(),
        );
      }
      throw new Error(json.errors.map((e) => e.message).join("; "));
    }

    if (!json.data) {
      throw new Error("GitHub GraphQL returned no data");
    }

    const rateLimit =
      (json.data as { rateLimit?: RateLimitInfo }).rateLimit ?? null;

    return { data: json.data, rateLimit };
  }
}
