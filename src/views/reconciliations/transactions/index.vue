<template>
  <layout>
    <template #content>
      <div class="actions">
        <a-button @click="onRemove" :disabled="!rowKeys.length || selectionStatus !== 'Reconciled'">
          {{ t('删除重做') }}
        </a-button>
        <span class="count">{{ t('选中{ 0 }条', [rowKeys.length]) }}</span>
      </div>
      <a-table
        :data-source="dataSource"
        :columns="columns"
        :pagination="pagination"
        :row-selection="rowSelection"
      >
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
import { getTransactions } from '@/api/reconciliations';

const { t } = useI18n();
const selectionStatus = ref('');
const rowKeys = ref([]);

const pagination = reactive({
  position: ['bottomCenter'],
  showSizeChanger: false,
  total: 0,
});

const rowSelection = ref({
  checkStrictly: false,
  onChange: (selectedRowKeys, rows) => {
    rowKeys.value = selectedRowKeys;
    selectionStatus.value = rows?.[0]?.status || ''
  },
  getCheckboxProps: (r) => ({
    disabled: !!selectionStatus.value && r.status !== selectionStatus.value,
  }),
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
    title: t('账户名称'),
    dataIndex: 'account',
    key: 'account',
    width: '16%',
  },
  {
    title: t('参考'),
    dataIndex: 'reference',
    key: 'reference',
    width: '12%',
  },
  {
    title: t('说明'),
    dataIndex: 'notes',
    key: 'notes',
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

const onRemove = () => {
  if (!rowKeys.value.length) return;
};

onMounted(() => {
  getTransactions().then((res) => {
    const { data, count } = res;
    if (count) {
      Object.assign(dataSource, data);
      pagination.total = count;
    }
  });
});
</script>

<style scoped lang="less">
.actions {
  padding-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 16px;

  color: #555;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;

  .count {
    padding-left: 20px;
  }
}

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
