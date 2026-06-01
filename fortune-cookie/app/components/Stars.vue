<template>
  <div class="star-layer" aria-hidden="true">
    <span
      v-for="(s, i) in stars"
      :key="i"
      class="star"
      :style="{
        top: s.top + '%',
        left: s.left + '%',
        width: s.size + 'px',
        height: s.size + 'px',
        animationDelay: s.delay + 's',
        animationDuration: s.dur + 's',
      }"
    />
  </div>
</template>

<script setup lang="ts">
type Star = { top: number; left: number; size: number; delay: number; dur: number };

// SSR/CSR 결과가 갈라지지 않도록 클라이언트에서만 생성
const stars = ref<Star[]>([]);
onMounted(() => {
  stars.value = Array.from({ length: 46 }).map(() => ({
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 4,
    dur: Math.random() * 2.5 + 2.5,
  }));
});
</script>

<style scoped>
.star-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.star {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  opacity: 0.4;
  animation: twinkle 3s ease-in-out infinite;
}
@keyframes twinkle {
  0%,
  100% {
    opacity: 0.18;
  }
  50% {
    opacity: 0.9;
  }
}
</style>
