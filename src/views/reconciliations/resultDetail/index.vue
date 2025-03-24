<template>
  <layout ref="layoutRef">
    <template #content>
      <a-spin :spinning="loading" size="large">
        <div class="flex justify-between items-center mb-5">
          <i class="iconfont nav-icon" @click="goBack">&#xe794;</i> 
          <a-button type="dark" size="large" :loading="downloading" class="" @click="report">Create report</a-button>
        </div>
        <a-table :data-source="dataSource" :columns="columns" :pagination="false" :scroll="{ x: '100%' }">
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'project'">
              <div class="id-info">ID: {{ record.project_apply_sn }}</div>
              <div :title="record.project_name">{{ record.project_name || t('项目名称') }}</div>
            </template>
            <template v-if="column.dataIndex === 'xero'">
              <p>
                <span class="label">{{ t('日期') }}:</span> {{ tool.showDate(record?.xero_date) }}
              </p>
              <p>
                <span class="label">{{ t('支出') }}:</span> {{ tool.formatMoney(Math.abs(record?.xero_spend_amount)) }}
              </p>
              <p>
                <span class="label">{{ t('已收到') }}:</span> {{ tool.formatMoney(Math.abs(record?.xero_received_amount)) }}
              </p>
              <p>
                <span class="label">{{ t('参考') }}:</span> {{ record?.xero_reference }}
              </p>
              <p>
                <span class="label">{{ t('状态') }}:</span> {{ record?.xero_status == 1 ? t('已对账') : t('未对账') }}
              </p>
              <p>
                <span class="label">{{ t('描述') }}:</span> {{ record?.xero_description }}
              </p>
            </template>
            <template v-if="column.dataIndex === 'VCO'">
              <p>
                <span class="label">{{ t('日期') }}:</span> {{ tool.showDate(record?.vco_date) }}
              </p>
              <p>
                <span class="label">{{ t('支出') }}:</span> {{ tool.formatMoney(Math.abs(record?.vco_spend_amount)) }}
              </p>
              <p>
                <span class="label">{{ t('已收到') }}:</span> {{ tool.formatMoney(Math.abs(record?.vco_spend_amount)) }}
              </p>
              <p>
                <span class="label">{{ t('参考') }}:</span> {{ record?.vco_reference }}
              </p>
              <p>
                <span class="label">{{ t('状态') }}:</span> {{ record?.vco_status == 1 ? t('未对账') : t('已对账') }}
              </p>
              <p>
                <span class="label">{{ t('描述') }}:</span> {{ record?.vco_note }}
              </p>
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
    title: t('项目信息'),
    dataIndex: 'project',
    width: '150px'
  },
  {
    title: t('项目经理'),
    dataIndex: 'lending_manager',
    width: '180px'
  },
  {
    title: t('借款人'),
    dataIndex: 'borrower',
    width: '150px',
    ellipsis: true
  },
  {
    title: 'VCO',
    dataIndex: 'VCO'
  },
  {
    title: 'Xero',
    dataIndex: 'Xero'
  },
  {
    title: t('对账日期'),
    width: '200px',
    dataIndex: 'reconciliation_date',
    customRender: ({ text }) => {
      return text ? tool.showDate(text) : '';
    }
  }
]);

const dataSource = ref([]);
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
  resultReportDetail({ client_uuid: route.query.client_uuid, ...pagination.value })
    .then((res) => {
      total.value = res.count;
      dataSource.value = res.data;
    })
    .finally(() => {
      loading.value = false;
    });
};

const downloading = ref(false);
const report = (uid) => {
  downloading.value = !uid;
  resultReportExport({ client_uuid: route.query.client_uuid })
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
  // width: 33px;
  text-align: right;
}

.nav-icon {
  cursor: pointer;
  display: inline-block;
  transform: rotate(-135deg);
  color: #bf9425;
  font-size: 14px !important;
}
</style>
