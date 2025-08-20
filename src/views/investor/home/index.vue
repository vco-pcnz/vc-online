<template>
  <Satistics></Satistics>
  <div class="my-12">
    <AmountLog></AmountLog>
  </div>
  <div class="my-12">
    <ProjectDashboard></ProjectDashboard>
  </div>
  <CashflowForecast :isNav="false"></CashflowForecast>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { hasPermission } from '@/directives/permission/index';
import Satistics from './components/Satistics/index.vue';
import AmountLog from './components/AmountLog/index1.vue';
import ProjectDashboard from './components/ProjectDashboard/index.vue';
import CashflowForecast from './components/CashflowForecast/index.vue';
const { t } = useI18n();
</script>

<style scoped lang="less">
:deep(.fs_2xl) {
  font-weight: 700;
}

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
