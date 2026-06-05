export default defineEventHandler(async () => {
  const sql = await ensureSchema();
  const fortunes = (await sql`select id, text from fortunes order by id`) as {
    id: number;
    text: string;
  }[];

  // 출력 시에도 살균 (DB에 이미 저장된 악성 데이터 방어)
  const safeFortunes = fortunes.map((f) => ({
    id: f.id,
    text: sanitizeText(f.text),
  }));

  return { fortunes: safeFortunes };
});
