<template>
  <a-button block class="countdown-btn" disabled>
    {{ countdown }}
  </a-button>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";

const countdown = ref(59);
let intervalId = null;

const emit = defineEmits(["update:show"]);
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
  emit("update:show", false);
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
@import "@/styles/variables.less";
.countdown-btn {
  background-color: @clr_charcoal;
  color: @clr_white;
}
</style>
