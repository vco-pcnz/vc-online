<template>
  <div v-show="false">
    <detail-layout @getProjectDetail="getProjectDetail"> </detail-layout>
  </div>
  <vco-page-panel :title="pageTitleRef" :isBack="true">
    <div class="TabsPanel-Tab">
      <a-button v-for="item in panes" :key="item.key" @click="activeTab = item.key" :class="`tab-button ${item.key === activeTab ? 'active-tab' : ''}`">
        {{ item.title }}
      </a-button>
    </div>
  </vco-page-panel>
  <LoanPage v-if="activeTab === '1'" :currentId="projectDetail?.base?.uuid" :projectDetail="projectDetail"></LoanPage>
  <Forecast v-if="activeTab === '2'" :currentId="projectDetail?.base?.uuid" :projectDetail="projectDetail"></Forecast>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import DetailLayout from '../components/detailLayout.vue';
import LoanPage from './components/LoanPage.vue';
import Forecast from './components/Forecast.vue';

const { t } = useI18n();

const projectDetail = ref();
const getProjectDetail = (val) => {
  projectDetail.value = val;
};

const pageTitleRef = computed(() => {
  const sn = projectDetail.value?.base?.project_apply_sn || '';
  const type = t('导入完善');
  return `${sn} - ${type}`;
});

const activeTab = ref('1');
const panes = ref([
  {
    title: t('借款'),
    key: '1'
  },
  {
    title: t('预测'),
    key: '2'
  }
]);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.TabsPanel-Tab {
  list-style: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
}
.tab-button {
  color: @clr_charcoal;
  background-color: transparent;
  border: 1px solid @clr_charcoal;
  padding: 4px 20px;
  border-radius: 55px;
}

.active-tab {
  color: @clr_yellow;
  border: 1px solid @clr_yellow;
}
</style>
