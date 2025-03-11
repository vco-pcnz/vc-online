<template>
  <div class="stats-content">
    <div class="box left">
      <div class="box-top text-center">
        <p class="bold">Projected Total Income</p>
        <vco-number :value="0" :bold="true" size="fs_3xl" :precision="2"></vco-number>
      </div>
      <a-divider />

      <a-row :gutter="16">
        <a-col :span="12">
          <p class="color_grey fs_xs">Interest</p>
          <vco-number :value="data?.interest" :bold="true" size="fs_xl" :precision="2"></vco-number>
          <p class="fs_xs color_grey">{{ data?.interestRate }}%</p>
        </a-col>
        <a-col :span="12" class="text-right">
          <p class="color_grey fs_xs">Establishment fee</p>
          <vco-number :value="data?.estabFee" :bold="true" size="fs_xl" :precision="2"></vco-number>
          <p class="fs_xs color_grey">{{ data?.estabFeeRate }}%</p>
        </a-col>
        <a-col :span="12" class="mt-20">
          <p class="color_grey fs_xs">Line fee</p>
          <vco-number :value="data?.lineFee" :bold="true" size="fs_xl" :precision="2"></vco-number>
          <p class="fs_xs color_grey">{{ data?.lineFeeRate }}%</p>
        </a-col>
        <a-col :span="12" class="text-right mt-20">
          <p class="color_grey fs_xs">Bonus</p>
          <vco-number :value="data?.bonus" :bold="true" size="fs_xl" :precision="2"></vco-number>
          <p class="fs_xs color_grey">{{ data?.bonusRate }}%</p>
        </a-col>
      </a-row>
    </div>
    <div class="box middle">
      <div class="box-top text-center">
        <p class="bold">Current income</p>
        <vco-number :value="data?.income" :bold="true" size="fs_3xl" :precision="2"></vco-number>
      </div>
      <a-divider />
      <a-row :gutter="16">
        <a-col :span="12">
          <p class="color_grey fs_xs">Interest</p>
          <vco-number :value="0" :bold="true" size="fs_xl" :precision="2"></vco-number>
        </a-col>
        <a-col :span="12" class="text-right">
          <p class="color_grey fs_xs">Establishment fee</p>
          <vco-number :value="0" :bold="true" size="fs_xl" :precision="2"></vco-number>
          <p class="fs_xs color_grey">to 28/02/2025</p>
        </a-col>
        <a-col :span="12" class="mt-20">
          <p class="color_grey fs_xs">Line fee</p>
          <vco-number :value="0" :bold="true" size="fs_xl" :precision="2"></vco-number>
        </a-col>
        <a-col :span="12" class="text-right mt-20">
          <p class="color_grey fs_xs">Bonus</p>
          <vco-number :value="data?.bonus" :bold="true" size="fs_xl" :precision="2"></vco-number>
        </a-col>
      </a-row>
    </div>
    <div class="box right">
      <p class="bold box-top text-center">Indicator</p>
      <a-divider />
      <a-row :gutter="16">
        <a-col :span="12">
          <div :class="{ 'color_red-error': Math.abs(data?.lvr) > Math.abs(data?.lvrMax) }">
            <p class="color_grey fs_xs">LVR</p>
            <span class="fs_xl bold">{{ data?.lvr }}%</span>
            <p class="fs_xs">{{ Math.abs(data?.lvr) > Math.abs(data?.lvrMax) ? 'over the ' : '' }}max {{ data?.lvrMax }}%</p>
          </div>
        </a-col>
        <a-col :span="12" class="text-right">
          <p class="color_grey fs_xs">Security value</p>
          <vco-number :value="data?.security" :bold="true" size="fs_xl" :precision="2"></vco-number>
          <a-button v-if="hasPermission('projects:detail:viewSecurity')" type="brown" shape="round" size="small" class="mt-1" @click="navigationTo(`/projects/discharge?uuid=${currentId}`)">
            security items <i class="iconfont fs_2xs ml-3">&#xe794;</i>
          </a-button>
        </a-col>
        <a-col :span="24">
          <p class="color_grey fs_xs">IRR</p>
          <p class="fs_xl bold">{{ data?.irr }}%</p>
          <p class="fs_xs">baseline 0.00%</p>
        </a-col>
        <a-col :span="12" class="my-2">
          <p class="color_grey fs_xs">LTC</p>
          <p class="fs_xl bold">{{ 0 }}</p>
          <p class="fs_xs">baseline 0.00</p>
        </a-col>
        <a-col :span="12" class="my-2 text-right">
          <p class="color_grey fs_xs">Total Development Cost</p>
          <vco-number :value="0" :bold="true" size="fs_xl" :precision="2"></vco-number>
        </a-col>
        <a-col :span="24">
          <p class="color_grey fs_xs">number of days lapsed/total term days</p>
          <p class="fs_xl bold">123/123</p>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { navigationTo } from '@/utils/tool';
import { hasPermission } from '@/directives/permission/index';

const { t } = useI18n();

const props = defineProps({
  currentId: {
    type: String,
    default: ''
  },
  data: {
    type: Object,
    default: () => {}
  }
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.stats-content {
  grid-gap: 12px;
  display: grid;
  gap: 12px;
  grid-template-columns: 3fr 3fr 3fr;

  .box {
    background-color: #f0f0f0;
    border: 1px solid #e2e5e2;
    padding: 30px 15px 20px;
    border-radius: 12px;
  }
}
.box-top {
  min-height: 60px;
}
.bonus2 {
  :deep(.ant-statistic-content),
  :deep(.ant-statistic) {
    font-size: 12px !important;
    line-height: 18px !important;
    font-weight: normal !important;
    color: #888 !important;
  }
}
</style>
