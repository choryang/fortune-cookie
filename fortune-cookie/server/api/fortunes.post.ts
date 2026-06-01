export default defineEventHandler(async (event) => {
  // 도배 방지: 분당 5회 + 시간당 20회 (IP 해시 기준)
  await enforceRateLimit(event, { action: "add", limit: 5, windowSec: 60 });
  await enforceRateLimit(event, { action: "add", limit: 20, windowSec: 3600 });

  const body = await readBody<{ text?: string }>(event);
  const text = (body?.text ?? "").toString().trim();

  if (!text) {
    throw createError({ statusCode: 400, statusMessage: "문구를 입력해 주세요." });
  }
  if (text.length > 80) {
    throw createError({ statusCode: 400, statusMessage: "문구는 80자 이내로 입력해 주세요." });
  }

  const sql = await ensureSchema();
  const rows = (await sql`
    insert into fortunes (text) values (${text})
    returning id, text
  `) as { id: number; text: string }[];

  return { ok: true, fortune: rows[0] };
});
