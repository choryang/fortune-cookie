<template>
  <div class="frame">
    <div class="col">
      <NuxtLink to="/" class="back-btn">← 돌아가기</NuxtLink>

      <div class="add-header fade">
        <h2 class="add-title">나만의 운세 추가</h2>
        <p class="subtitle">누군가의 하루에 들어갈 한 문장을 남겨주세요</p>
      </div>

      <div class="panel fade-late">
        <textarea
          v-model="text"
          :maxlength="MAX"
          rows="3"
          placeholder="예) 오늘은 우산을 챙기면 좋은 일이 생겨요."
        />
        <div class="counter">{{ text.length }} / {{ MAX }}</div>
        <button class="primary-btn" :disabled="loading" @click="submit">
          {{ loading ? "추가 중…" : done ? "✓ 추가 완료!" : "＋ 쿠키 항아리에 넣기" }}
        </button>
        <p class="notice">추가한 문구는 <b>이 쿠키를 뽑는 모든 사람</b>에게 보여요.</p>
      </div>

      <div class="jar-note" v-if="count !== null">지금까지 모인 운세 <b>{{ count }}</b>개</div>
    </div>

    <Transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const MAX = 80;
const text = ref("");
const loading = ref(false);
const done = ref(false);
const toast = ref("");

const { data, refresh } = await useFetch<{ count: number }>("/api/fortunes");
const count = computed(() => data.value?.count ?? null);

let toastTimer: ReturnType<typeof setTimeout> | undefined;
function showToast(msg: string) {
  toast.value = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.value = ""), 2400);
}

async function submit() {
  if (!text.value.trim()) {
    showToast("문구를 입력해 주세요.");
    return;
  }
  loading.value = true;
  try {
    await $fetch("/api/fortunes", { method: "POST", body: { text: text.value.trim() } });
    text.value = "";
    done.value = true;
    showToast("쿠키 항아리에 추가됐어요! 🥠");
    await refresh();
    setTimeout(() => (done.value = false), 2000);
  } catch (e: any) {
    const msg =
      e?.data?.statusMessage ||
      e?.data?.message ||
      e?.statusMessage ||
      "추가에 실패했어요. 잠시 후 다시 시도해 주세요.";
    showToast(msg);
  } finally {
    loading.value = false;
  }
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
}
.col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.back-btn {
  align-self: flex-start;
  color: rgba(243, 238, 222, 0.7);
  font-size: 14px;
  text-decoration: none;
  padding: 4px;
  margin-bottom: 10px;
}
.add-header {
  text-align: center;
  margin-bottom: 12px;
}
.add-title {
  font-family: "Black Han Sans", sans-serif;
  font-size: 30px;
  margin: 0;
  color: var(--gold);
}
.subtitle {
  font-size: 14px;
  color: rgba(243, 238, 222, 0.6);
  margin-top: 10px;
}
.panel {
  width: 100%;
  max-width: 360px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
textarea {
  width: 100%;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.25);
  color: var(--cream);
  border: 1px solid rgba(255, 213, 107, 0.25);
  border-radius: 10px;
  padding: 14px;
  font-family: inherit;
  font-size: 16px;
  resize: none;
  outline: none;
  line-height: 1.5;
}
textarea::placeholder {
  color: rgba(243, 238, 222, 0.35);
}
.counter {
  align-self: flex-end;
  font-size: 12px;
  color: rgba(243, 238, 222, 0.45);
}
.primary-btn {
  width: 100%;
  justify-content: center;
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
.primary-btn:disabled {
  opacity: 0.7;
  cursor: default;
}
.notice {
  font-size: 12.5px;
  color: rgba(243, 238, 222, 0.6);
  line-height: 1.6;
  margin: 6px 2px 0;
  text-align: center;
}
.notice b {
  color: var(--gold-soft);
}
.jar-note {
  font-size: 13px;
  color: rgba(243, 238, 222, 0.55);
  margin-top: 8px;
}
.jar-note b {
  color: var(--gold);
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
  animation: fade 0.7s ease 0.3s both;
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
</style>
