<template>
  <detailLayout @setDetail="setDetail" ref="detailLayoutRef" :title="t('利益相关者')">
    <orgs :userId="detail?.username || ''"></orgs>
  </detailLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import detailLayout from '../components/detailLayout.vue';
import orgs from './components/layout.vue';

const { t } = useI18n();
const detail = ref();

const setDetail = (val) => {
  detail.value = val;
};
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
.table-content {
  width: 100%;
  min-height: 200px;
  padding-top: 5px;
}

.orgsDetail-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  align-items: flex-start;
  .orgsDetail-left {
    background-color: #faf9f9;
    border-radius: 12px;
  }
  .orgsDetail-right {
    flex: 1;
    background-color: #faf9f9;
    border-radius: 12px;
    min-width: 0;
  }
}
</style>
