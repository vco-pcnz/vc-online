<template>
  <div>
    <div v-if="(isDetails && tableData.length) || !isDetails" class="block-item mb" :class="{ checked: washInfo.is_check && blockInfo.showCheck, details: isDetails }">
      <vco-process-title :title="t('新增反洗钱信息AML')">
        <template v-if="!isDetails">
          <div v-if="blockInfo.showEdit" class="flex gap-5 items-center">
            <a-popconfirm v-if="hasPermission('requests:aml:check')" :title="t('确定通过审核吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" :disabled="Boolean(!selectedRowKeys.length)" @confirm="checkHandle(1)">
              <a-button type="dark" :disabled="Boolean(!selectedRowKeys.length)" shape="round" class="uppercase" :loading="loading && type === 1">
                {{ t('审核') }}
              </a-button>
            </a-popconfirm>

            <a-popconfirm :title="t('确定发送邮件吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" :disabled="Boolean(!selectedRowKeys.length)" @confirm="checkHandle(2)">
              <a-button type="dark" :disabled="Boolean(!selectedRowKeys.length)" shape="round" class="uppercase" :loading="loading && type === 2">
                {{ t('发送邮件') }}
              </a-button>
            </a-popconfirm>

            <a-popconfirm :title="t('确定发送短信吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" :disabled="Boolean(!selectedRowKeys.length)" @confirm="checkHandle(3)">
              <a-button type="dark" :disabled="Boolean(!selectedRowKeys.length)" shape="round" class="uppercase" :loading="loading && type === 3">
                {{ t('发送短信') }}
              </a-button>
            </a-popconfirm>

            <a-popconfirm :title="t('确定删除吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" :disabled="Boolean(!selectedRowKeys.length)" @confirm="checkHandle(4)">
              <template #description>
                <a-checkbox v-model:checked="batchRemoveDoc">{{ t('删除文件夹中相关的文件') }}</a-checkbox>
              </template>
              <a-button type="dark" :disabled="Boolean(!selectedRowKeys.length)" shape="round" class="uppercase" :loading="loading && type === 4">
                {{ t('删除') }}
              </a-button>
            </a-popconfirm>

            <a-popconfirm :title="t('确定更新吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" @confirm="updateWash()">
              <a-button type="dark" shape="round" class="uppercase" :loading="updateWashLoading">
                {{ t('更新') }}
              </a-button>
            </a-popconfirm>

            <a-button type="primary" shape="round" class="uppercase" @click="showForm(null)">
              {{ t('添加') }}
            </a-button>

            <div class="target-content" @click="washTarget = !washTarget">
              <div class="icon" :title="washTarget ? t('收起') : t('展开')">
                <i v-if="washTarget" class="iconfont">&#xe711;</i>
                <i v-else class="iconfont">&#xe712;</i>
              </div>
            </div>
          </div>

          <!-- <a-popconfirm
            :title="t('确定通过审核吗？')"
            :ok-text="t('确定')"
            :cancel-text="t('取消')"
            @confirm="washCheckHandle"
          >
            <a-button type="dark" shape="round" class="uppercase">
              {{ t('审核') }}
            </a-button>
          </a-popconfirm> -->
        </template>
      </vco-process-title>

      <a-spin :spinning="loading">
        <div v-show="washTarget" class="sys-table-content border-top-none">
          <a-dropdown v-if="blockInfo.showEdit" class="selectAll" v-model:open="visibleSlect">
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
          <a-table :columns="columns" :data-source="tableData" :pagination="false" :scroll="{ x: '100%' }" row-key="id" :row-selection="!blockInfo.showEdit ? null : { selectedRowKeys: selectedRowKeys, onSelect: onSelect, hideSelectAll: true }">
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'name'">
                <span v-if="record.annex_id && record.document && record.document.length" class="cursor-pointer" @click="navigationTo('/requests/details/documents?uuid=' + currentId + '&annex_id=' + record?.annex_id)">
                  {{ record.name }}
                </span>
                <span v-else>{{ record.name }}</span>
              </template>
              <template v-if="column.dataIndex === 'cate'">
                <span class="cer" v-if="record.cate == 1">{{ t('借款人') }}</span>
                <span class="cer" v-if="record.cate == 2">{{ t('担保人') }}</span>
                <span class="cer" v-if="record.cate == 3">{{ t('受益人') }}</span>
                <span class="cer" v-if="record.cate == 4">{{ t('受托人') }}</span>
                <span class="cer" v-if="record.cate == 9">{{ t('其他') }}</span>
              </template>
              <template v-if="column.dataIndex === 'mobile'">
                {{ record.pre && record.mobile ? '+' + record.pre + ' ' + record.mobile : record.mobile }}
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
                  <!-- <i class="iconfont" :title="t('有条件')" v-if="Boolean(record.status == 3)">&#xe73a;</i> -->
                  <i class="iconfont" :title="t('项目文件')" v-if="Boolean(record.document && record.document.length)" @click="updateVisibleFiles(record)">&#xe690;</i>
                  <template v-if="blockInfo.showEdit">
                    <i class="iconfont" :title="t('审核')" @click="checkOne(record.id)" v-if="record.status != 4 && record.status != 3 && record.document && record.document.length && hasPermission('requests:aml:check')"> &#xe647; </i>
                    <div v-if="record.status == 4 && hasPermission('requests:aml:check')" class="relative">
                      <i class="iconfont" :title="t('取消审核')" @click="cancelCheckOne(record.id)"> &#xe9a2; </i>
                      <!-- <div class="close_line"></div> -->
                    </div>

                    <i class="iconfont" :title="t('编辑')" @click="showForm(record)">&#xe753;</i>
                    <a-popconfirm :title="t('确定删除吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" @confirm="remove(record)">
                      <template #description>
                        <a-checkbox v-model:checked="record.removeDoc">{{ t('删除文件夹中相关的文件') }}</a-checkbox>
                      </template>
                      <i class="iconfont" :title="t('删除l')">&#xe8c1;</i>
                    </a-popconfirm>
                  </template>
                </div>
              </template>
            </template>
          </a-table>
          <div class="flex justify-end">
            <a-pagination size="small" :total="total" :pageSize="pagination.limit" :current="pagination.page" show-size-changer show-quick-jumper :show-total="(total) => t('共{0}条', [total])" @change="setPaginate" />
          </div>
        </div>
      </a-spin>
      <WashTableAddEdit v-model:visible="visible" :currentId="currentId" :infoData="editData" @update="loadData"></WashTableAddEdit>

      <a-modal :open="visibleFiles" :title="t('详情')" :width="640" :footer="null" :keyboard="false" :maskClosable="false" @update:open="visibleFiles = false">
        <p class="fs_xs color_grey">{{ t('项目文件') }}</p>
        <div style="max-height: 400px; overflow-y: auto; padding-right: 10px">
          <div class="documents" v-for="(item, index) in itemData.document" :key="index">
            <vco-file-item :file="item" :showValidity="true" :time="itemData.expire_time ? itemData.expire_time[index] : ''"></vco-file-item>
          </div>
        </div>
        <template v-if="itemData.remark">
          <p class="fs_xs color_grey">{{ t('反洗钱说明') }}</p>
          <div class="remark bold" style="max-height: 200px; overflow-y: auto">
            {{ itemData.remark }}
          </div>
        </template>
      </a-modal>

      <!-- 有条件通过 -->

      <div v-if="blockInfo.showCheck" class="check-content">
        <i class="iconfont">&#xe647;</i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool.js';
import { navigationTo } from '@/utils/tool';
import { auditLmCheckStatus } from '@/api/process';
import { getWash, projectDetailGetWash, washCheck, sendEmail, sendSms, washRemove, washUpdate, cancelCheck } from '@/api/project/wash';
import WashTableAddEdit from './WashTableAddEdit.vue';
import { hasPermission } from '@/directives/permission/index';
import emitter from '@/event';

const emits = defineEmits(['check', 'refresh']);

const props = defineProps({
  currentId: {
    type: [Number, String],
    required: true
  },
  washInfo: {
    type: Object,
    default: () => {}
  },
  blockInfo: {
    type: Object,
    default: () => {}
  },
  currentStep: {
    type: Object
  },
  isDetails: {
    type: Boolean,
    default: false
  },
  target: {
    type: String
  }
});
const { t } = useI18n();

const total = ref(0);
const pagination = ref({
  page: 1,
  limit: 10
});

const visibleSlect = ref(false);
const selectAll = ref('');

const columns = reactive([
  { title: t('名称'), dataIndex: 'name', width: 120, align: 'center', ellipsis: true },
  { title: t('类型'), dataIndex: 'cate', width: 100, align: 'center', ellipsis: true },
  { title: t('邮箱'), dataIndex: 'email', width: 120, align: 'left', ellipsis: true },
  { title: t('电话'), dataIndex: 'mobile', width: 120, align: 'center', ellipsis: true },
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

const batchRemoveDoc = ref(true);
const loading = ref(false);
const type = ref();
const checkHandle = async (val) => {
  let ajaxFn = null;
  type.value = val;
  const params = {
    id: selectAll.value == 'all' ? 'all' : selectedRowKeys.value,
    uuid: props.currentId
  };
  if (val === 1) {
    ajaxFn = washCheck;
  } else if (val === 2) {
    ajaxFn = sendEmail;
  } else if (val === 3) {
    ajaxFn = sendSms;
  } else if (val === 4) {
    ajaxFn = washRemove;
    params.del_file = batchRemoveDoc.value ? 1 : 0;
  }

  if (ajaxFn) {
    loading.value = true;
    await ajaxFn(params)
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
  washCheck({ id: [id], uuid: props.currentId })
    .then((res) => {
      loadData();
    })
    .finally((_) => {
      loading.value = false;
    });
};

const cancelCheckOne = (id) => {
  loading.value = true;
  cancelCheck({ id: [id], uuid: props.currentId })
    .then((res) => {
      loadData();
    })
    .finally((_) => {
      loading.value = false;
    });
};

const remove = (data) => {
  loading.value = true;
  const del_file = data.removeDoc ? 1 : 0;
  washRemove({ id: [data.id], uuid: props.currentId, del_file })
    .then((res) => {
      loadData();
    })
    .finally((_) => {
      loading.value = false;
    });
};

const washCheckHandle = async () => {
  const params = {
    lm_check_status: props.washInfo.check_status,
    uuid: props.currentId
  };

  await auditLmCheckStatus(params)
    .then(() => {
      emits('refresh');
      return true;
    })
    .catch(() => {
      return false;
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
  const ajaxFn = props.isDetails || props.target === 'about' ? projectDetailGetWash : getWash;

  ajaxFn({ uuid: props.currentId, ...pagination.value })
    .then((res) => {
      const data = res.data || [];
      data.forEach((item) => {
        item.removeDoc = true;
      });
      tableData.value = data;
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

const washTarget = ref(true);

const blockShowTargetHandle = (flag) => {
  washTarget.value = flag;
};

const updateWashLoading = ref(false);
const updateWash = () => {
  updateWashLoading.value = true;
  washUpdate({ uuid: props.currentId })
    .then((res) => {
      loadData();
    })
    .finally((_) => {
      updateWashLoading.value = false;
    });
};

onMounted(() => {
  loadData();

  emitter.on('blockShowTarget', blockShowTargetHandle);
});

onUnmounted(() => {
  emitter.off('blockShowTarget', blockShowTargetHandle);
});

defineExpose({
  tableData
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

.close_line {
  width: 8px;
  border-top: 1.5px solid #f19915;
  position: absolute;
  top: 10px;
  right: 4.5px;
  rotate: 45deg;
}
</style>
