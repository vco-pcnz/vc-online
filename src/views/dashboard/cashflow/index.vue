<template>
  <div>
    <CashflowForecast></CashflowForecast>
    <Cashflow></Cashflow>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import CashflowForecast from '../components/CashflowForecast/index.vue';
import Cashflow from '../components/Cashflow.vue';
</script>

<style scoped lang="less">
:deep(.title) {
  border-bottom: 1px solid #e2e5e2;
  padding-bottom: 12px;
  padding-top: 12px;
  line-height: 1.2;
  align-items: center;
  gap: 10px;

  .fs_2xl {
    font-weight: 700;
  }
  .iconfont {
    font-weight: 200;
    font-size: 12px;
    bottom: 3px;
    margin-right: 4px;
    position: relative;
  }
}
</style>
