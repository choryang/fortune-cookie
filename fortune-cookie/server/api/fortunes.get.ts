export default defineEventHandler(async () => {
  const sql = await ensureSchema();
  const fortunes = (await sql`select id, text from fortunes order by id`) as {
    id: number;
    text: string;
  }[];
  return { fortunes };
});
