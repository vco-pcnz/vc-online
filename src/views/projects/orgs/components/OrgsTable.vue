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
            {{ record.name }}
          </template>
          <template v-if="column.dataIndex === 'cate'">
            <span class="cer" v-if="record.cate == 1">{{ t('借款人') }}</span>
            <span class="cer" v-if="record.cate == 2">{{ t('担保人') }}</span>
            <span class="cer" v-if="record.cate == 3">{{ t('投资人') }}</span>
          </template>
          <template v-if="column.dataIndex === 'mobile'">
            <template v-if="record.pre && record.mobile"> +{{ record.pre + ' ' + record.mobile }} </template>
            <template v-else-if="record.mobile">
              {{ record.mobile }}
            </template>
            <template v-else> -- </template>
          </template>
          <template v-if="column.dataIndex === 'status'">
            <span v-if="record.status == 0" class="cer">{{ t('待通知') }}</span>
            <span v-if="record.status == 1" class="cer">{{ t('待反馈') }}</span>
            <span v-if="record.status == 2" class="cer">{{ t('已反馈') }}</span>
            <template v-if="record.status == 3">
              <span v-if="record.status == 3" class="cer">{{ t('有条件') }}</span>
              <p class="color_grey ft_xs" v-if="record.condition_time">{{ tool.showDate(record.condition_time) }}</p>
            </template>
            <span v-if="record.status == 4" style="color: #0bda8e">{{ t('已完成') }}</span>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <div class="ops">
              <a-button type="brown" size="small" shape="round" class="uppercase" @click="showDetail(record)">{{ t('详情') }}</a-button>
            </div>
          </template>
        </template>
      </a-table>
      <div class="flex justify-center">
        <a-pagination size="small" :total="total" :pageSize="pagination.limit" :current="pagination.page" show-size-changer show-quick-jumper :show-total="(total) => t('共{0}条', [total])" @change="setPaginate" />
      </div>
    </div>
  </a-spin>
  <WashDetail v-model:visible="visibleDetail" :detailData="itemData"></WashDetail>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool.js';
import { projectDetailGetWash } from '@/api/project/wash';
import { useRoute } from 'vue-router';
import WashDetail from './WashDetail.vue';

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
  { title: t('类型'), dataIndex: 'cate', width: 100, align: 'center', ellipsis: true },
  { title: t('邮箱'), dataIndex: 'email', width: 120, align: 'left', ellipsis: true },
  { title: t('电话'), dataIndex: 'mobile', width: 120, ellipsis: true },
  {
    title: t('详情'),
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

const loading = ref(false);
const loadData = () => {
  loading.value = true;

  projectDetailGetWash({ uuid: currentId.value, ...pagination.value, sta: 1 })
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

const itemData = ref();
const visibleDetail = ref(false);
const showDetail = (item) => {
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
  justify-content: center;
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
