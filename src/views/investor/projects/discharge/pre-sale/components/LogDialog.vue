<template>
  <a-modal
    :open="visible"
    :title="t('修改记录')"
    :width="1250"
    :footer="null"
    :keyboard="false"
    :maskClosable="false"
    @cancel="updateVisible(false)"
  >
    <a-row v-if="infoData?.amount" :gutter="24">
      <a-col :span="24">
        <a-alert
          type="info"
          class="mb-5 mt-5"
        >
          <template #message>
            <a-row :gutter="24">
              <a-col :span="6" class="item-txt">
                <p>{{ t('名称') }}</p>
                <p>{{ infoData.security_name }}</p>
              </a-col>
              <a-col :span="6" class="item-txt">
                <p>{{ t('产权编号') }}</p>
                <p>{{ infoData.card_no }}</p>
              </a-col>
              <a-col :span="6" class="item-txt">
                <p>{{ t('类型') }}</p>
                <p>{{ infoData.type_name }}</p>
              </a-col>
              <a-col :span="6" class="item-txt">
                <p>{{ t('抵押物价值') }}</p>
                <vco-number :value="infoData.amount" :precision="2"></vco-number>
              </a-col>
            </a-row>
          </template>
        </a-alert>
      </a-col>
    </a-row>
    <div class="table-content sys-table-content">
      <a-table
        ref="tableRef"
        rowKey="id"
        :columns="columns"
        :data-source="tableData"
        table-layout="fixed"
        :pagination="false"
        :scroll="{ x: '100%' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'amount'">
            <span>
              <vco-number v-if="record.amount" :value="record.amount" :precision="2"></vco-number>
              <p v-else>--</p>
            </span>
          </template>
          <template v-if="column.dataIndex === 'sales_price'">
            <span>
              <vco-number v-if="record.sales_price" :value="record.sales_price" :precision="2"></vco-number>
              <p v-else>--</p>
            </span>
          </template>
          <template v-if="column.dataIndex === 'is_gst'">
            <span>
              <span v-if="record.is_gst" class="rate-type plus">{{ t('含消费税') }}</span>
              <span v-else class="rate-type">{{ t('零税率') }}</span>
            </span>
          </template>
          <template v-if="column.dataIndex === 'repayment_price'">
            <span>
              <vco-number v-if="record.repayment_price" :value="record.repayment_price" :precision="2" color="#F19915"></vco-number>
              <p v-else>--</p>
            </span>
          </template>
          <template v-if="column.dataIndex === 'contract_date'">
            <span>
              <span v-if="record.contract_date">{{ tool.showDate(record.contract_date) }}</span>
              <p v-else>--</p>
            </span>
          </template>
          <template v-if="column.dataIndex === 'settlement_date'">
            <span>
              <span v-if="record.settlement_date">{{ tool.showDate(record.settlement_date) }}</span>
              <p v-else>--</p>
            </span>
          </template>
          <template v-if="column.dataIndex === 'sunset_date'">
            <span>
              <span v-if="record.sunset_date">{{ tool.showDate(record.sunset_date) }}</span>
              <p v-else>--</p>
            </span>
          </template>
          <template v-if="column.dataIndex === 'repayment_date'">
            <span>
              <span v-if="record.repayment_date">{{ tool.showDate(record.repayment_date) }}</span>
              <p v-else>--</p>
            </span>
          </template>
          <template v-if="column.dataIndex === 'net_proceeds_price'">
            <span>
              <vco-number v-if="record.net_proceeds_price" :value="record.net_proceeds_price" :precision="2" :color="Number(record.variance) > 0 ? '#eb4b6d' : '#31bd65'"></vco-number>
              <p v-else>--</p>
            </span>
          </template>
          <template v-if="column.dataIndex === 'variance'">
            <span>
              <span class="variance" :class="{'plus': Number(record.variance) > 0}" v-if="record.variance">{{ record.variance }}%</span>
              <p v-else>--</p>
            </span>
          </template>
          <template v-if="column.dataIndex === 'create_time'">
            <span>
              <span v-if="record.create_time">{{ tool.showDate(record.create_time) }}</span>
              <p v-else>--</p>
            </span>
          </template>
        </template>
      </a-table>
    </div>

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
  import { cloneDeep } from "lodash"

  const emits = defineEmits(['update:visible'])

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    infoData: {
      type: Object,
      default: () => {}
    }
  });

  const { t } = useI18n();

  /* 更新visible */
  const updateVisible = (value) => {
    emits('update:visible', value);
  };

  const tableRef = ref()
  const tableData = computed(() => {
    const data = cloneDeep(props.infoData)
    const log = data.log || []
    return log
  })

  const columns = ref([
    { title: t('销售价格'), dataIndex: 'sales_price', width: 130, align: 'left' },
    { title: 'GST', dataIndex: 'is_gst', width: 100, align: 'center' },
    { title: t('预计收款'), dataIndex: 'repayment_price', width: 130, align: 'center' },
    { title: t('合同日期'), dataIndex: 'contract_date', width: 110, align: 'center' },
    { title: t('结算日期'), dataIndex: 'settlement_date', width: 110, align: 'center' },
    { title: t('日落日期'), dataIndex: 'sunset_date', width: 110, align: 'center' },
    { title: t('还款日期'), dataIndex: 'repayment_date', width: 110, align: 'center' },
    { title: t('净收益'), dataIndex: 'net_proceeds_price', width: 130, align: 'center' },
    { title: t('变化比例'), dataIndex: 'variance', width: 110, align: 'center' },
    { title: t('创建日期'), dataIndex: 'create_time', width: 110, align: 'right' }
  ])
</script>

<style lang="less" scoped>
.item-txt {
  margin: 20px 0;
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

.table-content {
  width: 100%;
  min-height: 300px;
  :deep(.ant-statistic-content) {
    font-size: 15px !important;
    white-space: nowrap;
  }
}

.variance {
  font-size: 15px;
  color: #31bd65;
  &.plus {
    color: #eb4b6d;
  }
}

.rate-type {
  font-size: 12px;
  color: #31bd65;
  &.plus {
    color: #eb4b6d;
  }
}
</style>