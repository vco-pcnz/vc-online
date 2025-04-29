<template>
  <layout ref="layoutRef">
    <template #content>
      <a-spin :spinning="loading" size="large">
        <div class="flex justify-between items-end mb-5">
          <TableSearch @search="search"></TableSearch>
          <a-button type="dark" :loading="downloading" class="" @click="report">Create report</a-button>
        </div>
        <a-table :data-source="dataSource" :columns="columns" :pagination="false" :scroll="{ x: '100%' }">
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'lm_list'">
              <div class="flex items-center gap-3" v-for="(item, index) in record?.lm_list" :key="index">
                <vco-avatar :src="item.avatar" :size="30"></vco-avatar>
                <p :title="item.name">LM</p>
              </div>
            </template>
            <template v-if="column.dataIndex === 'project'">
              <div class="cursor-pointer" @click="toDetail(record)">
                <div class="id-info">ID: {{ record.project_apply_sn }}</div>
                <div class="text-ellipsis overflow-hidden inline-block text-nowrap" style="width: 120px" :title="record.project_name">{{ record.project_name }}</div>
              </div>
            </template>
            <template v-if="column.dataIndex === 'spend'">
              <p><span class="label">VCO</span>: {{ tool.formatMoney(Math.abs(record?.vco_spend_money)) }}</p>
              <p><span class="label">Xero</span>: {{ tool.formatMoney(Math.abs(record?.xero_spend_amount)) }}</p>
              <p>
                <span class="label">{{ t('差额') }}</span
                >: {{ tool.formatMoney(Math.abs(record?.spend_amount_diff)) }}
              </p>
            </template>
            <template v-if="column.dataIndex === 'received'">
              <p><span class="label">VCO</span>: {{ tool.formatMoney(Math.abs(record?.vco_received_amount)) }}</p>
              <p><span class="label">Xero</span>: {{ tool.formatMoney(Math.abs(record?.xero_received_amount)) }}</p>
              <p>
                <span class="label">{{ t('差额') }}</span
                >: {{ tool.formatMoney(Math.abs(record?.received_amount_diff)) }}
              </p>
            </template>
            <template v-if="column.dataIndex === 'total'">
              <p><span class="label">VCO</span>: {{ record?.vco_transaction_count }}</p>
              <p><span class="label">Xero</span>: {{ record?.xero_bill_count }}</p>
            </template>

            <template v-if="column.dataIndex === 'netting_amount'">
              <p :class="[{ 'color_red-error': record?.netting_amount != '0.00' }]">{{ tool.formatMoney(Math.abs(record?.netting_amount)) }}</p>
            </template>
            <template v-if="column.dataIndex === 'Operation'">
              <div @click="toDetail(record)" class="nav_box"></div>
              <i class="iconfont nav-icon" @click="toDetail(record)">&#xe794;</i>
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
import { navigationTo } from '@/utils/tool';
import { resultReport, reportExport } from '@/api/reconciliations';
import TableSearch from './TableSearch.vue';
import { cloneDeep } from 'lodash';

const { t } = useI18n();

const columns = reactive([
  {
    title: t('项目信息'),
    dataIndex: 'project',
    width: '150px'
  },
  {
    title: 'LM',
    dataIndex: 'lm_list',
    width: '100px'
  },
  {
    title: t('借款人'),
    dataIndex: 'borrower',
    width: '150px',
    ellipsis: true
  },
  {
    title: t('支出'),
    dataIndex: 'spend'
  },
  {
    title: t('已收到'),
    dataIndex: 'received'
  },
  {
    title: t('数量'),
    dataIndex: 'total',
    width: '120px'
  },
  {
    title: t('轧差值'),
    dataIndex: 'netting_amount',
    width: '150px'
  },
  {
    title: t('操作1'),
    dataIndex: 'Operation',
    width: '80px'
  }
]);

const toDetail = (record) => {
  navigationTo(`/reconciliations/resultReport/detail?client_uuid=${record.client_uuid}&start_date=${searchParams.value.start_date}&end_date=${searchParams.value.end_date}`);
};

const dataSource = ref([]);
const layoutRef = ref();
const total = ref(0);
const loading = ref(false);

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
  resultReport({ ...pagination.value, ...searchParams.value })
    .then((res) => {
      total.value = res.count;
      dataSource.value = res.data;
      layoutRef.value.setNum(total.value);
    })
    .finally(() => {
      loading.value = false;
    });
};

const searchParams = ref({
  lm_name: '',
  project_name: '',
  borrower_name: '',
  start_date: '',
  end_date: ''
});

const search = (val) => {
  searchParams.value = cloneDeep(val);
  reload();
};

const reload = () => {
  pagination.value.page = 1;
  loadData();
};

const downloading = ref(false);
const report = () => {
  downloading.value = true;
  reportExport(searchParams.value)
    .then((res) => {
      window.open(res);
    })
    .finally(() => {
      downloading.value = false;
    });
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.id-info {
  color: @colorPrimary;
  margin-bottom: 5px;
}
.label {
  color: #888;
  display: inline-block;
  width: 33px;
}

.nav-icon {
  cursor: pointer;
  display: inline-block;
  transform: rotate(-45deg);
  color: #bf9425;
  font-size: 10px !important;
}

.nav_box {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
  cursor: pointer;
}
</style>
