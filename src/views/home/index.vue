<template>
  <ProjectDashboard></ProjectDashboard>
  <div class="flex my-12 gap-8">
    <div class="block-item flex-1" style="flex: 0 0 70%" v-if="hasPermission('home:backlog')">
      <Backlog></Backlog>
    </div>
    <div class="block-item flex-1">
      <QuickAccess></QuickAccess>
    </div>
  </div>
  <CashflowForecast v-if="hasPermission('home:cashflow_forecast')"></CashflowForecast>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import tool from '@/utils/tool';
import { hasPermission } from '@/directives/permission/index';
import ProjectDashboard from './components/ProjectDashboard/index.vue';
import Backlog from './components/Backlog/index.vue';
import QuickAccess from './components/QuickAccess/index.vue';
import CashflowForecast from './components/CashflowForecast/index.vue';
const { t } = useI18n();
</script>

<style lang="less" scoped>
.block-item {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
  padding: 0px;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  border: 1px solid #fff;
}
</style>
