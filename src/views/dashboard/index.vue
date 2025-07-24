<template>
  <div>
    <StatisticalBrief></StatisticalBrief>
    <CashflowForecast :showArrow="true"></CashflowForecast>
    <!-- <Cashflow></Cashflow> -->
    <div class="flex gap-5 mt-5">
      <transactions></transactions>
      <forecast></forecast>
    </div>
    <Income :showArrow="true"></Income>
    <RegionalDistribution></RegionalDistribution>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import StatisticalBrief from './components/StatisticalBrief.vue';
import CashflowForecast from './components/CashflowForecast/index.vue';
import Cashflow from './components/Cashflow.vue';
import transactions from './components/transactions.vue';
import forecast from './components/forecast.vue';
import Income from './components/Income.vue';
import RegionalDistribution from './components/RegionalDistribution.vue';
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
    bottom: 1px;
    position: relative;
  }
}
</style>
