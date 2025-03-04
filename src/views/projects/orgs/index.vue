<template>
  <detail-layout active-tab="journal">
    <template #content>
      <vco-page-tab :tabData="tabData" v-model:current="currentTab" class="mb-5"></vco-page-tab>
      <WashTable v-if="currentTab == 1"></WashTable>
      <RequestTable v-if="currentTab == 2"></RequestTable>
      <OrgsTable v-if="currentTab == 3"></OrgsTable>
    </template>
  </detail-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import WashTable from './components/WashTable.vue';
import RequestTable from './components/RequestTable.vue';
import OrgsTable from './components/OrgsTable.vue';
import { useRoute } from 'vue-router';
import { hasPermission } from '@/directives/permission/index';
import detailLayout from '../components/detailLayout.vue';

const route = useRoute();

const emits = defineEmits(['check', 'refresh']);

const { t } = useI18n();

const currentId = ref('');
const currentTab = ref('1');
const tabData = ref([
  {
    label: t('反洗钱'),
    value: '1',
    num: 0
  },
  {
    label: t('申请中'),
    value: '2',
    num: 0
  }
  // {
  //   label: t('利益相关者'),
  //   value: '3',
  //   num: 0
  // }
]);

onMounted(() => {
  currentId.value = route.query.uuid;
  const type = route.query.type
  if (type) {
    currentTab.value = type
  }
});
</script>

<style lang="less" scoped>
@import '@/views/process/temp/default/styles/common.less';
@import '@/styles/variables.less';
.ops {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  .iconfont {
    cursor: pointer;
    color: @colorPrimary!important;
  }
}
:deep(.ant-table-tbody) {
  & > tr td {
    color: #181818;
  }
}
.selectAll {
  position: absolute;
  left: 12px;
  top: 14px;
  cursor: pointer;
  z-index: 2;
  color: #181818;
  .iconfont {
    font-size: 5px;
    position: relative;
    top: -2px;
    left: 3px;
    display: inline-block;
  }
  .open {
    transform: rotate(180deg);
  }
}
.remark {
  padding: 10px;
  background: #f7f9f8;
  border-radius: 8px;
  margin-top: 10px;
  margin-bottom: 20px;
  font-size: 13px;
}
</style>
