<template>
  <svg
    viewBox="0 0 60 110"
    width="48"
    height="88"
    :style="{ transform: side === 'right' ? 'scaleX(-1)' : 'none', margin: '0 2px' }"
  >
    <defs>
      <linearGradient :id="gid" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f9d089" />
        <stop offset="1" stop-color="#c47d2c" />
      </linearGradient>
    </defs>
    <path d="M52 10 A 44 44 0 0 0 52 98 Z" :fill="`url(#${gid})`" stroke="#a86824" stroke-width="1.5" />
  </svg>
</template>

<script setup lang="ts">
const props = defineProps<{ side: "left" | "right" }>();
const gid = computed(() => `half-${props.side}`);
</script>
