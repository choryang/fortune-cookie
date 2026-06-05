/**
 * GET /api/fortunes/pick
 *
 * 가중치 기반 랜덤 운세 뽑기.
 * - pick_count가 낮을수록(= 덜 뽑힌 문구) 가중치가 높아서 잘 뽑힘
 * - pick_count가 높을수록(= 자주 나온 문구) 가중치가 낮아서 덜 뽑힘
 * - 가중치 공식: weight = 1 / (pick_count + 1)
 *   → 0번 뽑힌 문구: 가중치 1.0
 *   → 3번 뽑힌 문구: 가중치 0.25
 *   → 9번 뽑힌 문구: 가중치 0.1
 *
 * 뽑힌 문구의 pick_count를 +1 증가시킵니다.
 */
export default defineEventHandler(async () => {
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

  return { fortune: { id: picked.id, text: picked.text } };
});
