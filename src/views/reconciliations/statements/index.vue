<template>
  <layout ref="layoutRef" @update="reload">
    <template #content>
      <div class="flex justify-between items-end mb-5 pb-5" style="border-bottom: 1px solid #a6a9b0">
        <div class="actions" v-if="hasPermission('reconciliations:statements:edit')">
          <a-popconfirm v-if="searchParams.status != '-1'" :title="t('确定要删除勾选的数据吗？')" :cancel-text="t('取消')" :ok-text="t('确定')" @confirm="onRemove()" :disabled="!selectedRowKeys.length">
            <a-button :disabled="!selectedRowKeys.length">
              {{ t('删除重做') }}
            </a-button>
          </a-popconfirm>

          <a-popconfirm v-if="searchParams.status == '-1'" :title="t('确定要恢复勾选的数据吗？')" :cancel-text="t('取消')" :ok-text="t('确定')" @confirm="restore()" :disabled="!selectedRowKeys.length">
            <a-button :disabled="!selectedRowKeys.length">
              {{ t('恢复') }}
            </a-button>
          </a-popconfirm>

          <span class="count">{{ t('选中{ 0 }条', [selectedRowKeys.length]) }}</span>
        </div>
        <TableSearch @search="search"></TableSearch>
      </div>
      <a-spin :spinning="loading" size="large">
        <a-table :data-source="dataSource" :columns="columns" :pagination="false" :defaultExpandAllRows="true" :row-selection="{ selectedRowKeys: selectedRowKeys, ...rowSelection }" row-key="bank_sn">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <div v-if="record.status == 1" class="status_tag">Reconciled</div>
              <div v-else-if="record.status == 0" class="status_tag unreconciled_tag">Unreconciled</div>
              <div v-else class="status_tag unreconciled_tag">Cancelled</div>
            </template>

            <template v-if="column.key === 'operation'">
              <a-popconfirm :title="t('您确定要撤回该对账吗？')" :cancel-text="t('取消')" :ok-text="t('确定')" @confirm="revoke(record.bank_sn)" :disabled="!record.status || record.children" v-if="record.status != -1">
                <a-button type="danger" shap="round" :disabled="!record.status || record.children"> {{ t('撤回') }}</a-button>
              </a-popconfirm>
              <a-popconfirm :title="t('您确定要恢复该对账吗？')" :cancel-text="t('取消')" :ok-text="t('确定')" @confirm="restore(record.bank_sn)" v-else>
                <a-button type="danger" shap="round"> {{ t('恢复') }}</a-button>
              </a-popconfirm>
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
import { ref, reactive, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import layout from '../components/layout.vue';
import tool from '@/utils/tool.js';
import TableSearch from './TableSearch.vue';
import { cloneDeep } from 'lodash';
import { getStatements, revokeReconciliation, cancelReconciliation, recoverReconciliation } from '@/api/reconciliations';
import { hasPermission } from '@/directives/permission/index';

const { t } = useI18n();

const columns = reactive([
  {
    title: t('日期'),
    dataIndex: 'date',
    width: '180px',
    key: 'name',
    customRender: ({ text }) => {
      return tool.showDate(text);
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
    width: '180px'
  },
  {
    title: t('描述'),
    dataIndex: 'description',
    key: 'description',
    width: '180px'
  },
  {
    title: t('支出'),
    dataIndex: 'spent',
    key: 'spent',
    width: '150px',
    customRender: ({ record }) => {
      if (record.type == 'SPEND') return tool.formatMoney(Math.abs(record.amount));
    }
  },
  {
    title: t('已收到'),
    dataIndex: 'received',
    key: 'received',
    width: '150px',
    customRender: ({ record }) => {
      if (record.type == 'RECEIVE') return tool.formatMoney(Math.abs(record.amount));
    }
  },
  {
    title: t('状态'),
    dataIndex: 'status',
    key: 'status',
    width: '120px'
  }
]);

const dataSource = ref([]);
const layoutRef = ref();
const total = ref(0);
const loading = ref(false);

const searchParams = ref({
  type: '',
  name: '',
  status: ''
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
  getStatements({ ...pagination.value, ...searchParams.value })
    .then((res) => {
      total.value = res.count;
      res.data.map((item) => {
        if (!item.children.length) {
          delete item.children;
        }
      });
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

const search = (val) => {
  searchParams.value = cloneDeep(val);
  reload();
};

const selectedRowKeys = ref([]); // 存放UUid
const selectedRows = ref([]); // 存放所有选中的选项的所有内容
const rowSelection = ref({
  checkStrictly: false,
  onSelect: (record, selected) => {
    if (selected) {
      selectedRowKeys.value.push(record.bank_sn);
      selectedRows.value.push(record);
    } else {
      let index = selectedRowKeys.value.findIndex((it) => {
        return it === record.bank_sn;
      });
      selectedRowKeys.value.splice(index, 1);
      selectedRows.value.splice(index, 1);
    }
  },
  onSelectAll: (selected, Rows, changeRows) => {
    const changeRowId = changeRows.map((it) => {
      return it.bank_sn;
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
    disabled: (() => {
      if (r.status == 1 || r.parent_id) {
        return true;
      }
      if (r.children) {
        return Boolean(
          r.children.filter((item) => {
            return item.status;
          }).length
        );
      }
      return false;
    })()
  })
});

// 撤回对账
const revoke = (bank_sn) => {
  revokeReconciliation({ bank_sn }).then((res) => {
    loadData();
  });
};

// 取消对账
const onRemove = () => {
  cancelReconciliation({ bank_sn: selectedRowKeys.value.join() }).then((res) => {
    selectedRows.value = [];
    selectedRowKeys.value = [];
    loadData();
  });
};

// 恢复对账
const restore = (bank_sn) => {
  recoverReconciliation({ bank_sn: bank_sn ? bank_sn : selectedRowKeys.value.join() }).then((res) => {
    if (!bank_sn) {
      selectedRows.value = [];
      selectedRowKeys.value = [];
    }
    loadData();
  });
};

onMounted(() => {
  if (hasPermission('reconciliations:statements:edit')) {
    columns.push({
      title: t('操作'),
      dataIndex: 'operation',
      key: 'operation',
      align: 'center',
      width: '100px'
    });
  }
  loadData();
});

// watch(
//   () => searchParams.value.status,
//   (val) => {
//     reload();
//   },
//   {
//     immediate: true
//   }
// );
</script>

<style scoped lang="less">
.actions {
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

.page-search-content {
  margin-top: 0;
}

.status_tag {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #76a493;
}

.unreconciled_tag {
  color: #bf9425;
}

.revoke {
  cursor: pointer;
  font-size: 16px;
  color: #f24f4f;
}

.disabled {
  color: rgba(0, 0, 0, 0.2);
  cursor: not-allowed;
}

:deep(.ant-table-row-level-1) {
  background: #f7f3e6;
}
</style>
