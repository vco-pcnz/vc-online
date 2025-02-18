<template>
  <div class="sys-table-content">
    <a-table :columns="columns" :data-source="tableData" :pagination="false" :scroll="{ x: '100%' }" row-key="uuid" :row-selection="{ selectedRowKeys: selectedRowKeys, onSelect: onSelect, onSelectAll: onSelectAll }">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === '1'">
          <div class="avatarBox cursor">
            <vco-avatar :src="record.avatar" :radius="true"></vco-avatar>
          </div>
        </template>
        <template v-if="column.key === '2'">
          <p>
            <span class="black bold">
              {{ record.user_name }}
            </span>
          </p>
          <p>
            <i class="iconfont" :class="{ cer: record.email_ok }">&#xe66f;</i>
            <span>
              {{ record.email }}
            </span>
          </p>
          <p>
            <i class="iconfont" :class="{ cer: record.mobile_ok }">&#xe678;</i>
            <span>+{{ record.pre }} {{ record.mobile }}</span>
          </p>
        </template>
        <template v-if="column.key === '3'">
          <p class="black bold">ID: {{ record.username }}</p>
        </template>
        <template v-if="column.key === '4'">
          <p v-if="record.roles.length">{{ record.roles.join('/') }}</p>
          <p v-else>--</p>
        </template>
        <template v-else-if="column.key === 'type'">
          <span class="type_text orange" v-if="record.type">{{ t('公司') }}</span>
          <span class="type_text green" v-else>{{ t('个人') }}</span>
        </template>
        <template v-else-if="column.key === 'operation'">
          <div class="flex justify-center">
            <template v-if="!record.parent_sta">
              <a-popconfirm :title="t('确定要同意吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" @confirm="agree(record.uuid)">
                <span style="text-transform: lowercase">
                  <a-button type="cyan" shape="round" size="small"> {{ t('同意') }}</a-button>
                </span>
              </a-popconfirm>
            </template>
            <template v-if="record.parent_sta">
              <a-popconfirm :title="t('确定要移除吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" @confirm="remove(record.uuid)">
                <span style="text-transform: lowercase">
                  <a-button class="ml-3" type="danger" shape="round" size="small"> {{ t('移除') }}</a-button>
                </span>
              </a-popconfirm>
            </template>
            <template v-else>
              <a-popconfirm :title="t('确定要拒绝吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" @confirm="remove(record.uuid)">
                <span style="text-transform: lowercase">
                  <a-button class="ml-3" type="danger" shape="round" size="small"> {{ t('拒绝') }}</a-button>
                </span>
              </a-popconfirm>
            </template>
          </div>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { relationAgree, relationDel } from '@/api/users';

const emits = defineEmits(['update:data', 'update:keys', 'change', 'loadData']);

const props = defineProps({
  tableData: {
    type: Array,
    default: () => []
  }
});
const { t } = useI18n();

const columns = reactive([
  { title: t('头像'), key: '1', width: 110, align: 'center' },
  { title: t('基础信息'), key: '2', align: 'left' },
  { title: t('ID'), key: '3', width: 100, align: 'left' },
  { title: t('用户角色t'), key: '4', width: 100, align: 'center' },
  { title: t('类型'), key: 'type', width: 100, align: 'center' },
  {
    title: t('操作1'),
    key: 'operation',
    align: 'center',
    width: 150
  }
]);

const selectedRowKeys = ref([]); // 存放UUid
const selectedRows = ref([]); // 存放所有选中的选项的所有内容
const onSelect = (record, selected) => {
  if (selected) {
    selectedRowKeys.value.push(record.uuid);
    selectedRows.value.push(record);
  } else {
    let index = selectedRowKeys.value.findIndex((it) => {
      return it === record.uuid;
    });
    selectedRowKeys.value.splice(index, 1);
    selectedRows.value.splice(index, 1);
  }
  handlePathChange();
};
const onSelectAll = (selected, Rows, changeRows) => {
  const changeRowId = changeRows.map((it) => {
    return it.uuid;
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
  handlePathChange();
};

const handlePathChange = () => {
  emits('update:data', selectedRows.value);
  emits('update:keys', selectedRowKeys.value);
  emits('change');
};

// 同意
const agree = (uuids) => {
  relationAgree({ uuids: [uuids] }).then((r) => {
    emits('loadData');
  });
};

// 拒绝
const remove = (uuids) => {
  relationDel({ uuids: [uuids], type: 1 }).then((r) => {
    emits('loadData');
  });
};

const resetSelect = ()=>{
  selectedRows.value = []
  selectedRowKeys.value = []
  handlePathChange()
}


// 暴露方法给父组件
defineExpose({
  resetSelect
});
</script>

<style scoped lang="less">
:deep(.ant-table-tbody) .ant-table-row {
  cursor: pointer;
}

.type_text {
  font-size: 14px;
  &.orange {
    color: #d46b08;
  }
  &.green {
    color: #389e0d;
  }

  &.cre {
    color: #f19915;
  }
}
</style>
