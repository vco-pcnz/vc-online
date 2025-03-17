<template>
  <a-modal
    :open="visible"
    :title="t('预售数据')"
    :width="900"
    :footer="null"
    :keyboard="false"
    :maskClosable="false"
    @cancel="updateVisible(false)"
  >
    <a-row :gutter="24" class="pl-10 pr-10">
      <a-col :span="8" class="item-txt">
        <p>{{ t('抵押物价值') }}</p>
        <vco-number :value="detailData.amount" :precision="2"></vco-number>
      </a-col>
      <a-col :span="8" class="item-txt">
        <p>{{ t('销售价格') }}</p>
        <vco-number :value="detailData.sales_price" :precision="2"></vco-number>
      </a-col>
      <a-col :span="8" class="item-txt">
        <p>{{ t('预计收到的偿还 VC') }}</p>
        <div class="info">
          <vco-number :value="detailData.repayment_price" :precision="2"></vco-number>
          <span v-if="detailData.is_gst">({{ t('含消费税') }})</span>
        </div>
      </a-col>
      <a-col :span="8" class="item-txt">
        <p>{{ t('合同日期（或无条件日期）') }}</p>
        <p class="txt">{{ tool.showDate(detailData.contract_date) }}</p>
      </a-col>
      <a-col :span="8" class="item-txt">
        <p>{{ t('预计结算日期') }}</p>
        <p class="txt">{{ tool.showDate(detailData.settlement_date) }}</p>
      </a-col>
      <a-col :span="8" class="item-txt">
        <p>{{ t('日落日期') }}</p>
        <p class="txt">{{ tool.showDate(detailData.sunset_date) }}</p>
      </a-col>
      <a-col :span="8" class="item-txt">
        <p>{{ t('请求：还款日期') }}</p>
        <p class="txt">{{ tool.showDate(detailData.repayment_date) }}</p>
      </a-col>
      <a-col :span="8" class="item-txt">
        <p>{{ t('请求：净收益') }}</p>
        <vco-number :value="detailData.net_proceeds_price" :precision="2"></vco-number>
      </a-col>
      <a-col :span="8" class="item-txt">
        <p>{{ t('变化比例') }}</p>
        <p>{{ detailData.variance }}%</p>
      </a-col>
    </a-row>

    <div class="mt-10 mb-5">
      <div class="flex justify-end gap-5">
        <a-button
          type="grey" class="big shadow bold uppercase mb-5 mt-5"
          @click="updateVisible(false)"
        >{{ t('关闭') }}</a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
  import { ref, watch, computed } from "vue";
  import { useI18n } from 'vue-i18n';
  import tool, { selectDateFormat } from '@/utils/tool';

  const emits = defineEmits(['update:visible'])

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    detailData: {
      type: Object,
      default: () => {}
    }
  });

  const { t } = useI18n();

  /* 更新visible */
  const updateVisible = (value) => {
    emits('update:visible', value);
  };
</script>

<style lang="less" scoped>
.item-txt {
  margin-top: 25px;
  &.no {
    margin-top: 0;
  }
  &.total {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  > p {
    font-size: 13px;
    &:first-child {
      color: #999;
      margin-bottom: 5px;
    }
    &:last-child {
      font-size: 14px;
      word-break: break-all;
    }
  }
  > .info {
    font-size: 14px;
    display: flex;
    align-items: center;
    > span {
      font-size: 12px;
      margin-left: 10px;
      color: #666;
    }
  }
  :deep(.ant-statistic-content) {
    font-size: 16px !important;
  }
}
</style>