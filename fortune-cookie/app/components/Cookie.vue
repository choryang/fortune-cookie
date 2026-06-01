<template>
  <svg viewBox="0 0 120 120" width="100%" height="100%" style="display: block">
    <defs>
      <radialGradient :id="gid" cx="0.35" cy="0.3" r="0.85">
        <stop offset="0" stop-color="#f9d089" />
        <stop offset="0.55" stop-color="#e0a04a" />
        <stop offset="1" stop-color="#c47d2c" />
      </radialGradient>
    </defs>
    <circle
      cx="60"
      cy="60"
      r="46"
      :fill="`url(#${gid})`"
      stroke="#a86824"
      stroke-width="1.5"
      :class="{ shake: cracking }"
    />
  </svg>
</template>

<script setup lang="ts">
const props = defineProps<{ idx: number; cracking?: boolean }>();
const gid = computed(() => `ck${props.idx}`);
</script>

<style scoped>
.shake {
  transform-origin: center;
  animation: shake 0.85s ease;
}
@keyframes shake {
  0%,
  100% {
    transform: rotate(0);
  }
  20% {
    transform: rotate(-5deg);
  }
  40% {
    transform: rotate(5deg);
  }
  60% {
    transform: rotate(-3deg);
  }
  80% {
    transform: rotate(3deg);
  }
}
</style>
