<template>
  <div class="app-root">
    <Stars />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// 별 배경은 모든 페이지 공통이라 여기 둡니다.
</script>

<style scoped>
.app-root {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}
</style>
