<template>
  <layout ref="layoutRef">
    <template #content>
      <div class="actions">
        <a-popconfirm :title="t('确定要删除勾选的数据吗？')" :cancel-text="t('取消')" :ok-text="t('确定')" @confirm="onRemove()" :disabled="!selectedRowKeys.length">
          <a-button :disabled="!selectedRowKeys.length">
            {{ t('删除重做') }}
          </a-button>
        </a-popconfirm>
        <span class="count">{{ t('选中{ 0 }条', [selectedRowKeys.length]) }}</span>
      </div>
      <a-spin :spinning="loading" size="large">
        <a-table :data-source="dataSource" :columns="columns" :pagination="false" :row-selection="{ selectedRowKeys: selectedRowKeys, ...rowSelection }" row-key="sn">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <div v-if="record.status == 2" class="status_tag">Reconciled</div>
              <div v-else class="status_tag unreconciled_tag">Unreconciled</div>
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
import { getTransactions, removeTransactions } from '@/api/reconciliations';

const { t } = useI18n();

const selectedRowKeys = ref([]); // 存放UUid
const selectedRows = ref([]); // 存放所有选中的选项的所有内容
const rowSelection = ref({
  checkStrictly: false,
  onSelect: (record, selected) => {
    if (selected) {
      selectedRowKeys.value.push(record.sn);
      selectedRows.value.push(record);
    } else {
      let index = selectedRowKeys.value.findIndex((it) => {
        return it === record.sn;
      });
      selectedRowKeys.value.splice(index, 1);
      selectedRows.value.splice(index, 1);
    }
  },
  onSelectAll: (selected, Rows, changeRows) => {
    const changeRowId = changeRows.map((it) => {
      return it.sn;
    });
    if (selected) {
      let newIds = Array.from(new Set(changeRowId.concat(selectedRowKeys.value)));
      let newRows = Array.from(new Set(changeRows.concat(selectedRows.value)));
      selectedRowKeys.value = newIds;
      selectedRows.value = newRows;
    } else {
      // 取消选中
      changeRowId.map((it) => {
        let index = selectedRowKeys.value.findIndex((item) => {
          return item == it;
        });
        if (index != -1) {
          selectedRowKeys.value.splice(index, 1);
          selectedRows.value.splice(index, 1);
        }
      });
    }
  },
  getCheckboxProps: (r) => ({
    disabled: Boolean(r.status == 2)
  })
});

const columns = reactive([
  {
    title: t('日期'),
    dataIndex: 'date',
    key: 'name',
    customRender: ({ text }) => {
      return tool.showDate(text);
    }
  },
  {
    title: t('账户名称'),
    dataIndex: 'account',
    key: 'account',
    width: '16%',
    customRender: ({ record }) => {
      return record.project?.project_name || '';
    }
  },
  {
    title: t('参考'),
    dataIndex: 'type',
    key: 'type',
    width: '12%'
  },
  {
    title: t('说明'),
    dataIndex: 'note',
    key: 'note',
    width: '20%'
  },
  {
    title: t('支出'),
    dataIndex: 'spent',
    key: 'spent',
    customRender: ({ record }) => {
      if (record.amount > 0) return tool.formatMoney(Math.abs(record.amount));
    }
  },
  {
    title: t('已收到'),
    dataIndex: 'received',
    key: 'received',
    customRender: ({ record }) => {
      if (record.amount < 0) return tool.formatMoney(Math.abs(record.amount));
    }
  },
  {
    title: t('状态'),
    dataIndex: 'status',
    key: 'status'
  }
]);

const onRemove = () => {
  if (!selectedRowKeys.value.length) return;
  loading.value = true;
  removeTransactions({ sn: selectedRowKeys.value.join() })
    .then((res) => {
      selectedRowKeys.value = [];
      selectedRows.value = [];
      pagination.value.page = 1;
      loadData();
    })
    .finally(() => {
      loading.value = false;
    });
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
  getTransactions(pagination.value)
    .then((res) => {
      total.value = res.count;
      dataSource.value = res.data;
      layoutRef.value.setNum(total.value);
    })
    .finally(() => {
      loading.value = false;
    });
};

onMounted(() => {
  loadData();
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
