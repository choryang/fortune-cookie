# 🥠 오늘의 포춘쿠키

쿠키를 골라 운세를 뽑고, 카톡으로 공유하고, 누구나 새 문구를 추가할 수 있는 Nuxt 4 앱.

- **프론트**: Nuxt 4 (`app/` 디렉토리)
- **DB**: Neon (Postgres) — `@neondatabase/serverless` HTTP 드라이버
- **공유**: 카카오 JavaScript SDK (`Kakao.Share.sendDefault`) + OG 메타태그
- **배포**: Vercel

---

## 1. 로컬 실행

```bash
npm install
cp .env.example .env   # 값 채우기
npm run dev            # http://localhost:3000
```

`.env` 에 채울 값은 아래 2~3번 참고.

---

## 2. Neon (DB) 세팅

1. https://neon.tech 에서 프로젝트 생성
2. **Connection Details** 에서 연결 문자열 복사 (`-pooler` 가 붙은 걸 권장)
3. `.env` 의 `DATABASE_URL` 에 붙여넣기

테이블은 **앱이 첫 요청 때 자동으로 생성하고 기본 운세 12개를 시드**합니다.
(수동으로 만들고 싶으면 Neon SQL 에디터에서:)

```sql
create table if not exists fortunes (
  id serial primary key,
  text text not null,
  created_at timestamptz not null default now()
);
```

---

## 3. 카카오 공유 세팅

1. https://developers.kakao.com → **내 애플리케이션** 생성
2. **앱 키 > JavaScript 키** 를 `.env` 의 `NUXT_PUBLIC_KAKAO_JS_KEY` 에 입력
3. **앱 설정 > 플랫폼 > Web** 에 사이트 도메인 등록
   - 로컬: `http://localhost:3000`
   - 배포: `https://your-app.vercel.app`
4. **카카오톡 공유** 사용을 위해 도메인 등록만 하면 됩니다 (별도 동의항목 불필요)

> SDK 버전: `nuxt.config.ts` 의 `script` src 에 `2.7.4` 로 적어두었습니다.
> [카카오 Download 페이지](https://developers.kakao.com/docs/latest/ko/javascript/download)
> 에서 최신 버전 + `integrity` 값으로 교체하는 걸 권장합니다.

**키가 없거나 SDK 로드 실패 시**: 자동으로 모바일 네이티브 공유 시트(카톡 포함) →
클립보드 복사 순으로 폴백하므로 앱은 정상 동작합니다.

---

## 4. Vercel 배포

1. GitHub 에 푸시 → Vercel 에서 **New Project** 로 import (프레임워크 Nuxt 자동 감지)
2. **Environment Variables** 에 추가:
   | 키 | 값 |
   |---|---|
   | `DATABASE_URL` | Neon 연결 문자열 |
   | `NUXT_PUBLIC_KAKAO_JS_KEY` | 카카오 JavaScript 키 |
   | `NUXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` |
3. Deploy → 나온 도메인을 카카오 콘솔 Web 플랫폼에 등록 (3-3번)
4. `NUXT_PUBLIC_SITE_URL` 을 실제 도메인으로 맞춘 뒤 재배포 (OG/공유 링크 정확도)

---

## OG 이미지

`public/og.png` 에 기본 이미지가 들어있습니다(1200×630). 원하면 교체하세요.
카톡/SNS 미리보기는 캐시가 강해서, 바꾼 뒤
[카카오 디버거](https://developers.kakao.com/tool/debugger/sharing) 로 캐시를 갱신하면 됩니다.

---

## 구조

```
app/
  app.vue                 루트 (별 배경 + NuxtPage)
  pages/
    index.vue             쿠키 뽑기 + 운세 공개 + 공유
    add.vue               문구 추가
  components/
    Cookie.vue            원형 쿠키
    CookieHalf.vue        깨진 반쪽
    Stars.vue             밤하늘 배경
  composables/
    useKakao.ts           카카오 공유 + 폴백
server/
  api/
    fortunes.get.ts       전체 운세 조회
    fortunes.post.ts      운세 추가
  utils/
    fortunes.ts           Neon 연결 / 스키마 / 기본 운세
    ratelimit.ts          IP 해시 기반 fixed-window rate limit
public/
  og.png
```

---

## Rate limit (도배 방지)

`POST /api/fortunes` 에 **IP 해시 기준 fixed-window 제한**이 걸려 있습니다.

- 기본값: **분당 5회 + 시간당 20회** (`server/api/fortunes.post.ts` 에서 조정)
- Neon 의 `rate_limits` 테이블에 단일 UPSERT 로 카운트(서버리스 동시 요청에도 정확)
- 원본 IP 는 저장하지 않고 sha256 해시만 저장
- 한도 초과 시 `429` 응답 → 프론트에서 "요청이 너무 많아요" 토스트

> ⚠️ Vercel 서버리스에선 메모리(`Map`) 기반 제한은 인스턴스마다 카운트가
> 갈라져서 동작하지 않습니다. 그래서 공유 저장소(Neon)를 사용합니다.
> 트래픽이 커지면 Upstash Redis + `@upstash/ratelimit` 로 교체를 권장합니다.
> `node:crypto` 를 쓰므로 Vercel Node 런타임 기준입니다(엣지로 가면 Web Crypto 로 교체).

---

## 나중에 고려할 것

- **문구 검열**: 지금은 추가 즉시 모두에게 노출됩니다. 공개 운영 시 욕설 필터나
  "승인 후 노출" 컬럼(`approved boolean default false`) 추가를 권장.
- **랜덤 가중치**: 지금은 균등 랜덤. 인기 문구 가중치 등 확장 가능.
