<template>
  <div class="frame">
    <!-- 홈: 쿠키 고르기 -->
    <div v-if="mode === 'home'" class="center">
      <div class="header fade">
        <div class="kicker">오늘의</div>
        <h1 class="title">포춘쿠키</h1>
        <p class="subtitle">마음이 끌리는 쿠키를 하나 골라보세요</p>
      </div>

      <div class="grid">
        <button
          v-for="i in 4"
          :key="i"
          class="cookie-btn"
          :style="{
            animationDelay: (i - 1) * 0.12 + 's',
            opacity: picking !== null && picking !== i - 1 ? 0.18 : 1,
            transform: picking === i - 1 ? 'scale(1.18)' : 'scale(1)',
            pointerEvents: picking !== null ? 'none' : 'auto',
          }"
          @click="pick(i - 1)"
        >
          <Cookie :idx="i - 1" :cracking="picking === i - 1" />
        </button>
      </div>

      <div class="home-footer fade-late">
        <NuxtLink to="/add" class="ghost-btn">＋ 문구 추가하기</NuxtLink>
        <div class="jar-note">
          현재 쿠키 항아리 속 운세 <b>{{ count ?? "…" }}</b
          >개
        </div>
      </div>
    </div>

    <!-- 공개: 운세 결과 -->
    <div v-else class="center">
      <div class="crack-row pop">
        <CookieHalf side="left" />
        <CookieHalf side="right" />
      </div>

      <div class="slip slip-anim">
        <div class="spark">✦</div>
        <p class="slip-text">“{{ current }}”</p>
        <div class="slip-edge" />
      </div>

      <div class="btn-row fade-late">
        <button class="primary-btn" @click="onShare">↗ 카톡 공유</button>
        <button class="secondary-btn" @click="reset">↺ 다시 뽑기</button>
      </div>

      <NuxtLink to="/add" class="ghost-btn fade-late" style="margin-top: 18px">＋ 문구 추가하기</NuxtLink>
    </div>

    <Transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
// 서버에서 개수만 받음 (전체 목록은 보안상 노출하지 않음)
const { data } = await useFetch<{ count: number }>("/api/fortunes");
const count = computed(() => data.value?.count ?? null);
const hasAny = computed(() => (count.value ?? 0) > 0);

const mode = ref<"home" | "reveal">("home");
const current = ref("");
const picking = ref<number | null>(null);
const toast = ref("");

const { shareFortune } = useKakao();

let toastTimer: ReturnType<typeof setTimeout> | undefined;
function showToast(msg: string) {
  toast.value = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.value = ""), 2400);
}

async function pick(i: number) {
  if (picking.value !== null || !hasAny.value) return;
  picking.value = i;

  // 서버에서 가중치 기반으로 운세 뽑기 (덜 나온 문구 우선)
  try {
    const result = await $fetch<{ fortune: { text: string } }>("/api/fortunes/pick");
    // 쿠키 깨지는 애니메이션 대기
    await new Promise((r) => setTimeout(r, 850));
    current.value = result.fortune.text;
  } catch {
    await new Promise((r) => setTimeout(r, 850));
    current.value = "운세를 불러오지 못했어요. 다시 시도해 주세요.";
  }
  mode.value = "reveal";
  picking.value = null;
}

function reset() {
  current.value = "";
  mode.value = "home";
}

async function onShare() {
  const result = await shareFortune(current.value);
  if (result === "copy") showToast("문구를 복사했어요! 카톡에 붙여넣기 하세요 📋");
  else if (result === "fail") showToast("공유에 실패했어요. 텍스트를 직접 복사해 주세요.");
}
</script>

<style scoped>
.frame {
  position: relative;
  z-index: 2;
  max-width: 440px;
  margin: 0 auto;
  padding: 40px 24px 48px;
  min-height: 100vh;
  display: flex;
}
.center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.header {
  text-align: center;
  margin-bottom: 36px;
}
.kicker {
  font-size: 15px;
  letter-spacing: 8px;
  color: var(--gold-dim);
  margin-bottom: 2px;
}
.title {
  font-family: "Black Han Sans", sans-serif;
  font-size: 52px;
  margin: 0;
  line-height: 1;
  color: var(--gold);
  text-shadow: 0 0 28px rgba(255, 213, 107, 0.35);
  letter-spacing: 1px;
}
.subtitle {
  font-size: 14px;
  color: rgba(243, 238, 222, 0.6);
  margin-top: 14px;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  width: 100%;
  max-width: 320px;
}
.cookie-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 22px 18px;
  cursor: pointer;
  transition: transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.3), opacity 0.4s;
  animation: fade 0.6s ease both;
}
.cookie-btn:hover {
  transform: translateY(-6px) scale(1.05) !important;
}
.cookie-btn:active {
  transform: scale(0.96) !important;
}
.home-footer {
  margin-top: 38px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.jar-note {
  font-size: 13px;
  color: rgba(243, 238, 222, 0.55);
}
.jar-note b {
  color: var(--gold);
}

.crack-row {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 26px;
}
.slip {
  position: relative;
  background: linear-gradient(180deg, #fdf6e1, var(--cream));
  color: var(--ink);
  border-radius: 6px;
  padding: 30px 26px 34px;
  width: 100%;
  max-width: 340px;
  text-align: center;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45), inset 0 0 0 1px rgba(120, 90, 40, 0.15);
}
.spark {
  color: var(--gold-dim);
  font-size: 18px;
  margin-bottom: 6px;
}
.slip-text {
  font-family: "Nanum Pen Script", cursive;
  font-size: 30px;
  line-height: 1.45;
  margin: 0;
  word-break: keep-all;
}
.slip-edge {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 12px;
  height: 1px;
  background: repeating-linear-gradient(90deg, rgba(120, 90, 40, 0.35) 0 6px, transparent 6px 12px);
}
.btn-row {
  display: flex;
  gap: 12px;
  margin-top: 28px;
  width: 100%;
  max-width: 340px;
  justify-content: center;
}
.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(180deg, var(--gold), var(--gold-soft));
  color: #3a2c08;
  border: none;
  border-radius: 12px;
  padding: 13px 22px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(255, 213, 107, 0.25);
}
.secondary-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: var(--gold);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 13px 20px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
}
.ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: transparent;
  color: rgba(243, 238, 222, 0.75);
  border: 1px dashed rgba(255, 213, 107, 0.35);
  border-radius: 11px;
  padding: 10px 18px;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
}

.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(20, 16, 42, 0.95);
  border: 1px solid var(--border);
  color: var(--cream);
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  z-index: 10;
  white-space: nowrap;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}

.fade {
  animation: fade 0.7s ease both;
}
.fade-late {
  animation: fade 0.7s ease 0.35s both;
}
@keyframes fade {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.pop {
  animation: pop 0.6s cubic-bezier(0.2, 0.9, 0.3, 1.4) both;
}
@keyframes pop {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.slip-anim {
  animation: slip 0.65s cubic-bezier(0.2, 0.8, 0.3, 1.2) 0.15s both;
}
@keyframes slip {
  from {
    opacity: 0;
    transform: translateY(26px) rotate(-2deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotate(0);
  }
}
</style>
