<template>
  <div class="block-item">
    <vco-process-title :title="t('基础信息')"></vco-process-title>
    <div>
      <a-row :gutter="24">
        <a-col :span="9">
          <div class="info-content">
            <p class="name">{{ t('项目名称') }}</p>
            <p class="txt">Changjiang test one</p>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="info-content">
            <p class="name">{{ t('借款金额') }}</p>
            <p class="txt">
              <vco-number :value="5000000" :precision="2" :end="true"></vco-number>
            </p>
          </div>
        </a-col>
        <a-col :span="4">
          <div class="info-content">
            <p class="name">{{ t('项目借款周期') }}</p>
            <p class="txt">{{ tool.showDate(startDate) + ' - ' + tool.showDate(endDate) }}</p>
          </div>
        </a-col>
        <a-col :span="3">
          <div class="info-content">
            <p class="name">{{ t('借款周期') }}</p>
            <p class="txt">{{ showTerm }}</p>
          </div>
        </a-col>
        <a-col :span="2">
          <div class="info-content">
            <p class="name">{{ t('总天数') }}</p>
            <p class="txt">{{ showTotalDay }}</p>
          </div>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import tool from '@/utils/tool'

  const { t } = useI18n();

  const startDate = ref('2024-02-10')
  const endDate = ref('2026-02-10')

  const showTerm = computed(() => {
    const data = tool.calculateDurationPrecise(startDate.value, endDate.value);
    if (data.months && data.days) {
      return `${data.months} ${t('月')} ${data.days} ${t('天')}`;
    }

    if (data.months && !data.days) {
      return `${data.months} ${t('月')}`;
    }

    if (!data.months && data.days) {
      return `${data.days} ${t('天')}`;
    }

    return '--';
  });

  const showTotalDay = computed(() => {
    const data = tool.calculateDurationPrecise(startDate.value, endDate.value);
    return data.gapDay || 0;
  });
</script>

<style lang="less" scoped>
.info-content {
  margin-top: 15px;
  .name {
    font-size: 12px;
    color: #666;
  }
  .txt {
    font-size: 14px;
    font-weight: 500;
    margin-top: 5px;
    :deep(.ant-statistic-content) {
      font-size: 14px !important;
    }
  }
}
</style>
