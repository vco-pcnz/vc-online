<template>
  <vco-page-panel :title="t('还款计划1')" isBack>
    <div class="colorPrimary">
        {{ t('还款方式') }} <span class="dot-sep">/</span> {{ t('还款日方式') }}
    </div>
  </vco-page-panel>

  <!-- 统计数据 -->
  <div class="stats-card">
    <div class="status">status: {{ stats.status }}</div>
    <a-row :gutter="[16, 12]">
      <a-col :span="6">
        <p class="stats-label">{{ t('截至日期') }}</p>
        <p class="stats-value">{{ stats.asOfDate ? tool.showDate(stats.asOfDate) : (stats.asOfDate === undefined ? tool.showDate(new Date()) : '-') }}</p>
      </a-col>
      <a-col :span="6">
        <p class="stats-label">{{ t('本金') }}</p>
        <p class="stats-value">
          <vco-number v-if="stats.principal != null" :value="stats.principal" :precision="2" :end="true"></vco-number>
          <span v-else>-</span>
        </p>
      </a-col>
      <a-col :span="6">
        <p class="stats-label">{{ t('贷款利率') }}</p>
        <p class="stats-value">{{ stats.interestRate != null ? stats.interestRate + '%' : '-' }}</p>
      </a-col>
      <a-col :span="6">
        <p class="stats-label">{{ t('罚息利率Lendr') }}</p>
        <p class="stats-value">{{ stats.defaultRate != null ? stats.defaultRate + '%' : '-' }}</p>
      </a-col>
      <a-col :span="6">
        <p class="stats-label">{{ t('宽限期天数') }}</p>
        <p class="stats-value">{{ stats.gracePeriodDays ?? '-' }}</p>
      </a-col>
      <a-col :span="6">
        <p class="stats-label">{{ t('上一个还款日期') }}</p>
        <p class="stats-value">{{ stats.previousRepaymentDate ? tool.showDate(stats.previousRepaymentDate) : '-' }}</p>
      </a-col>
      <a-col :span="6">
        <p class="stats-label">{{ t('最早未还款的还款日') }}</p>
        <p class="stats-value">{{ stats.earliestUnpaidDue ? tool.showDate(stats.earliestUnpaidDue) : '-' }}</p>
      </a-col>
      <a-col :span="6">
        <p class="stats-label">{{ t('最早的一个宽限期的最后一天') }}</p>
        <p class="stats-value">{{ stats.earliestUnpaidGraceEnds ? tool.showDate(stats.earliestUnpaidGraceEnds) : '-' }}</p>
      </a-col>
      <a-col :span="6">
        <p class="stats-label">{{ t('下一个还款日') }}</p>
        <p class="stats-value">{{ stats.nextDueDate ? tool.showDate(stats.nextDueDate) : '-' }}</p>
      </a-col>
      <a-col :span="6">
        <p class="stats-label">{{ t('下一期应还金额') }}</p>
        <p class="stats-value">
          <vco-number v-if="stats.amountDueNextInstalment != null" :value="stats.amountDueNextInstalment" :precision="2" :end="true"></vco-number>
          <span v-else>-</span>
        </p>
      </a-col>
      <a-col :span="6">
        <p class="stats-label">{{ t('欠款金额Lendr') }}</p>
        <p class="stats-value">
          <vco-number v-if="stats.arrearsAmount != null" :value="stats.arrearsAmount" :precision="2" :end="true"></vco-number>
          <span v-else>-</span>
        </p>
      </a-col>
      <a-col :span="6">
        <p class="stats-label">{{ t('截至目前所有欠款金额') }}</p>
        <p class="stats-value">
          <vco-number v-if="stats.totalAmountDueAsOf != null" :value="stats.totalAmountDueAsOf" :precision="2" :end="true"></vco-number>
          <span v-else>-</span>
        </p>
      </a-col>
      <a-col :span="6">
        <p class="stats-label">{{ t('累计罚息产生的利息(未结)') }}</p>
        <p class="stats-value stats-highlight">
          <vco-number v-if="stats.accruedDefaultInterestUnsettled != null" :value="stats.accruedDefaultInterestUnsettled" :precision="2" :end="true"></vco-number>
          <span v-else>-</span>
        </p>
      </a-col>
      <a-col :span="6">
        <p class="stats-label">{{ t('累计罚息(已结)') }}</p>
        <p class="stats-value stats-highlight">
          <vco-number v-if="stats.capitalisedDefaultInterest != null" :value="stats.capitalisedDefaultInterest" :precision="2" :end="true"></vco-number>
          <span v-else>-</span>
        </p>
      </a-col>
      <a-col :span="6">
        <p class="stats-label">{{ t('罚息减免金额') }}</p>
        <p class="stats-value stats-highlight">
          <vco-number v-if="stats.waivedDefaultInterest != null" :value="stats.waivedDefaultInterest" :precision="2" :end="true"></vco-number>
          <span v-else>-</span>
        </p>
      </a-col>
      <a-col :span="6">
        <p class="stats-label">{{ t('累计产生的复利(未结)') }}</p>
        <p class="stats-value stats-highlight">
          <vco-number v-if="stats.accruedOverdueChargeUnsettled != null" :value="stats.accruedOverdueChargeUnsettled" :precision="2" :end="true"></vco-number>
          <span v-else>-</span>
        </p>
      </a-col>
      <a-col :span="6">
        <p class="stats-label">{{ t('累计产生的复利(已结)') }}</p>
        <p class="stats-value stats-highlight">
          <vco-number v-if="stats.capitalisedOverdueCharge != null" :value="stats.capitalisedOverdueCharge" :precision="2" :end="true"></vco-number>
          <span v-else>-</span>
        </p>
      </a-col>
    </a-row>
  </div>

  <div class="RepaymentSchedule">
    <a-spin :spinning="loading" size="large">
    
      <div class="sys-table-content border-top-none">
        <a-table :columns="columns" :data-source="tableData" :pagination="false" :rowKey="rowKey">
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'due_date'">
                <span>{{ formatDate(record.due_date) }}</span>
              </template>
              <template v-if="column.dataIndex === 'days'">
                <span>{{ record.days ?? '-' }}</span>
              </template>
              <template v-if="column.dataIndex === 'interest'">
                <span>{{ tool.formatMoney(record.interest||0) }}</span>
              </template>
              <template v-if="column.dataIndex === 'principle'">
                <span>{{ tool.formatMoney(record.principle||0) }}</span>
              </template>
              <template v-if="column.dataIndex === 'payment'">
                <span>{{ tool.formatMoney(record.principle||0) }}</span>
              </template>
              <template v-if="column.dataIndex === 'amount'">
                <span>{{ tool.formatMoney(record.amount||0) }}</span>
              </template>
              <template v-if="column.dataIndex === 'paid_date'">
                <span>{{ tool.showDate(record.paid_date) ?? '-' }}</span>
              </template>
              <template v-if="column.dataIndex === 'status'">
                <span>{{ record.status ?? '-' }}</span>
              </template>
              <template v-if="column.dataIndex === 'arrears'">
                <span>{{ tool.formatMoney(record.arrears||0) }}</span>
              </template>
              <template v-if="column.dataIndex === 'applied'">
                <span>{{ record.applied ? t('是') : t('否') }}</span>
              </template>
              <template v-if="column.dataIndex === 'reference'">
                <span>{{ record.reference ?? '-' }}</span>
              </template>
          </template>
        </a-table>
      </div>
      <div class="mt-5" v-if="total">
        <a-pagination size="small" :total="total" :pageSize="pagination.limit" :current="pagination.page" :show-size-changer="false" show-quick-jumper :show-total="(total) => t('共{0}条', [total])" @change="setPaginate" />
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import tool from '@/utils/tool';
import { repayStat } from '@/api/project/loan';

const route = useRoute();
const { t } = useI18n();

const uuid = ref('');
const loading = ref(true);
const tableData = ref([]);
// 统计数据（可从 loanRepaymentSchedule 或单独接口获取后赋值）
const stats = ref({
  interestCalculationMethod: '',
  repaymentDateMethod: '',
  asOfDate: undefined,
  principal: null,
  interestRate: null,
  defaultRate: null,
  gracePeriodDays: null,
  previousRepaymentDate: null,
  earliestUnpaidDue: null,
  earliestUnpaidGraceEnds: null,
  nextDueDate: null,
  amountDueNextInstalment: null,
  status: '',
  arrearsAmount: null,
  totalAmountDueAsOf: null,
  accruedDefaultInterestUnsettled: null,
  capitalisedDefaultInterest: null,
  waivedDefaultInterest: null,
  accruedOverdueChargeUnsettled: null,
  capitalisedOverdueCharge: null,
});
const total = ref(0);
const pagination = ref({
  page: 1,
  limit: 5,
});

const columns = computed(() => [
  {
    title: t('还款日'),
    dataIndex: 'due_date',
    align: 'center',
  },
  {
    title: t('周期天数'),
    dataIndex: 'days',
    align: 'center',
  },
  {
    title: t('还款日的利息部分'),
    dataIndex: 'interest',
    align: 'center',
  },
  {
    title: t('还款日的本金部分'),
    dataIndex: 'principle',
    align: 'center',
  },
  {
    title: t('计划还款金额'),
    dataIndex: 'payment',
    align: 'center',
  },
  {
    title: t('已还金额'),
    dataIndex: 'amount',
    align: 'center',
  },
  {
    title: t('最新还款时间'),
    dataIndex: 'paid_date',
    align: 'center',
  },
  {
    title: t('状态'),
    dataIndex: 'status',
    align: 'center',
  },
  {
    title: t('剩余欠款'),
    dataIndex: 'arrears',
    align: 'center',
  },
  {
    title: t('是否申请还款'),
    dataIndex: 'applied',
    align: 'center',
  },
  {
    title: t('还款的哪一笔'),
    dataIndex: 'reference',
    align: 'center',
  }
]);

const rowKey = (record, index) =>
  record.id || record.uuid || record.due_date || index;

const formatDate = (date) => {
  return date ? tool.showDate(date) : '-';
};

const setPaginate = (page, limit) => {
  pagination.value = {
    page,
    limit,
  };
  loadData();
};

const loadData = () => {
  loading.value = true;
  repayStat({ uuid: uuid.value, ...pagination.value })
    .then((res) => {
      tableData.value = res.data || [{}];
      total.value = res.count || 0;
      // 若接口返回统计数据，可在此赋值，例如：stats.value = { ...stats.value, ...res.stats };
    })
    .finally(() => {
      loading.value = false;
    });
};

onMounted(() => {
  uuid.value = route.query.uuid;
  loadData();
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.colorPrimary .dot-sep {
  margin: 0 3px;
  opacity: 0.8;
}

.stats-card {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  background-color: #f5f5f5;
  border: 1px solid #dddddd;
  position: relative;

  .stats-label {
    margin: 0 0 4px 0;
    font-size: 12px;
    color: #666;
  }

  .stats-value {
    margin: 0;
    font-size: 14px;
    color: #333;

    &.stats-highlight {
      font-weight: 500;
      color: #1890ff;
    }
  }

  .status {
    color: #389e0d;
    background: #f6ffed;
    border: 1px solid #b7eb8f;
    padding: 2px 30px;
    position: absolute;
    border-top-right-radius: 10px;
    border-bottom-left-radius: 10px;
    top: 0;
    right: 0;
    font-weight: bold;
  }
}

</style>
