<template>
  <div class="import-page">
    <div class="category-tabs">
      <button v-for="tab in categoryTabs" :key="tab.value" type="button" :class="['category-tab', { active: tab.value === activeCategory }]" @click="activeCategory = tab.value">
        {{ tab.label }}
      </button>
    </div>
    <template v-if="activeCategory === 'vco'">
      <div class="importBox">
        <import-export :title="t('用户')" :params="{ type: 'user' }" exportUrl="/temp/user.xls"></import-export>
        <import-export :title="t('利益相关者')" :params="{ type: 'org' }" exportUrl="/temp/organisation.xls"></import-export>
        <import-export :title="t('orgCate')" :params="{ type: 'orgCate' }" exportUrl="/temp/orgCate.xls"></import-export>
      </div>
      <div class="importBox project">
        <import-export :title="t('项目')" :params="{ type: 'project' }" exportUrl="/temp/project.xls"></import-export>
        <import-export :title="t('减少')" :params="{ type: 'credit' }" exportUrl="/temp/credit.xls"></import-export>
        <import-export :title="t('LinefeeSchedule')" :params="{ type: 'linefeeSchedule' }" exportUrl="/temp/linefeeSchedule.xls"></import-export>
        <import-export :title="t('ForecastList')" :params="{ type: 'forecast' }" exportUrl="/temp/forecast.xls"></import-export>
        <import-export :title="t('Schedule')" :params="{ type: 'linefee' }" exportUrl="/temp/linefee.xls"></import-export>
        <import-export :title="t('DrawdownApply')" :params="{ type: 'drawdown' }" exportUrl="/temp/drawdown.xls"></import-export>
        <import-export :title="t('Close')" :params="{ type: 'close' }" exportUrl="/temp/close.xls"></import-export>
        <import-export :title="t('projectDo')" :params="{ type: 'projectDo' }" exportUrl="/temp/projectDo.xls"></import-export>
        <import-export :title="t('cover')" :params="{ type: 'cover' }" exportUrl="/temp/cover.xls"></import-export>
        <import-export :title="t('文件')" :params="{ type: 'document' }" exportUrl="/temp/document.xls"></import-export>
        <import-export :title="t('condition')" :params="{ type: 'condition' }" exportUrl="/temp/condition.xls"></import-export>
        <import-export :title="t('projectHistory')" :params="{ type: 'projectHistory' }" exportUrl="/temp/projectHistory.xls"></import-export>
        <import-export :title="t('Aml')" :params="{ type: 'aml' }" exportUrl="/temp/aml.xls"></import-export>
        <import-export :title="t('statement')" :params="{ type: 'statement' }" exportUrl="/temp/statement.xls"></import-export>
        <import-export :title="t('drawdownDo')" :params="{ type: 'drawdownDo' }" exportUrl="/temp/drawdownDo.xls"></import-export>
      </div>
    </template>
    <template v-else-if="activeCategory === 'vsl'">
      <div class="importBox">
        <import-export :title="t('项目')" :params="{ type: 'project' }" exportUrl="/temp/project.xls" import-path="/transfer/importVsl" save-path="/transfer/saveVsl"></import-export>
        <import-export :title="t('Schedule')" :params="{ type: 'schedule' }" exportUrl="/temp/linefee.xls" import-path="/transfer/importVsl" save-path="/saveVsl/"></import-export>
      </div>
    </template>
    <template v-else>
      <div class="importBox placeholder">
        <a-empty :description="t('暂无数据')"></a-empty>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ImportExport from './ImportExport.vue';

const { t } = useI18n();
const categoryTabs = [
  { label: 'VCO', value: 'vco' },
  { label: 'VSL', value: 'vsl' }
];
const activeCategory = ref(categoryTabs[0].value);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.import-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.category-tabs {
  display: inline-flex;
  padding: 4px;
  background-color: #f0f2f5;
  border-radius: 999px;
  gap: 4px;
}
.category-tab {
  border: none;
  background-color: transparent;
  color: #666;
  padding: 6px 18px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}
.category-tab.active {
  background-color: @colorPrimary;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}
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
.placeholder {
  align-items: center;
  justify-content: center;
}
</style>
