<template>
  <a-button block class="big countdown-btn" type="dark">
    {{ countdown }}
  </a-button>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

const countdown = ref(59);
let intervalId = null;

const emit = defineEmits(['update:show']);
const startCountdown = () => {
  intervalId = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      stopCountdown();
    }
  }, 1000);
};

const stopCountdown = () => {
  clearInterval(intervalId);
  intervalId = null;
  emit('update:show', false);
};

onMounted(() => {
  startCountdown();
});

onBeforeUnmount(() => {
  stopCountdown();
});

watch(countdown, (val) => {
  if (val === 0) {
    stopCountdown();
  }
});
</script>

<style scoped lang="less">
.countdown-btn {
  cursor: not-allowed;
  border-color: #d9d9d9;
  box-shadow: none;

  &:hover {
    background-color: #272727;
    color: #fff;
  }
}
</style>
