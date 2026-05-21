import { errorResponse, jsonResponse, withRateLimit } from "@/lib/api-utils";
import { getCachedPhLaunchDetail } from "@/lib/cached-ph-launch-detail";

export const revalidate = 300;

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const limited = withRateLimit(request);
  if (limited) return limited;

  const { slug } = await context.params;
  if (!slug?.trim()) {
    return errorResponse("Slug required", 400);
  }

  try {
    const detail = await getCachedPhLaunchDetail(slug);
    if (!detail) {
      return errorResponse("Launch not found", 404);
    }
    return jsonResponse(detail, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    return errorResponse(
      err instanceof Error ? err.message : "Launch detail error",
      500,
    );
  }
}
