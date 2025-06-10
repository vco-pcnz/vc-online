<template>
  <a-spin :spinning="loading">
    <div class="sys-table-content border-top-none">
      <a-dropdown class="selectAll" v-model:open="visibleSlect">
        <a class="ant-dropdown-link" @click.prevent>
          <span class="uppercase bold fs_xs">{{ t('选择') }}</span>
          <i :class="['iconfont', { open: visibleSlect }]">&#xe778;</i>
        </a>
        <template #overlay>
          <a-menu :selectedKeys="[selectAll]">
            <a-menu-item key="all" :class="{ active: selectAll === 'all' }" @click="onSelectAll('all')">
              {{ t('选中所有') }}
            </a-menu-item>
            <a-menu-item key="page" :class="{ active: selectAll === 'page' }" @click="onSelectAll('page')">
              {{ t('选中本页') }}
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
      <a-table :columns="columns" :data-source="tableData" :pagination="false" :scroll="{ x: '100%' }" row-key="id" :row-selection="{ selectedRowKeys: selectedRowKeys, onSelect: onSelect, hideSelectAll: true }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'name'">
            {{ record.data.name }}
          </template>
          <template v-if="column.dataIndex === 'cate'">
            <span class="cer" v-if="record.cate == 1">{{ t('借款人') }}</span>
            <span class="cer" v-if="record.cate == 2">{{ t('担保人') }}</span>
            <span class="cer" v-if="record.cate == 3">{{ t('受益人') }}</span>
            <span class="cer" v-if="record.cate == 4">{{ t('受托人') }}</span>
            <span class="cer" v-if="record.cate == 9">{{ t('其他') }}</span>
          </template>
          <template v-if="column.dataIndex === 'email'">
            {{ record.data.email }}
          </template>
          <template v-if="column.dataIndex === 'mobile'">
            <template v-if="record.data.pre && record.data.mobile"> +{{ record.data.pre + ' ' + record.data.mobile }} </template>
            <template v-else-if="record.data.mobile">
              {{ record.data.mobile }}
            </template>
            <template v-else> -- </template>
          </template>
          <template v-if="column.dataIndex === 'decline_reason'">
            {{ record.decline_reason || '--' }}
          </template>
          <template v-if="column.dataIndex === 'status_name'">
            <p :style="{ color: colors[record.status_name] }">{{ record.status_name || '--' }}</p>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <a-button v-if="record.has_permission" type="primary" size="small" shape="round" class="uppercase" @click="openDetail(record)">{{ t('审核') }}</a-button>
            <a-button v-else type="brown" size="small" shape="round" class="uppercase" @click="openDetail(record)">{{ t('详情') }}</a-button>
          </template>
        </template>
      </a-table>
      <div class="flex justify-center">
        <a-pagination size="small" :total="total" :pageSize="pagination.limit" :current="pagination.page" show-size-changer show-quick-jumper :show-total="(total) => t('共{0}条', [total])" @change="setPaginate" />
      </div>
    </div>
  </a-spin>

  <a-modal :open="visibleFiles" :title="t('详情')" :width="640" :footer="null" :keyboard="false" :maskClosable="false" @update:open="visibleFiles = false">
    <p class="fs_xs color_grey">{{ t('项目文件') }}</p>
    <div style="max-height: 400px; overflow-y: auto; padding-right: 10px">
      <div class="documents" v-for="(item, index) in itemData.document" :key="index">
        <vco-file-item :file="item" :showValidity="true" :time="itemData.expire_time[index]"></vco-file-item>
      </div>
    </div>
    <template v-if="itemData.remark">
      <p class="fs_xs color_grey">{{ t('反洗钱说明') }}</p>
      <div class="remark bold" style="max-height: 200px; overflow-y: auto">
        {{ itemData.remark }}
      </div>
    </template>
  </a-modal>
  <WashDetail v-model:visible="visibleDetail" :uuid="currentId" :detailData="itemData?.data" :process="itemData" @update="loadData"></WashDetail>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool.js';
import { useRoute } from 'vue-router';
import { hasPermission } from '@/directives/permission/index';
import Decline from './Decline.vue';
import WashDetail from './WashDetail.vue';
import { applyWash } from '@/api/project/wash';

const route = useRoute();

const emits = defineEmits(['check', 'refresh']);

const { t } = useI18n();

const total = ref(0);
const pagination = ref({
  page: 1,
  limit: 10
});
const currentId = ref('');
const visibleSlect = ref(false);
const selectAll = ref('');

const columns = reactive([
  { title: t('名称'), dataIndex: 'name', width: 120, align: 'center', ellipsis: true },
  { title: t('类型'), dataIndex: 'cate', width: 200, align: 'center', ellipsis: true },
  { title: t('邮箱'), dataIndex: 'email', width: 200, align: 'left', ellipsis: true },
  { title: t('状态'), dataIndex: 'status_name', width: 200, ellipsis: true },
  { title: t('电话'), dataIndex: 'mobile', width: 200, ellipsis: true },
  { title: t('拒绝原因'), dataIndex: 'decline_reason', ellipsis: true },
  {
    title: t('操作1'),
    dataIndex: 'operation',
    // fixed: 'right',
    align: 'center',
    width: 110
  }
]);

const tableData = ref([]);
const selectedRowKeys = ref([]); // 存放UUid
const selectedRows = ref([]); // 存放所有选中的选项的所有内容
const onSelect = (record, selected) => {
  if (selected) {
    selectedRowKeys.value.push(record.id);
    selectedRows.value.push(record);
  } else {
    let index = selectedRowKeys.value.findIndex((it) => {
      return it === record.id;
    });
    selectedRowKeys.value.splice(index, 1);
    selectedRows.value.splice(index, 1);
  }
  selectAll.value = '';
};
const onSelectAll = (type) => {
  selectedRowKeys.value = [];
  selectedRows.value = [];
  let selected = selectAll.value !== type;
  selectAll.value = selectAll.value !== type ? type : '';
  const changeRowId = tableData.value.map((it) => {
    return it.id;
  });
  if (selected) {
    let newIds = Array.from(new Set(changeRowId.concat(selectedRowKeys.value)));
    let newRows = Array.from(new Set(tableData.value.concat(selectedRows.value)));
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
};
const colors = ref({
  'FC REVIEW': '#d3a631',
  'FC PENDING REVIEW': '#d3a631',
  'DECLINED DISCHARGE': 'rgb(195 195 195)',
  'DISCHARGE CONFIRM': 'rgb(11, 218, 142)'
});

const loading = ref(false);
const visibleFiles = ref(false);
const itemData = ref();

const loadData = () => {
  loading.value = true;
  const ajaxFn = applyWash;
  //: getWash

  ajaxFn({ uuid: currentId.value, ...pagination.value })
    .then((res) => {
      tableData.value = res.data;
      total.value = res.count;
      if (selectAll.value == 'all') {
        selectAll.value = '';
        onSelectAll('all');
      } else {
        selectAll.value = '';
        onSelectAll('');
      }
    })
    .finally((_) => {
      loading.value = false;
    });
};

const setPaginate = (page, limit) => {
  pagination.value = {
    page,
    limit
  };
  loadData();
};

const visibleDecline = ref(false);
const decline = (item) => {
  itemData.value = item;
  visibleDecline.value = true;
};

const visibleDetail = ref(false);
const openDetail = (item) => {
  itemData.value = item;
  visibleDetail.value = true;
};

onMounted(() => {
  currentId.value = route.query.uuid;
  loadData();
});
</script>

<style lang="less" scoped>
@import '@/views/process/temp/default/styles/common.less';
@import '@/styles/variables.less';
.ops {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  .iconfont {
    cursor: pointer;
    color: @colorPrimary!important;
  }
}
:deep(.ant-table-tbody) {
  & > tr td {
    color: #181818;
  }
}
.selectAll {
  position: absolute;
  left: 12px;
  top: 14px;
  cursor: pointer;
  z-index: 2;
  color: #181818;
  .iconfont {
    font-size: 5px;
    position: relative;
    top: -2px;
    left: 3px;
    display: inline-block;
  }
  .open {
    transform: rotate(180deg);
  }
}
.remark {
  padding: 10px;
  background: #f7f9f8;
  border-radius: 8px;
  margin-top: 10px;
  margin-bottom: 20px;
  font-size: 13px;
}
</style>
