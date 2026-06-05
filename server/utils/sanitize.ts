/**
 * 입력 텍스트 보안 유틸리티
 * - SQL 인젝션 패턴 탐지 및 차단
 * - XSS 방지를 위한 HTML 태그/스크립트 제거
 */

// SQL 인젝션 의심 패턴 (대소문자 무시)
const SQL_INJECTION_PATTERNS = [
  /(\b(union|select|insert|update|delete|drop|alter|create|exec|execute)\b\s+(all\s+)?)/i,
  /(\b(from|into|where|having|group\s+by|order\s+by)\b.*\b(select|union)\b)/i,
  /(';\s*--)/,                      // 문자열 종료 + 주석
  /(--\s|#\s|\/\*)/,                // SQL 주석
  /(\bor\b\s+\d+\s*=\s*\d+)/i,     // OR 1=1
  /(\band\b\s+\d+\s*=\s*\d+)/i,    // AND 1=1
  /(\bor\b\s+'[^']*'\s*=\s*')/i,   // OR 'a'='a'
  /(;\s*(drop|alter|create|truncate|delete)\b)/i, // 다중 쿼리
  /(\bsleep\s*\()/i,               // time-based injection
  /(\bbenchmark\s*\()/i,
  /(\bwaitfor\b\s+\bdelay\b)/i,
  /(\bload_file\s*\()/i,
  /(\binto\s+(out|dump)file\b)/i,
  /(0x[0-9a-f]{6,})/i,             // hex 인코딩 우회
  /(\bchar\s*\(\s*\d+)/i,          // CHAR() 우회
  /(\bconcat\s*\()/i,              // CONCAT() 우회
  /(\binformation_schema\b)/i,     // 스키마 탐색
  /(\bpg_catalog\b)/i,             // PostgreSQL 카탈로그
  /(\bpg_tables\b)/i,
];

// XSS 의심 패턴
const XSS_PATTERNS = [
  /<\s*script/i,
  /<\s*\/\s*script/i,
  /on\w+\s*=/i,                     // onclick=, onerror= 등
  /javascript\s*:/i,
  /vbscript\s*:/i,
  /data\s*:\s*text\/html/i,
  /<\s*iframe/i,
  /<\s*embed/i,
  /<\s*object/i,
  /<\s*form/i,
  /<\s*img[^>]+onerror/i,
  /<\s*svg[^>]+onload/i,
  /&#x?[0-9a-f]+;/i,               // HTML 엔티티 인코딩 우회
  /\\u00[0-9a-f]{2}/i,             // 유니코드 이스케이프 우회
];

/**
 * SQL 인젝션 패턴 탐지
 * @returns true면 위험한 입력
 */
export function detectSqlInjection(input: string): boolean {
  return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * XSS 패턴 탐지
 * @returns true면 위험한 입력
 */
export function detectXss(input: string): boolean {
  return XSS_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * HTML 태그 및 위험 문자 제거 (살균)
 * DB 저장 전에 반드시 적용
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")          // HTML 태그 제거
    .replace(/&(?:#x?[0-9a-f]+|[a-z]+);/gi, "") // HTML 엔티티 제거
    .replace(/[<>"'`;()\\]/g, "")     // 위험 특수문자 제거
    .trim();
}

/**
 * 운세 문구 입력 검증 (종합)
 * 통과하면 살균된 텍스트 반환, 실패하면 에러 메시지 반환
 */
export function validateFortuneInput(raw: string): { ok: true; text: string } | { ok: false; reason: string } {
  const text = (raw ?? "").toString().trim();

  if (!text) {
    return { ok: false, reason: "문구를 입력해 주세요." };
  }
  if (text.length > 80) {
    return { ok: false, reason: "문구는 80자 이내로 입력해 주세요." };
  }

  // SQL 인젝션 탐지
  if (detectSqlInjection(text)) {
    return { ok: false, reason: "허용되지 않는 문자열이 포함되어 있어요." };
  }

  // XSS 탐지
  if (detectXss(text)) {
    return { ok: false, reason: "허용되지 않는 문자열이 포함되어 있어요." };
  }

  // 한글, 영문, 숫자, 기본 문장부호만 허용
  const sanitized = sanitizeText(text);

  if (!sanitized) {
    return { ok: false, reason: "유효한 문구를 입력해 주세요." };
  }

  return { ok: true, text: sanitized };
}
