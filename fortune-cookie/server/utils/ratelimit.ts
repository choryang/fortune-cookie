import { createHash } from "node:crypto";
import type { H3Event } from "h3";

/**
 * 클라이언트 식별자(해시된 IP). 원본 IP는 저장하지 않습니다.
 * Vercel 은 x-forwarded-for 헤더로 실제 IP를 전달합니다.
 */
function clientKey(event: H3Event): string {
  const ip =
    getRequestIP(event, { xForwardedFor: true }) ||
    getHeader(event, "x-real-ip") ||
    "unknown";
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

export type RateOptions = {
  action: string; // 버킷 네임스페이스 (예: "add")
  limit: number; // 윈도우당 허용 횟수
  windowSec: number; // 윈도우 길이(초)
};

/**
 * fixed-window 카운터. 단일 UPSERT 문으로 증가+조회를 한 번에 처리하므로
 * 서버리스 동시 요청 환경에서도 카운트가 정확합니다.
 * 한도를 넘으면 429 를 throw 합니다.
 */
export async function enforceRateLimit(event: H3Event, opts: RateOptions) {
  const sql = await ensureSchema(); // rate_limits 테이블 보장 + sql 인스턴스
  const id = clientKey(event);
  const windowId = Math.floor(Date.now() / 1000 / opts.windowSec);
  const bucket = `${opts.action}:${id}:${windowId}`;
  const expiresAt = new Date((windowId + 1) * opts.windowSec * 1000);

  const rows = (await sql`
    insert into rate_limits (bucket, count, expires_at)
    values (${bucket}, 1, ${expiresAt})
    on conflict (bucket)
    do update set count = rate_limits.count + 1
    returning count
  `) as { count: number }[];

  if (rows[0].count > opts.limit) {
    throw createError({
      statusCode: 429,
      statusMessage: "요청이 너무 많아요. 잠시 후 다시 시도해 주세요.",
    });
  }
}
