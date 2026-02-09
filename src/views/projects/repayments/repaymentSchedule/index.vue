<template>
  <vco-page-panel :title="t('还款计划1')" isBack></vco-page-panel>

  <div class="RepaymentSchedule">
    <a-spin :spinning="loading" size="large">
      <div class="card">
        <a-row :gutter="16">
          <a-col :span="4">
            <p class="label">{{ t('项目 ID') }}</p>
            <div class="id-info">ID: {{ data?.base?.project_apply_sn }}</div>
          </a-col>
          <a-col :span="4">
            <p class="label">{{ t('项目名称') }}</p>
            <div :title="data?.base?.project_name">
              {{ data?.base?.project_name }}
            </div>
          </a-col>
          <a-col :span="4">
            <p class="label">{{ t('项目经理') }}</p>
            <p>{{ data?.base?.lending_manager }}</p>
          </a-col>
          <a-col :span="8">
            <p class="label">{{ t('借款人') }}</p>
            <p>{{ data?.base?.borrower }}</p>
          </a-col>
          <a-col :span="4">
            <p class="label">{{ t('日期') }}</p>
            <div>
              {{ date.start_date ? tool.showDate(date.start_date) : '' }} -
              {{ date.end_date ? tool.showDate(date.end_date) : '' }}
            </div>
          </a-col>
        </a-row>
      </div>
      <div class="table-content">
        <a-table :columns="columns" :data-source="tableData" :pagination="false" :rowKey="rowKey"
                 :scroll="{ x: '1100px' }">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'due_date'">
              <span>{{ formatDate(record.due_date) }}</span>
            </template>
            <template v-else-if="column.key === 'scheduled_amount_due'">
              <vco-number :value="record.scheduled_amount_due" :precision="2" :end="true"></vco-number>
            </template>
            <template v-else-if="column.key === 'paid_amount'">
              <div>
                <vco-number v-if="
                  record.paid_amount !== null &&
                  record.paid_amount !== undefined
                " :value="record.paid_amount" :precision="2" :end="true"></vco-number>
                <span v-else>-</span>
                <p class="fs_xs color_grey" v-if="record.paid_date">
                  {{ formatDate(record.paid_date) }}
                </p>
              </div>
            </template>
            <template v-else-if="column.key === 'status'">
              <span>{{ getStatusText(record) }}</span>
            </template>
            <template v-else-if="column.key === 'arrears'">
              <vco-number :value="record.arrears" :precision="2" :end="true"></vco-number>
            </template>
            <template v-else-if="column.key === 'accrued_default_interest'">
              <vco-number :value="record.accrued_default_interest" :precision="2" :end="true"></vco-number>
            </template>
          </template>
        </a-table>
      </div>
      <div class="mt-5" v-if="total">
        <a-pagination size="small" :total="total" :pageSize="pagination.limit" :current="pagination.page"
                      :show-size-changer="false" show-quick-jumper :show-total="(total) => t('共{0}条', [total])"
                      @change="setPaginate" />
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import tool from '@/utils/tool';
import { loanRepaymentSchedule } from '@/api/project/loan';

const route = useRoute();
const { t } = useI18n();

const uuid = ref('');
const loading = ref(true);
const tableData = ref([]);
const total = ref(0);
const pagination = ref({
  page: 1,
  limit: 5,
});

const columns = computed(() => [
  {
    title: t('还款日'),
    dataIndex: 'due_date',
    key: 'due_date',
    width: 150,
    align: 'center',
  },
  {
    title: t('本期计划应付'),
    dataIndex: 'scheduled_amount_due',
    key: 'scheduled_amount_due',
    width: 180,
    align: 'center',
  },
  {
    title: t('实际还款金额/还款日期'),
    dataIndex: 'paid_amount',
    key: 'paid_amount',
    width: 190,
    align: 'center',
  },
  {
    title: t('状态'),
    dataIndex: 'status',
    key: 'status',
    width: 200,
    align: 'center',
  },
  {
    title: t('未付金额'),
    dataIndex: 'arrears',
    key: 'arrears',
    width: 150,
    align: 'center',
  },
  {
    title: t('应计违约利息'),
    dataIndex: 'accrued_default_interest',
    key: 'accrued_default_interest',
    width: 200,
    align: 'center',
  },
]);

const rowKey = (record, index) =>
  record.id || record.uuid || record.due_date || index;

const formatDate = (date) => {
  return date ? tool.showDate(date) : '-';
};

const getStatusText = (record) => {
  const rawStatus = record.status_name ?? record.status;
  if (!rawStatus && rawStatus !== 0) {
    return '-';
  }
  return rawStatus;
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
  loanRepaymentSchedule({ uuid: uuid.value, ...pagination.value })
    .then((res) => {
      tableData.value = res.data || [];
      total.value = res.count || 0;
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

.card {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  background-color: #f5f5f5;
  border: 1px solid #dddddd;
}
</style>
