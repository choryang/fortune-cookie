/**
 * 보안 헤더 미들웨어
 * 모든 응답에 보안 관련 HTTP 헤더를 추가합니다.
 */
export default defineEventHandler((event) => {
  const headers = event.node.res;

  // XSS 보호 (구형 브라우저용)
  headers.setHeader("X-XSS-Protection", "1; mode=block");

  // Content-Type 스니핑 방지
  headers.setHeader("X-Content-Type-Options", "nosniff");

  // 클릭재킹 방지
  headers.setHeader("X-Frame-Options", "DENY");

  // Referrer 정보 최소화
  headers.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // CSP: 인라인 스크립트/스타일 허용하되, 외부 스크립트는 카카오 SDK만
  headers.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://t1.kakaocdn.net https://developers.kakao.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://kapi.kakao.com",
      "frame-ancestors 'none'",
    ].join("; ")
  );

  // HTTPS 강제 (Vercel 배포 시)
  headers.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  // 서버 정보 숨기기
  headers.removeHeader("X-Powered-By");
});
