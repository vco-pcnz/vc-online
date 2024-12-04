<template>
  <layout>
    <template #content>
      <a-table :data-source="dataSource" :columns="columns" :pagination="pagination">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <div v-if="record.status === 'Reconciled'" class="status_tag">
              {{ record.status }}
            </div>
            <div v-else class="status_tag unreconciled_tag">
              {{ record.status }}
            </div>
          </template>
        </template>
      </a-table>
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
const pagination = reactive({
  position: ['bottomCenter'],
  showSizeChanger: false,
  total: 0,
});

const columns = reactive([
  {
    title: t('日期'),
    dataIndex: 'date',
    key: 'name',
    customRender: ({ text }) => {
      return tool.showDate(Date(text));
    },
  },
  {
    title: t('委托人'),
    dataIndex: 'client',
    key: 'client',
    width: '16%',
  },
  {
    title: t('参考'),
    dataIndex: 'reference',
    key: 'reference',
    width: '12%',
  },
  {
    title: t('描述'),
    dataIndex: 'description',
    key: 'description',
    width: '20%',
  },
  {
    title: t('支出'),
    dataIndex: 'spent',
    key: 'spent',
    customRender: ({ text }) =>
      !text ? '' : tool.formatMoney(parseInt(text), { cents: true }),
  },
  {
    title: t('收入'),
    dataIndex: 'received',
    key: 'received',
    customRender: ({ text }) =>
      !text ? '' : tool.formatMoney(parseInt(text), { cents: true }),
  },
  {
    title: t('状态'),
    dataIndex: 'status',
    key: 'status',
  },
]);

const dataSource = reactive([]);

onMounted(() => {
  getStatements().then(res => {
    const { data, count } = res;
    if(count) {
      Object.assign(dataSource, data);
      pagination.total = count;
    }
  });
})
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
