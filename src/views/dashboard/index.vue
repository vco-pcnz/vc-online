<template>
  <div>
    <StatisticalBrief></StatisticalBrief>
    <CashflowForecast></CashflowForecast>
    <!-- <Cashflow></Cashflow> -->
    <div class="flex gap-5 mt-5">
      <transactions></transactions>
      <forecast></forecast>
    </div>
    <ForecastPerformance></ForecastPerformance>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import StatisticalBrief from './components/StatisticalBrief.vue';
import CashflowForecast from './components/CashflowForecast/index.vue';
import Cashflow from './components/Cashflow.vue';
import transactions from './components/transactions.vue';
import forecast from './components/forecast.vue';
import ForecastPerformance from './components/Performance.vue';
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
  .picker-btn {
    font-size: 12px;
    .DropdownIcon {
      font-size: 10px;
      position: relative;
      top: -2px;
      transition: -webkit-transform 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
      transition: transform 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
      transition: transform 0.2s cubic-bezier(0.645, 0.045, 0.355, 1), -webkit-transform 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    }
    &.open {
      .DropdownIcon {
        transform: rotate(180deg);
      }
    }
  }
}
</style>
