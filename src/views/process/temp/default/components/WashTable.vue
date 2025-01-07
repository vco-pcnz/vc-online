<template>
  <vco-process-title :title="t('新增反洗钱信息AML')">
    <div class="flex gap-5" v-if="!hide">
      <a-popconfirm
        :title="t('确定通过审核吗？')"
        :ok-text="t('确定')"
        :cancel-text="t('取消')"
        :disabled="Boolean(!selectedRowKeys.length)"
        @confirm="checkHandle(1)"
      >
        <a-button type="dark" :disabled="Boolean(!selectedRowKeys.length)" shape="round" class="uppercase" :loading="loading && type === 1">
          {{ t('审核') }}
        </a-button>
      </a-popconfirm>
      <a-popconfirm
        :title="t('确定发送邮件吗？')"
        :ok-text="t('确定')"
        :cancel-text="t('取消')"
        :disabled="Boolean(!selectedRowKeys.length)"
        @confirm="checkHandle(2)"
        :loading="loading && type === 2"
      >
        <a-button type="dark" :disabled="Boolean(!selectedRowKeys.length)" shape="round" class="uppercase">
          {{ t('发送邮件') }}
        </a-button>
      </a-popconfirm>
      <a-popconfirm
        :title="t('确定发送短信吗？')"
        :ok-text="t('确定')"
        :cancel-text="t('取消')"
        :disabled="Boolean(!selectedRowKeys.length)"
        @confirm="checkHandle(3)"
        :loading="loading && type === 3"
      >
        <a-button type="dark" :disabled="Boolean(!selectedRowKeys.length)" shape="round" class="uppercase">
          {{ t('发送短信') }}
        </a-button>
      </a-popconfirm>

      <a-button type="primary" shape="round" class="uppercase" @click="showForm">
        {{ t('添加') }}
      </a-button>
    </div>
  </vco-process-title>
  <a-spin :spinning="loading">
    <div class="sys-table-content border-top-none">
      <a-table
        :columns="columns"
        :data-source="tableData"
        :pagination="false"
        :scroll="{ x: '100%' }"
        row-key="id"
        :row-selection="hide ? null : { selectedRowKeys: selectedRowKeys, onSelect: onSelect, onSelectAll: onSelectAll }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'name'">
            <span class="bold black">{{ record.name }}</span>
          </template>
          <template v-if="column.dataIndex === 'cate'">
            <span v-if="record.cate == 1">{{ t('借款人') }}</span>
            <span v-if="record.cate == 2">{{ t('担保人') }}</span>
            <span v-if="record.cate == 3">{{ t('投资人') }}</span>
          </template>
          <template v-if="column.dataIndex === 'status'">
            <span v-if="record.status == 0" class="cer">{{ t('待通知') }}</span>
            <span v-if="record.status == 1" class="cer">{{ t('待反馈') }}</span>
            <span v-if="record.status == 2" class="cer">{{ t('已反馈') }}</span>
            <span v-if="record.status == 3" class="cer">{{ t('已完成') }}</span>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <div class="ops">
              <i class="iconfont" style="color: #0bda8e !important" v-if="Boolean(record.status == 3)">&#xe786;</i>
              <i class="iconfont" v-if="Boolean(record.document && record.document.length)" @click="updateVisibleFiles(record.document)">&#xe795;</i>
              <template v-if="!hide">
                <i class="iconfont" @click="showForm(record)">&#xe753;</i>
                <a-popconfirm :title="t('确定删除吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" @confirm="remove(record.id)">
                  <i class="iconfont">&#xe8c1;</i>
                </a-popconfirm>
              </template>
            </div>
          </template>
        </template>
      </a-table>
      <div class="flex justify-end pt-5">
        <a-button type="brown" shape="round" class="uppercase ml-5" @click="toDocuments">
          {{ t('查看文件') }}
        </a-button>
      </div>
    </div>
  </a-spin>
  <WashTableAddEdit v-model:visible="visible" :currentId="currentId" :infoData="editData" @update="loadData"></WashTableAddEdit>

  <a-modal
    :open="visibleFiles"
    :title="t('文件')"
    :width="500"
    :footer="null"
    :keyboard="false"
    :maskClosable="false"
    @update:open="visibleFiles = false"
  >
    <div class="documents" v-for="(item, index) in documentList" :key="index">
      <vco-file-item :file="item"></vco-file-item>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getWash, washCheck, sendEmail, sendSms, washRemove, washAdd } from '@/api/project/wash';
import { navigationTo } from '@/utils/tool';
import WashTableAddEdit from './WashTableAddEdit.vue';

const emits = defineEmits(['check']);

const props = defineProps({
  currentId: {
    type: [Number, String],
    required: true
  },
  hide: {
    type: Boolean,
    default: false
  }
});
const { t } = useI18n();

const columns = reactive([
  { title: t('名称'), dataIndex: 'name', width: 150, align: 'center', ellipsis: true },
  { title: t('类型'), dataIndex: 'cate', width: 100, align: 'center', ellipsis: true },
  { title: t('邮箱'), dataIndex: 'email', width: 150, align: 'left', ellipsis: true },
  { title: t('电话'), dataIndex: 'mobile', width: 140, align: 'center', ellipsis: true },
  { title: t('状态t'), dataIndex: 'status', width: 150, align: 'center' },
  {
    title: t('操作1'),
    dataIndex: 'operation',
    // fixed: 'right',
    align: 'right',
    width: 150
  }
]);

const tableData = ref();

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
  // handlePathChange();
};
const onSelectAll = (selected, Rows, changeRows) => {
  const changeRowId = changeRows.map((it) => {
    return it.id;
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
  // handlePathChange();
};

const toDocuments = () => {
  navigationTo({ path: '/requests/documents', query: { uuid: props.currentId } });
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
  }
  if (ajaxFn) {
    loading.value = true;
    await ajaxFn({ id: selectedRowKeys.value })
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

const remove = (id) => {
  loading.value = true;
  washRemove({ id: [id] })
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
const documentList = ref([]);

const updateVisibleFiles = (val) => {
  documentList.value = val;
  visibleFiles.value = true;
};

const loadData = () => {
  getWash({ uuid: props.currentId }).then((res) => {
    tableData.value = res.data;
  });
};

onMounted(() => {
  loadData();
});
</script>

<style lang="less" scoped>
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
</style>
