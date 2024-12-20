<template>
  <div class="stats-content">
    <div class="box left">
      <div class="box-top">
        <p class="bold">IRR</p>
        <p class="fs_2xl bold">0%</p>
        <p>loan IRR 10%</p>
      </div>
      <a-divider />
      <div class="box-bottom">
        <p class="fs_xs color_grey">Interest & fees</p>
        <p class="fs_2xl bold">$1,658,268,367.53</p>
        <p class="fs_xs color_grey">forecasted</p>
      </div>
    </div>
    <div class="box middle">
      <div class="box-top">
        <p class="bold">Current income</p>
        <p class="fs_2xl bold">$515,062,584.24</p>
        <p class="fs_xs color_grey">current interest & fees</p>
      </div>
      <a-divider />
      <div class="box-bottom mb-7">
        <div>
          <p>Interest</p>
          <p class="fs_2xl bold">$1,100,000.00</p>
          <p class="fs_xs color_grey">10%</p>
        </div>
        <div>
          <p>Establishment fee</p>
          <p class="fs_2xl bold">$1,100,000.00</p>
          <p class="fs_xs color_grey">10%</p>
        </div>
      </div>
      <div class="box-bottom">
        <div>
          <p>Line fee</p>
          <p class="fs_2xl bold">$1,100,000.00</p>
          <p class="fs_xs color_grey">10%</p>
        </div>
        <div>
          <p>Bonus</p>
          <p class="fs_2xl bold">$1,100,000.00</p>
          <p class="fs_xs color_grey">10%</p>
        </div>
      </div>
    </div>
    <div class="box right">
      <div class="box-top color_red-error">
        <p class="bold">LVR</p>
        <p class="fs_2xl bold">256452%</p>
        <p class="fs_xs">over the max 10%</p>
      </div>
      <a-divider />
      <div class="box-bottom">
        <p>Security value</p>
        <p class="fs_2xl bold">$1,100,000.00</p>
        <p class="fs_xs color_brown-light">security items <i class="iconfont fs_2xs ml-3">&#xe794;</i></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps([]);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.stats-content {
  grid-gap: 12px;
  display: grid;
  gap: 12px;
  grid-template-columns: 2fr 4fr 2fr;

  .box {
    background-color: #f0f0f0;
    border: 1px solid #e2e5e2;
    padding: 30px;
    border-radius: 12px;
  }

  .middle {
    .box-bottom {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
  }
}
</style>
