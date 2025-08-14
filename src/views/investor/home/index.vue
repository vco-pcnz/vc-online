<template>
  <div class="my-12">
    <ProjectDashboard></ProjectDashboard>
  </div>
  <!-- <CashflowForecast :isNav="false"></CashflowForecast> -->
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { hasPermission } from '@/directives/permission/index';
import ProjectDashboard from './components/ProjectDashboard/index.vue';
import CashflowForecast from '@/views/dashboard/components/CashflowForecast/index.vue';
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
