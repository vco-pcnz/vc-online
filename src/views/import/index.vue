<template>
  <div class="importBox">
    <import-export :title="t('用户')" :params="{ type: 'user' }" exportUrl="/temp/user.xls"></import-export>
    <import-export :title="t('利益相关者')" :params="{ type: 'org' }" exportUrl="/temp/organisation.xls"></import-export>
  </div>
  <div class="importBox project">
    <import-export :title="t('项目')" :params="{ type: 'project' }" exportUrl="/temp/project.xls"></import-export>
    <import-export :title="t('抵押物')" :params="{ type: 'securities' }" exportUrl="/temp/securities.xls"></import-export>
    <import-export :title="t('明细表')" :params="{ type: 'schedule' }" exportUrl="/temp/schedule.xls"></import-export>
    <import-export :title="t('预测')" :params="{ type: 'forecast' }" exportUrl="/temp/forecast.xls"></import-export>
    <import-export :title="t('放款')" :params="{ type: 'drawdown' }" exportUrl="/temp/drawdown.xls"></import-export>
    <import-export :title="t('文件')" :params="{ type: 'document' }" exportUrl="/temp/document.xls"></import-export>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import ImportExport from './ImportExport.vue';

const { t } = useI18n();
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.importBox {
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 20px;
  &.project {
    border-radius: 8px;
    background-color: #f8f8f8;
    border: 1px solid #dddddd;
  }
}
</style>
