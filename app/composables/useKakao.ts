declare global {
  interface Window {
    Kakao?: any;
  }
}

export type ShareResult = "kakao" | "share" | "copy" | "cancel" | "fail";

export function useKakao() {
  const config = useRuntimeConfig();

  function ensureInit(): boolean {
    if (typeof window === "undefined" || !window.Kakao) return false;
    const key = config.public.kakaoJsKey as string;
    if (!key) return false;
    if (!window.Kakao.isInitialized()) {
      try {
        window.Kakao.init(key);
      } catch {
        return false;
      }
    }
    return true;
  }

  async function shareFortune(text: string): Promise<ShareResult> {
    const url =
      (config.public.siteUrl as string) ||
      (typeof window !== "undefined" ? window.location.origin : "");

    // 1) 카카오 SDK 사용 가능하면 공유 카드로
    if (ensureInit() && window.Kakao?.Share) {
      try {
        window.Kakao.Share.sendDefault({
          objectType: "feed",
          content: {
            title: "🥠 오늘의 포춘쿠키",
            description: text,
            imageUrl: `${url}/og.png`,
            link: { mobileWebUrl: url, webUrl: url },
          },
          buttons: [
            {
              title: "나도 뽑아보기",
              link: { mobileWebUrl: url, webUrl: url },
            },
          ],
        });
        return "kakao";
      } catch {
        // 아래 폴백으로 진행
      }
    }

    // 2) 모바일 네이티브 공유 시트(카톡 포함)
    const msg = `🥠 오늘의 포춘쿠키\n\n"${text}"\n\n나도 뽑아보기 👉 ${url}`;
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title: "오늘의 포춘쿠키", text: msg });
        return "share";
      } catch (e: any) {
        if (e && e.name === "AbortError") return "cancel";
      }
    }

    // 3) 클립보드 복사
    try {
      await navigator.clipboard.writeText(msg);
      return "copy";
    } catch {
      return "fail";
    }
  }

  return { shareFortune };
}
