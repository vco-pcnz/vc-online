<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="modeRef" class="myMode">
    <a-modal :width="800" :open="visible" :title="t('合并账单')" :getContainer="() => $refs.modeRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content">
        <a-table :columns="columns" :data-source="list" :pagination="false" :scroll="{ x: '100%' }" :row-selection="{ selectedRowKeys: selectedRowKeys, ...rowSelection }" row-key="bank_sn">
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'project_name'">
              {{ record.project.project_name }}
            </template>
            <template v-if="column.dataIndex === 'date'">
              <p class="xs_text">{{ tool.showDate(record.date) }}</p>
            </template>
          </template>
        </a-table>
        <div class="flex justify-center pb-5">
          <a-pagination size="small" :total="total" :pageSize="pagination.limit" :current="pagination.page" show-quick-jumper :show-total="(total) => t('共{0}条', [total])" @change="setPaginate" />
        </div>
        <!-- <div class="flex mt-2 justify-end">
          <div class="flex items-center"><span class="mr-2 color_grey">total:</span><vco-number :value="item?.amount" prefix=" " :precision="2" size="fs_xl" :bold="true" :end="true"></vco-number></div>
          <div class="flex items-center ml-5">
            <template v-if="distributableAmount < 0">
              <span class="mr-2 color_red-error">available:</span>:
              <vco-number :value="distributableAmount" :precision="2" size="fs_xl" color="#c1430c" :bold="true" :end="true"></vco-number>
            </template>
            <template v-else>
              <span class="mr-2 color_grey">available:</span>:
              <vco-number :value="distributableAmount" :precision="2" size="fs_xl" :bold="true" :end="true"></vco-number>
            </template>
          </div>
        </div> -->

        <div class="flex justify-center">
          <a-button @click="save" type="dark" class="save big uppercase" :disabled="!selectedRowKeys.length" :loading="loading">
            {{ t('保存') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import tool from '@/utils/tool';
import { mergeBill } from '@/api/reconciliations';
import { reconciliationList } from '@/api/reconciliations';

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  item: {
    type: Object
  }
});

const visible = ref(false);
const loading = ref(false);

const columns = reactive([
  { title: t('名称'), dataIndex: 'project_name', width: 180, align: 'left', ellipsis: true },
  { title: t('类型'), dataIndex: 'type', width: 120, align: 'center', ellipsis: true },
  { title: t('备注'), dataIndex: 'description', align: 'left', ellipsis: true },
  { title: t('日期'), dataIndex: 'date', width: 120, align: 'center', ellipsis: true }
]);

const save = () => {
  loading.value = true;
  let params = {
    ...formState.value,
    type: props.item?.type,
    client_uuid: props.item?.client_uuid,
    bank_sn: selectedRowKeys.join()
  };
  console.log(params);
  return;
  mergeBill(params)
    .then((res) => {
      message.success(t('保存成功'));
      emits('update');
      updateVisible(false);
    })
    .finally((_) => {
      loading.value = false;
    });
};

const total = ref(0);
const list = ref([]);
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
const loadData = () => {
  reconciliationList().then((res) => {
    total.value = res.count;
    res.data.map((item) => {
      delete item.children;
    });
    list.value = res.data;
    console.log(list.value)
  });
};

const updateVisible = (value) => {
  visible.value = value;
};
const init = () => {
  loadData();
  visible.value = true;
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.myMode {
  :deep(.ant-modal-content) {
    .ant-modal-header {
      padding: 72px 84px 0px;
      border-radius: 24px;
      .ant-modal-title {
        font-size: 20px;
        font-weight: 500;
      }
    }
    .ant-input-number {
      border-color: #d9d9d9;
      &.err {
        border-color: #c1430c;
      }
    }
    padding: 0px !important;

    .content {
      line-height: 1.33;
      padding: 24px 84px 72px;
      .user-item {
        padding: 8px 10px;
        border-radius: 8px;
        margin-top: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .name {
          flex: 1;
          font-weight: bold;
        }
      }
      .label {
        color: #888;
        font-size: 12px;
        padding: 0 0 8px;
        &.err {
          color: #c1430c;
        }
      }

      .save {
        width: 100%;
        margin-top: 24px;
      }
    }
  }

  .input-item {
    margin-top: 20px;
  }

  .iconfont.disabled {
    color: #888;
    cursor: not-allowed !important;
  }
}
</style>
