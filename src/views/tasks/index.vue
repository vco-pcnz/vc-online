<template>
  <op-project ref="opProjectRef" @update="opUpdate"></op-project>
  <op-loan ref="opLoanRef" @update="opUpdate"></op-loan>
  <op-other ref="opOtherRef" @update="opUpdate"></op-other>
  <div>
    <layout :currentTotal="pageObj.total" :tableLoading="tableLoading" @search="reload"></layout>
    <div class="flex gap-3 mt-4 send-box" v-if="currentParams?.status === '10'">
      <a-popconfirm :title="t('确定发送通知吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" :disabled="Boolean(!selectedRowKeys.length)" @confirm="send('1')">
        <a-button type="cyan" :disabled="Boolean(!selectedRowKeys.length)" class="uppercase" :loading="loading && type === '1'">
          {{ t('发送通知') }}
        </a-button>
      </a-popconfirm>

      <a-popconfirm :title="t('确定发送邮件吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" :disabled="Boolean(!selectedRowKeys.length)" @confirm="send('3')">
        <a-button type="cyan" :disabled="Boolean(!selectedRowKeys.length)" class="uppercase" :loading="loading && type === '3'">
          {{ t('发送邮件') }}
        </a-button>
      </a-popconfirm>

      <a-popconfirm :title="t('确定发送短信吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" :disabled="Boolean(!selectedRowKeys.length)" @confirm="send('5')">
        <a-button type="cyan" :disabled="Boolean(!selectedRowKeys.length)" class="uppercase" :loading="loading && type === '5'">
          {{ t('发送短信') }}
        </a-button>
      </a-popconfirm>
    </div>
    <div class="mt-5 border-t">
      <a-spin :spinning="tableLoading" size="large">
        <div class="table-content sys-table-content no-top-line">
          <a-table
            ref="tableRef"
            :columns="columns"
            :data-source="tableDataRef"
            table-layout="fixed"
            :pagination="false"
            row-key="task_id"
            :rowClassName="setRowClass"
            :row-selection="currentParams?.status === '10' ? { selectedRowKeys: selectedRowKeys, ...rowSelection } : null"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'project_image'">
                <template v-if="record.imgsArr.length">
                  <div class="flex justify-center">
                    <vco-avatar :src="record.imgsArr[0]" :radius="true" :round="false"></vco-avatar>
                  </div>
                </template>
                <p v-else>--</p>
              </template>
              <template v-if="column.dataIndex === 'project_info'">
                <span v-if="record.module !== 'other'">
                  <div class="id-info">ID: {{ record.project_apply_sn }}</div>
                  <div :title="record.project_name">{{ record.project_name || t('项目名称') }}</div>
                  <div v-if="record.project_city && record.project_city.length > 3" class="icon-txt mt-1">
                    <i class="iconfont cer">&#xe814;</i>
                    <span :title="record.project_city" class="text-ellipsis overflow-hidden whitespace-normal line-clamp-2">{{ record.project_city }}</span>
                  </div>
                </span>
                <span v-else>
                  <div>{{ record.process_type }}</div>
                  <div class="icon-txt mt-1">
                    <i class="iconfont cer">&#xe632;</i>
                    <span style="display: block">{{ record.apply_user.user_name }}</span>
                  </div>
                </span>
              </template>
              <template v-if="column.dataIndex === 'module'">
                <p v-if="record.module" class="status-txt">{{ record.module }}</p>
                <p v-else>--</p>
              </template>
              <template v-if="column.dataIndex === 'borrower'">
                <template v-if="record.showName">
                  <div class="icon-txt">
                    <i class="iconfont" v-if="record.borrower_type == 1">&#xe632;</i>
                    <i class="iconfont" v-else>&#xe679;</i>
                    <span :title="record.project_city" class="text-ellipsis overflow-hidden whitespace-normal line-clamp-1">{{ record.showName }}</span>
                  </div>
                  <div class="icon-txt" v-if="record.borrower_email">
                    <i class="iconfont">&#xe66f;</i>
                    <span :title="record.borrower_email" class="text-ellipsis overflow-hidden whitespace-normal line-clamp-1">{{ record.borrower_email }}</span>
                  </div>
                  <div class="icon-txt" v-if="record.borrower_phone">
                    <i class="iconfont">&#xe678;</i>
                    <div class="inline-block" style="text-indent: 20px">
                      <span v-if="record.borrower_phone_prefix"> +{{ record.borrower_phone_prefix }}</span> {{ record.borrower_phone }}
                    </div>
                  </div>
                </template>

                <p v-else>--</p>
              </template>
              <template v-if="column.dataIndex === 'process_type'">
                <p v-if="typeData[record.process_type] || record.process_type" class="status-txt uppercaseFirst">{{ typeData[record.process_type] || record.process_type }}</p>
                <p v-else>--</p>
              </template>
              <template v-if="column.dataIndex === 'amount'">
                <vco-number v-if="record.amount" :value="record.amount" :precision="2" size="fs_md" :end="true"></vco-number>
                <p v-else>--</p>
              </template>
              <template v-if="column.dataIndex === 'note'">
                <span v-if="record.note">{{ record.note }}</span>
                <p v-else>--</p>
              </template>

              <template v-if="column.dataIndex === 'loan_money'">
                <span>
                  <vco-number v-if="record.loan_money" :value="record.loan_money" :precision="2"></vco-number>
                  <p v-else>--</p>
                </span>
              </template>
              <template v-if="column.dataIndex === 'status'">
                <p v-if="record.status_name" class="status-txt uppercase">{{ t(record.status_name) }}</p>
                <p v-else>--</p>
              </template>

              <template v-if="column.dataIndex === 'phone'">
                <div class="icon-txt" v-if="record.apply_user.mobile">
                  <i class="iconfont">&#xe678;</i>
                  <div class="inline-block" style="text-indent: 20px">
                    <span v-if="record.apply_user.pre"> +{{ record.apply_user.pre }}</span> {{ record.apply_user.mobile }}
                  </div>
                </div>
              </template>

              <template v-if="column.dataIndex === 'email'">
                <div class="icon-txt" v-if="record.apply_user.email">
                  <i class="iconfont">&#xe66f;</i>
                  <div class="inline-block" style="text-indent: 20px">
                    {{ record.apply_user.email }}
                  </div>
                </div>
              </template>

              <template v-if="column.dataIndex === 'start_date'">
                <span v-if="record.start_date">{{ tool.showDate(record.start_date) }}</span>
                <p v-else>--</p>
              </template>

              <template v-if="column.dataIndex === 'create_time'">
                <span v-if="record.create_time">{{ tool.showDate(record.create_time) }}</span>
                <p v-else>--</p>
              </template>
              <template v-if="column.dataIndex === 'operation'">
                <a-button type="primary" size="small" shape="round" class="uppercase" @click="todoHandle(record)">{{ t('点击处理') }}</a-button>
              </template>
            </template>
          </a-table>
        </div>
        <div v-if="tableData.length" class="mt-5">
          <a-pagination size="small" :total="pageObj.total" :current="pageObj.currentPage" :page-size="pageObj.pageSize" show-size-changer show-quick-jumper :show-total="(total) => t('共{0}条', [total])" @change="pageChange" />
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { useTableList } from '@/hooks/useTableList';
import { projectBacklogList, backlogNotify } from '@/api/tasks';
import { useUserStore } from '@/store';

import layout from './components/layout.vue';
import OpProject from './components/Operation/Project.vue';
import OpLoan from './components/Operation/Loan.vue';
import OpOther from './components/Operation/Other.vue';

const { t } = useI18n();

const { tableRef, pageObj, currentParams, tableLoading, pageChange, tableData, getTableData } = useTableList(projectBacklogList, { size: 10 }, false);

const typeData = reactive({
  drawdown: t('提款'),
  repayment: t('还款'),
  discharge: t('解押'),
  'penalty-start': t('罚息开始'),
  'penalty-end': t('罚息结束'),
  variation: t('变更1'),
  journal: t('平账'),
  closed: t('关账'),
  aml: t('反洗钱'),
  security: t('添加抵押物'),
  'closed-cancel': t('关账撤销')
});

const moduleData = reactive({
  project: t('项目信息'),
  request: t('借款'),
  other: t('其他')
});

const columns = computed(() => {
  let head = [];
  if (!currentParams.value?.module) {
    head = [
      { title: t('项目图片'), dataIndex: 'project_image', width: 80, align: 'center' },
      { title: t('信息'), dataIndex: 'project_info', width: 300, align: 'left' },
      { title: t('借款人'), dataIndex: 'borrower', width: 300, align: 'left' },
      { title: t('模块'), dataIndex: 'module', align: 'center' },
      { title: t('类型'), dataIndex: 'process_type', align: 'center' },
      { title: t('状态'), dataIndex: 'status', align: 'center' },
      { title: t('创建时间'), dataIndex: 'create_time', width: 140, align: 'center' },
      {
        title: t('操作1'),
        dataIndex: 'operation',
        fixed: 'right',
        align: 'center',
        width: 140
      }
    ];
  }
  if (currentParams.value?.module === 'loan') {
    head = [
      { title: t('项目图片'), dataIndex: 'project_image', width: 80, align: 'center' },
      { title: t('项目信息'), dataIndex: 'project_info', width: 300, align: 'left' },
      { title: t('借款人'), dataIndex: 'borrower', width: 300, align: 'left' },
      { title: t('类型'), dataIndex: 'process_type', align: 'center' },
      // { title: t('金额'), dataIndex: 'amount', width: 140, align: 'left' },
      // { title: t('说明'), dataIndex: 'note', align: 'left' },
      { title: t('开放日期'), dataIndex: 'start_date', width: 140, align: 'center' },
      { title: t('状态'), dataIndex: 'status', align: 'center' },
      { title: t('创建时间'), dataIndex: 'create_time', width: 140, align: 'center' },
      {
        title: t('操作1'),
        dataIndex: 'operation',
        fixed: 'right',
        align: 'center',
        width: 140
      }
    ];
  }
  if (currentParams.value?.module === 'request') {
    head = [
      { title: t('项目图片'), dataIndex: 'project_image', width: 80, align: 'center' },
      { title: t('项目信息'), dataIndex: 'project_info', width: 300, align: 'left' },
      { title: t('借款人'), dataIndex: 'borrower', width: 300, align: 'left' },
      { title: t('借款金额'), dataIndex: 'loan_money', width: 200, align: 'left' },
      { title: t('状态'), dataIndex: 'status', align: 'center' },
      { title: t('创建时间'), dataIndex: 'create_time', width: 140, align: 'center' },
      {
        title: t('操作1'),
        dataIndex: 'operation',
        fixed: 'right',
        align: 'center',
        width: 140
      }
    ];
  }
  if (currentParams.value?.module === 'other') {
    head = [
      { title: t('标题'), dataIndex: 'project_info', align: 'left' },
      // { title: t('说明'), dataIndex: 'note' },
      { title: t('电话'), dataIndex: 'phone', width: 300, align: 'left' },
      { title: t('邮箱'), dataIndex: 'email', width: 300, align: 'left' },
      { title: t('状态'), dataIndex: 'status', align: 'center' },
      { title: t('创建时间'), dataIndex: 'create_time', width: 140, align: 'center' },
      {
        title: t('操作1'),
        dataIndex: 'operation',
        fixed: 'right',
        align: 'center',
        width: 140
      }
    ];
  }
  if (currentParams.value && currentParams.value.status === '10') {
    head.pop();
  }
  return head;
});

const tableDataRef = computed(() => {
  const data = tableData.value;
  data.forEach((item) => {
    const images = item?.project_image || '';
    let imgsArr = [];
    if (images) {
      imgsArr = images.split(',');
    }

    if (item?.borrower_type === 1) {
      item.showName = `${item.first_name} ${item.middle_name} ${item.last_name}`;
    } else {
      item.showName = item.organization_name;
    }

    item.process_type = item.process_type.toLowerCase();
    item.imgsArr = imgsArr;
  });
  return data;
});

const reload = (val) => {
  if (val.status !== '10') {
    selectedRowKeys.value = [];
    selectedRows.value = [];
  }
  getTableData(val);
};

const selectedRowKeys = ref([]); // 存放UUid
const selectedRows = ref([]); // 存放所有选中的选项的所有内容
const rowSelection = ref({
  checkStrictly: false,
  onSelect: (record, selected) => {
    if (selected) {
      selectedRowKeys.value.push(record.task_id);
      selectedRows.value.push(record);
    } else {
      let index = selectedRowKeys.value.findIndex((it) => {
        return it === record.task_id;
      });
      selectedRowKeys.value.splice(index, 1);
      selectedRows.value.splice(index, 1);
    }
  },
  onSelectAll: (selected, Rows, changeRows) => {
    const changeRowId = changeRows.map((it) => {
      return it.task_id;
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
    disabled: Boolean(r.allow_notify !== 1 && currentParams.value?.status === '10')
  })
});

const loading = ref(false);
const type = ref('');
const send = (val) => {
  type.value = val;
  loading.value = true;
  backlogNotify({
    task_id: selectedRowKeys.value.join(),
    send_type: val
  })
    .then((res) => {
      selectedRowKeys.value = [];
      selectedRows.value = [];
    })
    .finally(() => {
      loading.value = false;
    });
};

const setRowClass = (record, index) => {
  if (!record.allow_notify && currentParams.value?.status === '10') {
    return 'disabled';
  }
  return '';
};

// 点击操作
const opProjectRef = ref(null);
const opLoanRef = ref(null);
const opOtherRef = ref(null);
const todoHandle = (val) => {
  if (val.module === 'loan') {
    opProjectRef.value.todoHandle(val);
  }
  if (val.module === 'request') {
    opLoanRef.value.todoHandle(val);
  }
  if (val.module === 'other') {
    opOtherRef.value.todoHandle(val);
  }
};

// 按钮操作完刷新页面
const userStore = useUserStore();
const opUpdate = () => {
  userStore.getTaskNumInfo();
  reload(true);
};
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.table-content {
  width: 100%;
  min-height: 300px;
  :deep(.ant-statistic-content) {
    font-size: 15px !important;
    white-space: nowrap;
  }

  :deep(.uppercaseFirst) {
    &::first-letter {
      text-transform: uppercase;
    }
  }
}

.border-t {
  border-top: 1px solid #808080;
}

.id-info {
  color: @colorPrimary;
  margin-bottom: 5px;
}

.icon-txt {
  position: relative;
  > .iconfont {
    color: #999;
    position: absolute;
    left: 0;
    line-height: 21px;
    &.cer {
      color: @colorPrimary;
    }
  }
  > span {
    text-indent: 20px;
    color: #666;
    &.cer {
      color: #282828;
    }
  }
}

.status-txt {
  color: @colorPrimary;
}

:deep(.disabled) {
  opacity: 0.6 !important;
  cursor: no-drop;
}
</style>
