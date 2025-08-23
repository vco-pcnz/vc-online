<template>
  <a-button block class="countdown-btn" disabled>
    {{ countdown }}
  </a-button>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
const props = defineProps({
  targetTimestamp: {
    type: Number
  }
});

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
  if (!props.targetTimestamp) {
    startCountdown();
  }
});

onBeforeUnmount(() => {
  stopCountdown();
});

watch(countdown, (val) => {
  if (val === 0) {
    stopCountdown();
  }
});

watch(
  () => props.targetTimestamp,
  (val) => {
    if (val) {
      stopCountdown();
      if (props.targetTimestamp > Math.floor(Date.now() / 1000)) {
        countdown.value = props.targetTimestamp - Math.floor(Date.now() / 1000);
        emit('update:show', true);
        startCountdown();
      } else {
        emit('update:show', false);
      }
    }
  },
  { deep: true, immediate: true }
);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.countdown-btn {
  background-color: @clr_charcoal;
  color: @clr_white;
}
</style>
