<template>
  <div>
    <CashflowForecast></CashflowForecast>
    <Cashflow></Cashflow>
    <transactions></transactions>
    <ForecastPerformance></ForecastPerformance>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import CashflowForecast from './components/CashflowForecast.vue';
import Cashflow from './components/Cashflow.vue';
import transactions from './components/transactions.vue';
import ForecastPerformance from './components/Performance.vue';
</script>

<style scoped>
.chart {
  height: 100vh;
}
</style>
