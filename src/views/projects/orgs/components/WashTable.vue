<template>
  <div class="flex gap-5 items-center justify-end">
    <template v-if="hasPermission('projects:orgs:edit')">
      <a-popconfirm :title="t('确定通过审核吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" :disabled="Boolean(!selectedRowKeys.length)" @confirm="checkHandle(1)">
        <a-button type="dark" :disabled="Boolean(!selectedRowKeys.length)" shape="round" class="uppercase" :loading="loading && type === 1">
          {{ t('审核') }}
        </a-button>
      </a-popconfirm>

      <a-popconfirm :title="t('确定发送邮件吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" :disabled="Boolean(!selectedRowKeys.length)" @confirm="checkHandle(2)" :loading="loading && type === 2">
        <a-button type="dark" :disabled="Boolean(!selectedRowKeys.length)" shape="round" class="uppercase">
          {{ t('发送邮件') }}
        </a-button>
      </a-popconfirm>

      <a-popconfirm :title="t('确定发送短信吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" :disabled="Boolean(!selectedRowKeys.length)" @confirm="checkHandle(3)" :loading="loading && type === 3">
        <a-button type="dark" :disabled="Boolean(!selectedRowKeys.length)" shape="round" class="uppercase">
          {{ t('发送短信') }}
        </a-button>
      </a-popconfirm>

      <a-popconfirm :title="t('确定删除吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" :disabled="Boolean(!selectedRowKeys.length)" @confirm="checkHandle(4)" :loading="loading && type === 4">
        <a-button type="dark" :disabled="Boolean(!selectedRowKeys.length)" shape="round" class="uppercase">
          {{ t('删除') }}
        </a-button>
      </a-popconfirm>
    </template>

    <a-button v-if="hasPermission('projects:orgs:add')" type="primary" shape="round" class="uppercase" @click="showForm(null)">
      {{ t('添加') }}
    </a-button>
  </div>

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
              <span class="cer">{{ t('有条件') }}</span>
              <p class="color_grey ft_xs" v-if="record.condition_time">{{ tool.showDate(record.condition_time) }}</p>
            </template>
            <span v-if="record.status == 4" style="color: #0bda8e">{{ t('已完成') }}</span>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <div class="ops">
              <!-- <i class="iconfont" :title="t('有条件')" v-if="Boolean(record.status == 3)">&#xe73a;</i> -->
              <i class="iconfont" :title="t('项目文件')" v-if="Boolean(record.document && record.document.length)" @click="updateVisibleFiles(record)">&#xe690;</i>
              <i class="iconfont" :title="t('审核')" @click="checkOne(record.id)" v-if="record.status != 4 && record.status != 3 && record.document.length">&#xe647;</i>
              <template v-if="record.status != 4">
                <i class="iconfont" :title="t('编辑')" @click="showForm(record)">&#xe753;</i>
                <a-popconfirm :title="t('确定删除吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" @confirm="remove(record.id)">
                  <i class="iconfont" :title="t('删除l')">&#xe8c1;</i>
                </a-popconfirm>
              </template>
              <template v-else><i class="iconfont" :title="t('编辑')" @click="showDetail(record)">&#xe753;</i> </template>
            </div>
          </template>
        </template>
      </a-table>
      <div class="flex justify-center">
        <a-pagination size="small" :total="total" :pageSize="pagination.limit" :current="pagination.page" show-size-changer show-quick-jumper :show-total="(total) => t('共{0}条', [total])" @change="setPaginate" />
      </div>
    </div>
  </a-spin>
  <WashTableAddEdit v-model:visible="visible" :currentId="currentId" :infoData="editData" :isDetail="editData ? false : true" @update="loadData"></WashTableAddEdit>

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

  <WashDetail :edit="true" :uuid="currentId" v-model:visible="visibleDetail" :detailData="itemData" @update="update"></WashDetail>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool.js';
import { projectDetailGetWash, washCheck, sendEmail, sendSms, washRemove } from '@/api/project/wash';
import WashTableAddEdit from '@/views/process/temp/default/components/WashTableAddEdit.vue';
import { useRoute } from 'vue-router';
import { hasPermission } from '@/directives/permission/index';
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
  { title: t('名称'), dataIndex: 'name', width: 220, align: 'center', ellipsis: true },
  { title: t('类型'), dataIndex: 'cate', width: 220, align: 'center', ellipsis: true },
  { title: t('邮箱'), dataIndex: 'email', width: 220, align: 'left', ellipsis: true },
  { title: t('电话'), dataIndex: 'mobile', width: 220, ellipsis: true },
  { title: t('状态t'), dataIndex: 'status', width: 150, align: 'center' },
  {
    title: t('操作1'),
    dataIndex: 'operation',
    // fixed: 'right',
    align: 'right',
    width: 150
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
const type = ref();
const checkHandle = async (val) => {
  let ajaxFn = null;
  type.value = val;
  if (val === 1) {
    ajaxFn = washCheck;
  } else if (val === 2) {
    ajaxFn = sendEmail;
  } else if (val === 3) {
    ajaxFn = sendSms;
  } else if (val === 4) {
    ajaxFn = washRemove;
  }

  if (ajaxFn) {
    loading.value = true;
    await ajaxFn({ id: selectAll.value == 'all' ? 'all' : selectedRowKeys.value, uuid: currentId.value })
      .then(() => {
        loadData();
        loading.value = false;
        selectedRowKeys.value = [];
        selectedRows.value = [];
        return true;
      })
      .catch(() => {
        loading.value = false;
        return false;
      });
  }
};

const checkOne = (id) => {
  loading.value = true;
  washCheck({ id: [id], uuid: currentId.value })
    .then((res) => {
      loadData();
    })
    .finally((_) => {
      loading.value = false;
    });
};

const remove = (id) => {
  loading.value = true;
  washRemove({ id: [id], uuid: currentId.value })
    .then((res) => {
      loadData();
    })
    .finally((_) => {
      loading.value = false;
    });
};

const visible = ref(false);
const editData = ref(null);
const showForm = (val) => {
  visible.value = true;
  editData.value = val || null;
};

const visibleFiles = ref(false);
const itemData = ref();

const updateVisibleFiles = (val) => {
  itemData.value = val;
  visibleFiles.value = true;
};

const loadData = () => {
  loading.value = true;
  const ajaxFn = projectDetailGetWash;
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
