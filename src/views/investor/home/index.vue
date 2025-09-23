<template>
  <vco-page-panel v-if="showBack" :isBack="true" :title="t('数据统计')"> </vco-page-panel>
  <Satistics :invest_id="invest_id"></Satistics>
  <div class="my-12">
    <AmountLog :invest_id="invest_id"></AmountLog>
  </div>
  <div class="my-12">
    <ProjectDashboard :invest_id="invest_id"></ProjectDashboard>
  </div>
  <CashflowForecast :invest_id="invest_id" :isNav="false"></CashflowForecast>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { hasPermission } from '@/directives/permission/index';
import Satistics from './components/Satistics/index.vue';
import AmountLog from './components/AmountLog/index.vue';
import ProjectDashboard from './components/ProjectDashboard/index.vue';
import CashflowForecast from './components/CashflowForecast/index.vue';
import { userProject } from '@/api/invest';
import { useRoute } from 'vue-router';
const { t } = useI18n();

const invest_id = ref('');
const route = useRoute();
const showBack = ref(false);

onMounted(() => {
  if (route.query.uuid) {
    invest_id.value = route.query.uuid;
    showBack.value = true;
  } else {
    userProject().then((res) => {
      if (res && res.length) {
        invest_id.value = res[0].id;
      }
    });
  }
});
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
