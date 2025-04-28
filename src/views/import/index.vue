<template>
  <div class="importBox">
    <import-export :title="t('用户')" :params="{ type: 'user' }" exportUrl="/temp/user.xls"></import-export>
    <import-export :title="t('利益相关者')" :params="{ type: 'org' }" exportUrl="/temp/organisation.xls"></import-export>
  </div>
  <div class="importBox project">
    <import-export :title="t('项目')" :params="{ type: 'project' }" exportUrl="/temp/project.xls"></import-export>
    <import-export :title="t('减少')" :params="{ type: 'credit' }" exportUrl="/temp/credit.xls"></import-export>
    <import-export :title="t('LinefeeSchedule')" :params="{ type: 'linefeeSchedule' }" exportUrl="/temp/linefeeSchedule.xls"></import-export>
    <import-export :title="t('ForecastList')" :params="{ type: 'forecast' }" exportUrl="/temp/forecast.xls"></import-export>
    <import-export :title="t('Schedule')" :params="{ type: 'linefee' }" exportUrl="/temp/linefee.xls"></import-export>
    <import-export :title="t('DrawdownApply')" :params="{ type: 'drawdown' }" exportUrl="/temp/drawdown.xls"></import-export>
    <import-export :title="t('抵押物')" :params="{ type: 'securities' }" exportUrl="/temp/securities.xls"></import-export>
    <import-export :title="t('Close')" :params="{ type: 'close' }" exportUrl="/temp/close.xls"></import-export>
    <import-export :title="t('projectDo')" :params="{ type: 'projectDo' }" exportUrl="/temp/projectDo.xls"></import-export>
    <import-export :title="t('cover')" :params="{ type: 'cover' }" exportUrl="/temp/cover.xls"></import-export>
    <import-export :title="t('文件')" :params="{ type: 'document' }" exportUrl="/temp/document.xls"></import-export>
    <import-export :title="t('condition')" :params="{ type: 'condition' }" exportUrl="/temp/condition.xls"></import-export>
    <import-export :title="t('projectHistory')" :params="{ type: 'projectHistory' }" exportUrl="/temp/projectHistory.xls"></import-export>
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
