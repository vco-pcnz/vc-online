<template>
  <ProjectDashboard></ProjectDashboard>
  <div class="flex my-12 gap-8">
    <div class="block-item flex-1">
      <Backlog></Backlog>
    </div>
    <div class="block-item" style="flex: 0 0 30%">
      <QuickAccess></QuickAccess>
    </div>
  </div>
  <CashflowForecast></CashflowForecast>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import tool from '@/utils/tool';
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
