<template>
  <a-button block class="countdown-btn" disabled>
    {{ countdown }}
  </a-button>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { pub } from '@/api/system';
const props = defineProps({
  targetTimestamp: {
    type: Number
  }
});

const countdown = ref(29);
let intervalId = null;

const emit = defineEmits(['update:show','change']);
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
      pub().then((res) => {
        if (props.targetTimestamp > res.server_time) {
          countdown.value = props.targetTimestamp - res.server_time;
          emit('update:show', true);
          startCountdown();
        } else {
          emit('update:show', false);
          emit('change');
        }
      });
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
