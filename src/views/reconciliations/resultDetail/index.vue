<template>
  <layout ref="layoutRef">
    <template #content>
      <a-spin :spinning="loading" size="large">
        <div class="flex justify-between items-center mb-5">
          <div class="flex items-center gap-5" style="flex: 1">
            <i class="iconfont nav-icon" @click="goBack">&#xe794;</i>
          </div>
          <a-button type="dark" :loading="downloading" class="" @click="report">Create report</a-button>
        </div>
        <div class="card">
          <a-row :gutter="16">
            <a-col :span="4">
              <p class="label">{{ t('项目 ID') }}</p>
              <div class="id-info">ID: {{ data?.base?.project_apply_sn }}</div>
            </a-col>
            <a-col :span="4">
              <p class="label">{{ t('项目名称') }}</p>
              <div :title="data?.base?.project_name">{{ data?.base?.project_name }}</div>
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
              <div>{{ date.start_date ? tool.showDate(date.start_date) : '' }} - {{ date.end_date ? tool.showDate(date.end_date) : '' }}</div>
            </a-col>
          </a-row>
        </div>
        <div></div>
        <a-table :data-source="data?.data" :columns="columns" :pagination="false" :scroll="{ x: '100%' }">
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'date'">
              <p><span class="label">VCO</span></p>
              <p>{{ record?.vco_date ? tool.showDate(record?.vco_date) : '-' }}</p>
              <p><span class="label">Xero</span></p>
              <p>{{ record?.xero_date ? tool.showDate(record?.xero_date) : '-' }}</p>
            </template>
            <template v-if="column.dataIndex === 'spend'">
              <p><span class="label">VCO</span></p>
              <p>{{ record?.vco_spend_amount ? tool.formatMoney(Math.abs(record?.vco_spend_amount)) : '-' }}</p>
              <p><span class="label">Xero</span></p>
              <p>{{ record?.xero_spend_amount ? tool.formatMoney(Math.abs(record?.xero_spend_amount)) : '-' }}</p>
            </template>
            <template v-if="column.dataIndex === 'received'">
              <p><span class="label">VCO</span></p>
              <p>{{ record?.vco_received_amount ? tool.formatMoney(Math.abs(record?.vco_received_amount)) : '-' }}</p>
              <p><span class="label">Xero</span></p>
              <p>{{ record?.xero_received_amount ? tool.formatMoney(Math.abs(record?.xero_received_amount)) : '-' }}</p>
            </template>
            <template v-if="column.dataIndex === 'reference'">
              <p><span class="label">VCO</span></p>
              <p :title="record?.vco_reference" class="text-ellipsis overflow-hidden whitespace-normal line-clamp-1">{{ record?.vco_reference || '-' }}</p>
              <p><span class="label">Xero</span></p>
              <p :title="record?.xero_reference" class="text-ellipsis overflow-hidden whitespace-normal line-clamp-1">{{ record?.xero_reference || '-' }}</p>
            </template>
            <template v-if="column.dataIndex === 'description'">
              <p><span class="label">VCO</span></p>
              <p :title="record?.vco_note" class="text-ellipsis overflow-hidden whitespace-normal line-clamp-1">{{ record?.vco_note || '-' }}</p>
              <p><span class="label">Xero</span></p>
              <p :title="record?.xero_description" class="text-ellipsis overflow-hidden whitespace-normal line-clamp-1">{{ record?.xero_description || '-' }}</p>
            </template>
            <template v-if="column.dataIndex === 'status'">
              <p><span class="label">VCO</span></p>
              <p>{{ record?.vco_date ? (record?.vco_status <= 1 ? t('未对账') : t('已对账')) : '-' }}</p>
              <p><span class="label">Xero</span></p>
              <p>{{ record?.xero_date ? (record?.xero_status == 1 ? t('已对账') : t('未对账')) : '-' }}</p>
            </template>
          </template>
        </a-table>
      </a-spin>
      <div class="flex justify-center pb-5">
        <a-pagination size="small" :total="total" :pageSize="pagination.limit" :current="pagination.page" show-quick-jumper :show-total="(total) => t('共{0}条', [total])" @change="setPaginate" />
      </div>
    </template>
  </layout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import layout from '../components/layout.vue';
import tool from '@/utils/tool.js';
import { goBack } from '@/utils/tool';
import { useRoute } from 'vue-router';
import { resultReportDetail, resultReportExport } from '@/api/reconciliations';

const { t } = useI18n();
const route = useRoute();

const columns = reactive([
  {
    title: t('日期'),
    dataIndex: 'date',
    width: '140px'
  },
  {
    title: t('支出'),
    dataIndex: 'spend',
    width: '160px'
  },
  {
    title: t('已收到'),
    dataIndex: 'received',
    width: '160px'
  },
  {
    title: t('参考'),
    dataIndex: 'reference'
  },
  {
    title: t('描述'),
    dataIndex: 'description'
  },
  {
    title: t('状态'),
    dataIndex: 'status'
  },
  {
    title: t('对账日期'),
    width: '200px',
    dataIndex: 'reconcile_date',
    customRender: ({ text }) => {
      return text ? tool.showDate(text) : '';
    }
  }
]);

const data = ref([]);
const total = ref(0);
const loading = ref(false);
const date = ref({
  start_date: '',
  end_date: ''
});

const pagination = ref({
  page: 1,
  limit: 10
});

const setPaginate = (page, limit) => {
  pagination.value = {
    page,
    limit
  };
  loadData();
};

const loadData = () => {
  loading.value = true;
  resultReportDetail({ client_uuid: route.query.client_uuid, ...pagination.value, ...date.value })
    .then((res) => {
      total.value = res.count;
      data.value = res.data;
    })
    .finally(() => {
      loading.value = false;
    });
};

const downloading = ref(false);
const report = () => {
  downloading.value = true;
  resultReportExport({ client_uuid: route.query.client_uuid, ...date.value })
    .then((res) => {
      window.open(res);
    })
    .finally(() => {
      downloading.value = false;
    });
};

onMounted(() => {
  date.value = {
    start_date: route.query.start_date,
    end_date: route.query.end_date
  };
  loadData();
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.id-info {
  color: @colorPrimary;
}
.label {
  color: #888;
  display: inline-block;
  // width: 33px;
  text-align: right;
  font-size: 10px;
}

.nav-icon {
  cursor: pointer;
  display: inline-block;
  transform: rotate(-135deg);
  color: #bf9425;
  font-size: 14px !important;
}

.card {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  background-color: #f5f5f5;
  border: 1px solid #dddddd;
}
</style>
