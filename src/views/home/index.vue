<template>
  <div class="flex" style="gap: 12px">
    <div class="block-item flex-1" style="flex: 0 0 690px" v-if="hasPermission('home:backlog')">
      <Backlog></Backlog>
    </div>
    <div class="block-item" style="flex: 0 0 250px">
      <QuickAccess></QuickAccess>
    </div>
    <div class="block-item flex-1">
      <Notice></Notice>
    </div>
  </div>
  <div class="my-12">
    <ProjectDashboard></ProjectDashboard>
  </div>
  <CashflowForecast v-if="hasPermission('home:cashflow_forecast')" :isNav="false"></CashflowForecast>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { hasPermission } from '@/directives/permission/index';
import ProjectDashboard from './components/ProjectDashboard/index.vue';
import Backlog from './components/Backlog/index.vue';
import Notice from './components/Notice/index.vue';
import QuickAccess from './components/QuickAccess/index.vue';
import CashflowForecast from '../dashboard/components/CashflowForecast/index.vue';
const { t } = useI18n();
</script>

<style lang="less" scoped>
.block-item {
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
  padding: 0px;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  border: 1px solid #fff;
}

:deep(.fs_2xl) {
  font-weight: 700;
}
</style>
