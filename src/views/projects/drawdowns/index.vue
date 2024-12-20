<template>
  <detail-layout :title="baseInfo.name" active-tab="drawdowns">
    <template #content>
      <div class="ProjectDrawdowns">
        <div>
          <MeterStat></MeterStat>
        </div>
        <div>
          <div class="HelpBorrower">
            <div class="flex items-center"><i class="iconfont mr-2">&#xe75d;</i><span class="weight_demiBold">Help borrower</span></div>
            <p class="color_grey mt-1 mb-3">You can help to create drawdown on their behalf.</p>
            <a-button type="brown" shape="round" size="small">{{ t('默认开始') }}</a-button>
          </div>
        </div>
      </div>
    </template>
  </detail-layout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { size, template } from 'lodash';
import detailLayout from '../components/detailLayout.vue';
import MeterStat from './components/MeterStat.vue';

const { t } = useI18n();

const baseInfo = ref({
  id: 1614,
  name: 'test1212',
  purpose: ['Construction'],
  background: 'xxx'
});

onMounted(() => {});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.ProjectDrawdowns {
  display: grid;
  gap: 36px;
  grid-template-columns: 3fr 1fr;

  .HelpBorrower {
    margin-bottom: 48px;
    min-height: 160px;
    padding: 30px;
    background-color: #f0f0f0;
    border: 1px solid #e2e5e2;
    border-radius: 12px;
  }
}
</style>
