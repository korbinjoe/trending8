import { checkRateLimit, getClientIp } from "./rate-limit";

export function jsonResponse(data: unknown, init?: ResponseInit): Response {
  return Response.json(data, init);
}

export function errorResponse(
  message: string,
  status: number,
  extra?: Record<string, unknown>,
): Response {
  return jsonResponse({ error: message, ...extra }, { status });
}

export function withRateLimit(request: Request): Response | null {
  const ip = getClientIp(request);
  const { allowed, retryAfter } = checkRateLimit(ip);
  if (!allowed) {
    return errorResponse("Too many requests", 429, {
      retryAfter,
    });
  }
  return null;
}

export function validateCronSecret(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}
