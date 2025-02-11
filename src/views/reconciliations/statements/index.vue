<template>
  <layout ref="layoutRef" @update="reload">
    <template #content>
      <a-spin :spinning="loading" size="large">
        <a-table :data-source="dataSource" :columns="columns" :pagination="false">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <div v-if="record.status" class="status_tag">Reconciled</div>
              <div v-else class="status_tag unreconciled_tag">Unreconciled</div>
            </template>
          </template>
        </a-table>
      </a-spin>
      <div class="flex justify-center pb-5">
        <a-pagination
          size="small"
          :total="total"
          :pageSize="pagination.limit"
          :current="pagination.page"
          show-quick-jumper
          :show-total="(total) => t('共{0}条', [total])"
          @change="setPaginate"
        />
      </div>
    </template>
  </layout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import layout from '../components/layout.vue';
import tool from '@/utils/tool.js';
import { getStatements } from '@/api/reconciliations';

const { t } = useI18n();

const columns = reactive([
  {
    title: t('日期'),
    dataIndex: 'date',
    key: 'name',
    customRender: ({ text }) => {
      return tool.showDate(Date(text));
    }
  },
  {
    title: t('委托人'),
    dataIndex: 'client_name',
    key: 'client',
    width: '16%',
    customRender: ({ record }) => {
      // console.log(record);
      //  return record.project.project_name
    }
  },
  {
    title: t('参考'),
    dataIndex: 'reference',
    key: 'reference',
    width: '12%'
  },
  {
    title: t('描述'),
    dataIndex: 'description',
    key: 'description',
    width: '20%'
  },
  {
    title: t('支出'),
    dataIndex: 'spent',
    key: 'spent',
    width: '150px',
    customRender: ({ record }) => {
      if (record.amount > 0) return tool.formatMoney(Math.abs(record.amount));
    }
  },
  {
    title: t('已收到'),
    dataIndex: 'received',
    key: 'received',
    width: '150px',
    customRender: ({ record }) => {
      if (record.amount < 0) return tool.formatMoney(Math.abs(record.amount));
    }
  },
  {
    title: t('状态'),
    dataIndex: 'status',
    key: 'status',
    width:'200px'
  }
]);

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
  getStatements(pagination.value)
    .then((res) => {
      total.value = res.count;
      dataSource.value = res.data;
      layoutRef.value.setNum(total.value);
    })
    .finally(() => {
      loading.value = false;
    });
};


const reload = () => {
  pagination.value.page = 1;
  loadData();
};


onMounted(() => {
  loadData();
});
</script>

<style scoped lang="less">
.status_tag {
  align-items: center;
  border-radius: 38px;
  display: inline-flex;
  font-size: 14px;
  font-weight: 500;
  height: 30px;
  letter-spacing: 1px;
  line-height: 2;
  padding: 10px 20px;
  text-transform: uppercase;
  background-color: #b4f1db;
  color: #272727;
}

.unreconciled_tag {
  background-color: rgba(234, 197, 57, 0.3);
  color: #bf9425;
}
</style>
