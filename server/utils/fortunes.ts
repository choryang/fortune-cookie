import { neon } from "@neondatabase/serverless";

export const DEFAULT_FORTUNES = [
  "오늘 미루던 일을 시작하기 딱 좋은 날이에요.",
  "기다리던 연락이 곧 올 거예요.",
  "작은 지출이 큰 행운으로 돌아옵니다.",
  "오늘 마주친 사람과 좋은 인연이 시작돼요.",
  "고민하던 결정, 지금 내리면 후회 없어요.",
  "잠깐의 휴식이 당신을 더 멀리 데려다줘요.",
  "예상치 못한 곳에서 좋은 소식이 들려와요.",
  "당신의 노력을 누군가 알아보고 있어요.",
  "오늘은 평소보다 운이 한 뼘 더 좋은 날.",
  "망설였던 한마디, 오늘은 꺼내도 괜찮아요.",
  "지갑은 조심, 대신 마음은 활짝 여세요.",
  "오늘의 첫 끼니가 하루의 기분을 정합니다.",
];

// 같은 서버리스 인스턴스가 살아있는 동안 중복 체크를 건너뛰기 위한 플래그
let schemaReady = false;

export function useSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw createError({ statusCode: 500, statusMessage: "DATABASE_URL 이 설정되지 않았습니다." });
  }
  return neon(url);
}

/**
 * 테이블이 없으면 만들고, 비어있으면 기본 운세를 시드한 뒤 sql 인스턴스를 반환합니다.
 */
export async function ensureSchema() {
  const sql = useSql();
  if (schemaReady) return sql;

  await sql`
    create table if not exists fortunes (
      id serial primary key,
      text text not null,
      pick_count int not null default 0,
      created_at timestamptz not null default now()
    )
  `;

  // 기존 테이블에 pick_count 컬럼이 없으면 추가 (마이그레이션)
  await sql`
    alter table fortunes add column if not exists pick_count int not null default 0
  `;

  // rate limit 용 fixed-window 카운터 테이블
  await sql`
    create table if not exists rate_limits (
      bucket text primary key,
      count int not null default 0,
      expires_at timestamptz not null
    )
  `;
  // 콜드 스타트마다 만료된 버킷 정리 (테이블이 무한정 커지지 않게)
  await sql`delete from rate_limits where expires_at < now()`;

  const rows = (await sql`select count(*)::int as count from fortunes`) as { count: number }[];
  if (rows[0]?.count === 0) {
    for (const t of DEFAULT_FORTUNES) {
      await sql`insert into fortunes (text) values (${t})`;
    }
  }

  schemaReady = true;
  return sql;
}
