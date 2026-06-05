/**
 * GET /api/fortunes/pick
 *
 * 가중치 기반 랜덤 운세 뽑기 + Rate Limit.
 * - pick_count가 낮을수록(= 덜 뽑힌 문구) 가중치가 높아서 잘 뽑힘
 * - pick_count가 높을수록(= 자주 나온 문구) 가중치가 낮아서 덜 뽑힘
 * - 가중치 공식: weight = 1 / (pick_count + 1)
 *
 * Rate limit: 분당 30회 / 시간당 200회 (대량 스크래핑 방지)
 */
export default defineEventHandler(async (event) => {
  // 스크래핑 방지: pick을 반복 호출해서 전체 목록을 추론하는 것을 막음
  await enforceRateLimit(event, { action: "pick", limit: 30, windowSec: 60 });
  await enforceRateLimit(event, { action: "pick", limit: 200, windowSec: 3600 });

  const sql = await ensureSchema();

  const fortunes = (await sql`
    select id, text, pick_count from fortunes order by id
  `) as { id: number; text: string; pick_count: number }[];

  if (fortunes.length === 0) {
    throw createError({ statusCode: 404, statusMessage: "운세가 아직 없어요." });
  }

  // 가중치 계산: 1 / (pick_count + 1)
  const weighted = fortunes.map((f) => ({
    ...f,
    weight: 1 / (f.pick_count + 1),
  }));

  const totalWeight = weighted.reduce((sum, f) => sum + f.weight, 0);

  // 가중치 기반 랜덤 선택
  let random = Math.random() * totalWeight;
  let picked = weighted[0];
  for (const f of weighted) {
    random -= f.weight;
    if (random <= 0) {
      picked = f;
      break;
    }
  }

  // 뽑힌 문구의 pick_count 증가
  await sql`update fortunes set pick_count = pick_count + 1 where id = ${picked.id}`;

  // 텍스트 살균 후 반환 (id는 노출하지 않음)
  return { fortune: { text: sanitizeText(picked.text) } };
});
