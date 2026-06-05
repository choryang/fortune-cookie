/**
 * GET /api/fortunes
 *
 * 운세 "개수"만 반환합니다.
 * 전체 문구 목록은 노출하지 않습니다 (보안).
 */
export default defineEventHandler(async () => {
  const sql = await ensureSchema();
  const rows = (await sql`select count(*)::int as count from fortunes`) as { count: number }[];
  return { count: rows[0]?.count ?? 0 };
});
