export default defineEventHandler(async (event) => {
  // 도배 방지: 분당 5회 + 시간당 20회 (IP 해시 기준)
  await enforceRateLimit(event, { action: "add", limit: 5, windowSec: 60 });
  await enforceRateLimit(event, { action: "add", limit: 20, windowSec: 3600 });

  const body = await readBody<{ text?: string }>(event);
  const raw = (body?.text ?? "").toString().trim();

  // SQL 인젝션 + XSS 종합 검증 & 살균
  const validation = validateFortuneInput(raw);
  if (!validation.ok) {
    throw createError({ statusCode: 400, statusMessage: validation.reason });
  }

  const sql = await ensureSchema();
  const rows = (await sql`
    insert into fortunes (text) values (${validation.text})
    returning id, text
  `) as { id: number; text: string }[];

  return { ok: true, fortune: rows[0] };
});
