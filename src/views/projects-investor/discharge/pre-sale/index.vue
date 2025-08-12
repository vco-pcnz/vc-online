<template>
  <div>
    <!-- 修改记录 -->
    <log-dialog v-model:visible="logVisible" :info-data="currentData"> </log-dialog>

    <!-- 编辑弹窗 -->
    <edit-dialog v-model:visible="editVisible" :info-data="currentData" :uuid="uuid" @refresh="getTableData()"> </edit-dialog>

    <vco-page-panel @back="back">
      <template #title>
        <div class="page-title-content">
          <div v-if="pageTitle" class="tag">{{ pageTitle }}</div>
          <div class="tag uppercase">{{ t('预售信息') }}</div>
        </div>
      </template>
    </vco-page-panel>

    <a-spin :spinning="tableLoading" size="large">
      <div class="table-content sys-table-content no-top-line">
        <a-table ref="tableRef" rowKey="id" :columns="columns" :data-source="tableData" table-layout="fixed" :pagination="false" :scroll="{ x: '100%' }">
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
                <p v-if="record.is_gst" style="font-size: 12px; color: #aaa">{{ t('含消费税') }}</p>
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
                <span class="variance" :class="{ plus: Number(record.variance) > 0 }" v-if="record.variance">{{ record.variance }}%</span>
                <p v-else>--</p>
              </span>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a-button type="primary" size="small" shape="round" class="uppercase mb-2" @click="eidtHandle(record, true)">{{ t('编辑') }}</a-button>
              <a-button type="brown" size="small" shape="round" class="uppercase" @click="eidtHandle(record, false)">{{ t('修改记录') }}</a-button>
            </template>
          </template>
        </a-table>
      </div>
      <div v-if="tableData.length" class="mt-5">
        <a-pagination size="small" :total="pageObj.total" :current="pageObj.currentPage" :page-size="pageObj.pageSize" show-size-changer show-quick-jumper :show-total="(total) => t('共{0}条', [total])" @change="pageChange" />
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import tool from '@/utils/tool';
import { projectDetail, projectDischargeSales } from '@/api/project/project';
import { useTableList } from '@/hooks/useTableList';
import EditDialog from './components/EditDialog.vue';
import LogDialog from './components/LogDialog.vue';

const { t } = useI18n();

const route = useRoute();
const router = useRouter();

const uuid = ref(route.query.uuid);

const projectInfo = ref();
const getProjectDetail = () => {
  if (uuid.value) {
    // 发起请求
    projectDetail({ uuid: uuid.value }).then((res) => {
      projectInfo.value = res;
    });
  }
};

const pageTitle = computed(() => {
  return (projectInfo.value?.product?.name ? projectInfo.value?.product?.name + ' - ' : '') + projectInfo.value?.base?.borrower_user_name;
});

const back = () => {
  router.push(`/investor/discharge?uuid=${route.query.uuid}`);
};

const columns = reactive([
  { title: t('名称'), dataIndex: 'security_name', width: 140, align: 'left' },
  { title: t('产权编号'), dataIndex: 'card_no', width: 120, align: 'center' },
  { title: t('类型'), dataIndex: 'type_name', width: 100, align: 'center' },
  { title: t('抵押物价值'), dataIndex: 'amount', width: 140, align: 'center' },
  { title: t('销售价格'), dataIndex: 'sales_price', width: 140, align: 'center' },
  { title: t('预计收款'), dataIndex: 'repayment_price', width: 140, align: 'center' },
  { title: t('合同日期'), dataIndex: 'contract_date', width: 120, align: 'center' },
  { title: t('结算日期'), dataIndex: 'settlement_date', width: 120, align: 'center' },
  { title: t('日落日期'), dataIndex: 'sunset_date', width: 120, align: 'center' },
  { title: t('还款日期'), dataIndex: 'repayment_date', width: 120, align: 'center' },
  { title: t('净收益'), dataIndex: 'net_proceeds_price', width: 140, align: 'center' },
  { title: t('变化比例'), dataIndex: 'variance', width: 140, align: 'center' },
  {
    title: t('操作1'),
    dataIndex: 'operation',
    fixed: 'right',
    align: 'center',
    width: 140
  }
]);

const { tableRef, tableLoading, pageObj, tableData, pageChange, getTableData } = useTableList(projectDischargeSales, { uuid: uuid.value });

const editVisible = ref(false);
const logVisible = ref(false);
const currentData = ref();
const eidtHandle = (data, flag) => {
  currentData.value = data;
  if (flag) {
    editVisible.value = true;
  } else {
    logVisible.value = true;
  }
};

onMounted(() => {
  getProjectDetail();
});
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.page-title-content {
  display: flex;
  align-items: center;
  gap: 15px;
  > .tag {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    font-weight: 500;
    font-size: 14px;
    letter-spacing: 1px;
    text-transform: uppercase;
    white-space: nowrap;
    background-color: @clr_charcoal;
    color: @clr_white;
    border-radius: 16px;
    padding: 0 30px;
    &:first-child {
      border-radius: 0 16px 16px 0 !important;
    }
    &.uppercase {
      padding: 0 20px;
      background-color: @colorPrimary;
    }
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
</style>
