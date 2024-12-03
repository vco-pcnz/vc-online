<template>
  <layout>
    <template #content>
      <a-table :data-source="dataSource" :columns="columns">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <div v-if="record.status === 'Reconciled'" class="status_tag">
              {{ record.status }}
            </div>
            <div v-else class="status_tag unreconciled_tag">{{ record.status }}</div>
          </template>
        </template>
      </a-table>
    </template>
  </layout>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import layout from '../components/layout.vue';
import tool from '@/utils/tool.js';

const { t } = useI18n();
const columns = reactive([
  {
    title: t('日期'),
    dataIndex: 'date',
    key: 'name',
    customRender: (text) => {
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
  },
  {
    title: t('收入'),
    dataIndex: 'received',
    key: 'received',
  },
  {
    title: t('状态'),
    dataIndex: 'status',
    key: 'status',
  },
]);

const dataSource = reactive([
  {
    uuid: '120ed075-c15d-4e31-8ff7-04b7b1dc94f9',
    type: 'loanRequestStatusUpdated',
    client: 'North Ridge No. 7 Limited',
    description: 'sdfdescriptiondescriptiondescriptiondescriptiong',
    spent: 53009,
    received: 46000,
    status: 'Reconciled',
    read: false,
    date: '2024-11-22T14:20:10+13:00',
  },
  {
    uuid: '125e6bcd-2474-49f9-a1db-b3ca6f9d0196',
    type: 'loanRequestStatusUpdated',
    client: 'test082003',
    description: '描述message',
    spent: 895620,
    received: undefined,
    status: 'UnReconciled',
    read: false,
    date: '2024-11-22T14:20:10+13:00',
  },
]);
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
  background-color: rgba(234,197,57,.3);
  color: #bf9425;
}
</style>
