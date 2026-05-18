import { errorResponse, jsonResponse, withRateLimit } from "@/lib/api-utils";
import { getCompare } from "@/lib/compare-service";

export async function GET(request: Request) {
  const limited = withRateLimit(request);
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const reposParam = searchParams.get("repos") ?? "";
  const repoSlugs = reposParam.split(",").filter(Boolean);
  const sort = searchParams.get("sort") === "velocity" ? "velocity" : "health";

  const result = await getCompare(repoSlugs, sort);

  if ("error" in result) {
    return errorResponse(result.error, result.status);
  }

  return jsonResponse(result);
}
