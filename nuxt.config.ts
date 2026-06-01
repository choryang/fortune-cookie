const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  css: ["~/assets/css/main.css"],

  // DATABASE_URL 은 server/utils 에서 process.env 로 직접 읽습니다(서버 전용).
  runtimeConfig: {
    public: {
      // 카카오 디벨로퍼스 > 앱 > 앱 키 > JavaScript 키
      kakaoJsKey: process.env.NUXT_PUBLIC_KAKAO_JS_KEY || "",
      siteUrl,
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: "ko" },
      title: "오늘의 포춘쿠키 🥠",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "쿠키를 골라 오늘의 운세를 뽑아보세요." },
        // Open Graph (카톡에 링크만 붙여도 미리보기가 뜨도록)
        { property: "og:type", content: "website" },
        { property: "og:title", content: "오늘의 포춘쿠키 🥠" },
        { property: "og:description", content: "쿠키를 골라 오늘의 운세를 뽑아보세요." },
        { property: "og:image", content: `${siteUrl}/og.png` },
        { property: "og:url", content: siteUrl },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Nanum+Pen+Script&family=Gowun+Batang:wght@400;700&display=swap",
        },
      ],
      script: [
        // 카카오 JavaScript SDK — 버전/integrity 는 카카오 Download 페이지 최신값으로 교체 권장
        {
          src: "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js",
          crossorigin: "anonymous",
          defer: true,
        },
      ],
    },
  },

  // Vercel 은 nitro 가 환경을 자동 감지하므로 preset 지정이 필수는 아닙니다.
  // 명시하고 싶다면 아래 주석을 해제하세요.
  // nitro: { preset: "vercel" },
});
