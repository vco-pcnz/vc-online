<template>
  <vco-page-panel :title="t('还款计划1')" isBack>
    <div class="colorPrimary">
        {{ stats.type_name }} <span class="dot-sep">/</span> {{stats.day_name }}
    </div>
  </vco-page-panel>


  <div class="RepaymentSchedule">
    <a-spin :spinning="loading" size="large">

      
    <!-- 统计数据 -->
    <div class="stats-card">
      <div class="status">
      <template v-if="stats.status== 1">
          {{ t('最新状态') }}
      </template>
      <template v-else-if="stats.status== 2">
          {{ t('欠款中') }}
      </template>
      <template v-else-if="stats.status== 3">
          {{ t('罚息中') }}
      </template>
      </div>
      <a-row :gutter="[16, 12]">
        <a-col :span="6">
          <p class="stats-label">{{ t('还款方式') }}</p>
          <p class="stats-value">{{ stats.repay_name }}</p>
        </a-col>
        <a-col :span="6">
          <p class="stats-label">{{ t('截至日期') }}</p>
          <p class="stats-value">{{ tool.showDate(stats.today) }}</p>
        </a-col>
        <a-col :span="6">
          <p class="stats-label">{{ t('本金') }}</p>
          <p class="stats-value">
            <vco-number size="fs_md" :value="stats.Principal || 0" :precision="2" :end="true"></vco-number>
          </p>
        </a-col>
        <a-col :span="6">
          <p class="stats-label">{{ t('贷款利率') }}</p>
          <p class="stats-value">{{ stats.Interest_rate != null ? stats.Interest_rate + '%' : '-' }}</p>
        </a-col>
        <a-col :span="6">
          <p class="stats-label">{{ t('罚息利率Lendr') }}</p>
          <p class="stats-value">{{ stats.Default_rate != null ? stats.Default_rate + '%' : '-' }}</p>
        </a-col>
        <a-col :span="6">
          <p class="stats-label">{{ t('宽限期天数') }}</p>
          <p class="stats-value">{{ stats.Grace_day ?? '-' }}</p>
        </a-col>
        <a-col :span="6">
          <p class="stats-label">{{ t('上一个还款日期') }}</p>
          <p class="stats-value">{{ stats.perv_day ? tool.showDate(stats.perv_day) : '-' }}</p>
        </a-col>
        <a-col :span="6">
          <p class="stats-label">{{ t('最早未还款的还款日') }}</p>
          <p class="stats-value">{{ stats.before_day ? tool.showDate(stats.before_day) : '-' }}</p>
        </a-col>
        <a-col :span="6">
          <p class="stats-label">{{ t('最早的一个宽限期的最后一天') }}</p>
          <p class="stats-value">{{ stats.before_grace_day ? tool.showDate(stats.before_grace_day) : '-' }}</p>
        </a-col>
        <a-col :span="6">
          <p class="stats-label">{{ t('下一个还款日') }}</p>
          <p class="stats-value">{{ stats.next_day ? tool.showDate(stats.next_day) : '-' }}</p>
        </a-col>
        <a-col :span="6">
          <p class="stats-label">{{ t('下一期应还金额') }}</p>
          <p class="stats-value">
            <vco-number size="fs_md" :value="stats.next_amount || 0" :precision="2" :end="true"></vco-number>
          </p>
        </a-col>
        <a-col :span="6">
          <p class="stats-label">{{ t('欠款金额Lendr') }}</p>
          <p class="stats-value">
            <vco-number size="fs_md" :value="stats.arrears || 0" :precision="2" :end="true"></vco-number>
          </p>
        </a-col>
        <a-col :span="6">
          <p class="stats-label">{{ t('截至目前所有欠款金额') }}</p>
          <p class="stats-value">
            <vco-number size="fs_md" :value="stats.all_arrears || 0" :precision="2" :end="true"></vco-number>
          </p>
        </a-col>
        <a-col :span="6">
          <p class="stats-label">{{ t('累计罚息产生的利息(未结)') }}</p>
          <p class="stats-value stats-highlight">
            <vco-number size="fs_md" :value="stats.Accrued_Interest || 0" :precision="2" :end="true"></vco-number>
          </p>
        </a-col>
        <a-col :span="6">
          <p class="stats-label">{{ t('累计罚息(已结)') }}</p>
          <p class="stats-value stats-highlight">
            <vco-number size="fs_md" :value="stats.Capitalised_Interest || 0" :precision="2" :end="true"></vco-number>
          </p>
        </a-col>
        <a-col :span="6">
          <p class="stats-label">{{ t('罚息减免金额') }}</p>
          <p class="stats-value stats-highlight">
            <vco-number size="fs_md" :value="stats.Waived_Default || 0" :precision="2" :end="true"></vco-number>
          </p>
        </a-col>
        <a-col :span="6">
          <p class="stats-label">{{ t('累计产生的复利(未结)') }}</p>
          <p class="stats-value stats-highlight">
            <vco-number size="fs_md" :value="stats.Accrued_Default || 0" :precision="2" :end="true"></vco-number>
          </p>
        </a-col>
        <a-col :span="6">
          <p class="stats-label">{{ t('累计产生的复利(已结)') }}</p>
          <p class="stats-value stats-highlight">
            <vco-number size="fs_md" :value="stats.Capitalised_Default || 0" :precision="2" :end="true"></vco-number>
          </p>
        </a-col>
      </a-row>
    </div>
    
      <div class="sys-table-content border-top-none">
        <a-table :columns="columns" :data-source="tableData" :pagination="false">
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.dataIndex === 'start'">
                <span>{{ formatDate(record.start) }}</span>
              </template>
              <template v-if="column.dataIndex === 'due_date'">
                <span>{{ formatDate(record.end) }}</span>
              </template>
              <template v-if="column.dataIndex === 'days'">
                <span>{{ record.diffDay ?? '-' }}</span>
              </template>
              <template v-if="column.dataIndex === 'interest'">
                <span>{{ tool.formatMoney(record.interest || 0) }}</span>
              </template>
              <template v-if="column.dataIndex === 'principal'">
                <span>{{ tool.formatMoney(record.principal||0) }}</span>
              </template>
              <template v-if="column.dataIndex === 'payment'">
                <span>{{ tool.formatMoney(record.repayment||0) }}</span>
              </template>
              <template v-if="column.dataIndex === 'amount'">
                <span>{{ tool.formatMoney(record.paid_amount||0) }}</span>
              </template>
              <template v-if="column.dataIndex === 'paid_date'">
                <span>{{record.paid_date? tool.showDate(record.paid_date): '-' }}</span>
              </template>
              <template v-if="column.dataIndex === 'status'">
                <span>{{ record.paid_status ?? '-' }}</span>
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
              <template v-if="column.dataIndex === 'op'">
                <!-- 已结算：仅最后一个 is_settle==1 可取消 -->
                <vco-popconfirm url="/projectDetail/lendrSettleCancel" :formParams="{ uuid: uuid,date:record.end }" :tip="t('您确定要取消结算吗？')" method="get" @update="loadData()" v-if="record.is_settle == 1 && index === lastSettledIndex">
                  <a-button type="primary" size="small" shape="round">{{ t('取消') }}</a-button>
                </vco-popconfirm>
                <a-button v-else-if="record.is_settle == 1" type="primary" size="small" shape="round" disabled>{{ t('取消') }}</a-button>
                <!-- 未结算：仅第一个 is_settle==0 可结算 -->
                <vco-popconfirm url="/projectDetail/lendrSettle" :formParams="{ uuid: uuid,date:record.end }" :tip="t('您确定要确认结算吗？')" method="get" @update="loadData()" v-else-if="record.is_settle != 1 && index === firstUnsettledIndex">
                  <a-button type="primary" size="small" shape="round">{{ t('结算') }}</a-button>
                </vco-popconfirm>
                <a-button v-else type="primary" size="small" shape="round" disabled>{{ t('结算') }}</a-button>
              </template>
          </template>
        </a-table>
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

const stats = ref({});

// 第一个 is_settle == 0 的行可点「结算」
const firstUnsettledIndex = computed(() => {
  return tableData.value.findIndex((r) => r.is_settle == 0);
});
// 最后一个 is_settle == 1 的行可点「取消」
const lastSettledIndex = computed(() => {
  let idx = -1;
  tableData.value.forEach((r, i) => {
    if (r.is_settle == 1) idx = i;
  });
  return idx;
});

const columns = computed(() => [
  {
    title: t('周期开始时间'),
    dataIndex: 'start',
    align: 'center',
  },
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
    dataIndex: 'principal',
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
    title: t('操作1'),
    dataIndex: 'op',
    align: 'center',
    width: 100,
    fixed: 'right',
  },
  // {
  //   title: t('是否申请还款'),
  //   dataIndex: 'applied',
  //   align: 'center',
  // },
  // {
  //   title: t('还款的哪一笔'),
  //   dataIndex: 'reference',
  //   align: 'center',
  // }
]);

const formatDate = (date) => {
  return date ? tool.showDate(date) : '-';
};

const loadData = () => {
  loading.value = true;
  repayStat({ uuid: uuid.value })
    .then((res) => {
      stats.value = { ...res };
      tableData.value = res.list || [];
      console.log(tableData.value);
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
