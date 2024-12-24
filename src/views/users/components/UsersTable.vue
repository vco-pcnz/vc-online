<template>
  <div class="sys-table-content">
    <a-table :columns="columns" :data-source="tableData" :pagination="false" :scroll="{ x: '100%' }" row-key="uuid" :row-selection="{ selectedRowKeys: selectedRowKeys, onSelect: onSelect, onSelectAll: onSelectAll }" :customRow="rowClick">
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
          <p>
            <span>{{ t('注册于') }} {{ tool.showDate(record.create_time) }}</span>
          </p>
        </template>
        <template v-if="column.key === '4'">
          <p v-if="record.roles.length">{{ record.roles.join('/') }}</p>
          <p v-else>--</p>
        </template>
        <template v-if="column.key === '5'">
          <p class="black bold" v-if="record.org_stake_type">
            {{ record.org_stake_type }}
          </p>
          <p v-else>--</p>
          <p v-if="record.org_stake">
            <i class="iconfont" :class="{ cer: record.org_stake_ok }">&#xe679;</i>
            <span>
              {{ record.org_stake }}
            </span>
          </p>
          <p v-if="record.stake">
            <i class="iconfont" :class="{ cer: record.stake_ok }">&#xe742;</i>
            <span>
              {{ record.stake }}
            </span>
          </p>
        </template>
        <template v-if="column.key === '6'">
          <p>
            <i class="iconfont black">&#xe690;</i>
            <span class="cer bold"> {{ record.open_count }} {{ t('进行中项目') }} </span>
          </p>
          <p style="padding-left: 20px">
            <span class="bold"> {{ record.close_count }} {{ t('已关闭项目') }} </span>
          </p>
        </template>
        <template v-if="column.key === '7'">
          <p>
            <i class="iconfont black">&#xe751;</i>
            <span class="cer bold"> {{ record.apply_count }} {{ t('请求') }} </span>
          </p>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { navigationTo } from '@/utils/tool';

const emits = defineEmits(['update:data', 'update:keys', 'change']);

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
  { title: t('ID & 注册时间'), key: '3', width: 150, align: 'left' },
  { title: t('用户角色t'), key: '4', width: 200, align: 'center' },
  { title: t('组织信息'), key: '5', width: 250 },
  { title: t('项目数据'), key: '6', width: 200, align: 'left' },
  { title: t('请求数据'), key: '7', width: 150, align: 'center' }
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

const rowClick = (record, index) => {
  return {
    onClick: () => {
      navigationTo(`/users/detail?uuid=${record.uuid}`);
    }
  };
};
</script>

<style scoped lang="less">
:deep(.ant-table-tbody) .ant-table-row {
  cursor: pointer;
}
</style>
