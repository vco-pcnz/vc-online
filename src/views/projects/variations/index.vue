<template>
  <detail-layout active-tab="penalty" @getProjectDetail="getProjectDetail">
    <template #content>
      <!-- 检查是否可以提交变更 -->
      <check-pass-confirm v-model:visible="checkPassConfirmVisible" :current-id="uuid"></check-pass-confirm>

      <!-- 详情弹窗 -->
      <detail-dialog
        v-model:visible="detailVisible"
        :uuid="uuid"
        :detailData="currentData"
        :projectDetail="projectDetail"
        @done="updateHandle(false)"
      >
      </detail-dialog>

      <!-- 编辑弹窗 -->
      <AddVariations
        ref="editVariationsRef"
        :currentId="uuid"
        :project-detail="projectDetail"
        :detailData="currentData"
        @update="updateHandle(false)"
      ></AddVariations>

      <vco-table-tool>
        <template #right>
          <span>
            <a-button
              v-if="hasPermission('projects:variations:add')"
              type="dark"
              class="uppercase"
              @click="checkPassConfirmVisible = true"
            >{{ t('添加变更') }}</a-button>
          </span>
        </template>
      </vco-table-tool>

      <a-spin :spinning="tableLoading" size="large">
        <div class="table-content sys-table-content no-top-line">
          <a-table
            ref="tableRef"
            rowKey="id"
            :columns="columns"
            :data-source="tableDataRef"
            table-layout="fixed"
            :pagination="false"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'cricle'">
                <div class="circle" :class="{'done': record.status === 1}"></div>
              </template>
              <template v-if="column.dataIndex === 'type_name'">
                <span :class="{'declined-txt': record.declined}">{{ record.type_name }}</span>
              </template>
              <template v-if="column.dataIndex === 'start_date'">
                <span v-if="record.start_date" :class="{'declined-txt': record.declined}">{{ tool.showDate(record.start_date) }}</span>
                <span v-else>--</span>
              </template>
              <template v-if="column.dataIndex === 'is_late'">
                <a-tag v-if="Number(record.is_late) === 1" color="red" style="margin-inline-end: 0 !important;">{{ t('延迟变更') }}</a-tag>
                <a-tag v-else color="green" style="margin-inline-end: 0 !important;">{{ t('正常变更') }}</a-tag>
              </template>
              <template v-if="column.dataIndex === 'initial_amount'">
                <vco-number v-if="record.initial_amount" :class="{'declined-txt': record.declined}" :value="record.initial_amount" :precision="2"></vco-number>
                <p v-else>--</p>
              </template>
              <template v-if="column.dataIndex === 'amount'">
                <div v-if="Number(record.amount)" :class="{'declined-txt': record.declined}">
                  <div class="flex items-center gap-1 justify-center">
                    <span class="amount-type" :class="{'plus': record.plus, 'declined-txt': record.declined}">{{ record.plus ? '+' : '-' }}</span>
                    <vco-number :value="record.amount" :precision="2" :color="record.plus ? '#31bd65' : '#eb4b6d'"></vco-number>
                  </div>
                  <div class="amout-total">
                    <vco-number :value="getTotal(record)" :precision="2"></vco-number>
                    <p :class="{'declined-txt': record.declined}">{{ t('借款总金额') }}</p>
                  </div>
                </div>
                <div v-else class="amout-total no" :class="{'declined-txt': record.declined}">
                  <vco-number :value="getTotal(record)" :precision="2" color="#888"></vco-number>
                  <p>{{ t('借款总金额') }}</p>
                </div>
              </template>
              <template v-if="column.dataIndex === 'end_date'">
                <div v-if="record.end_date" style="color: #F19915;" :class="{'declined-txt': record.declined}">{{ tool.showDate(record.end_date) }}</div>
                <div v-else class="end-date-before" :class="{'declined-txt': record.declined}">
                  <p :class="{'declined-txt': record.declined}">{{ projectEndDate }}</p>
                  <p :class="{'declined-txt': record.declined}">{{ t('到期日期') }}</p>
                </div>
              </template>
              <template v-if="column.dataIndex === 'status_name'">
                <span :style="{ color: colors[record.status_name] }">{{ record.status_name }}</span>
                <a-tooltip v-if="record.cancel_reason || record.decline_reason" placement="topLeft">
                  <template #title>
                    <span>{{ record.cancel_reason || record.decline_reason }}</span>
                  </template>
                  <QuestionCircleOutlined class="ml-2" />
                </a-tooltip>
              </template>
              <template v-if="column.dataIndex === 'create_time'">
                <span v-if="record.create_time" :class="{'declined-txt': record.declined}">{{ tool.showDate(record.create_time) }}</span>
                <span v-else>--</span>
              </template>
              <template v-if="column.dataIndex === 'operation'">
                <template v-if="record.has_permission">
                  <!-- <a-button
                    v-if="record.status_name === 'PENDING SUBMIT'"
                    type="primary" size="small" shape="round" class="uppercase mb-2"
                    @click="openDetail(record, true)"
                  >{{ t('编辑') }}</a-button> -->
                  <a-button
                    v-if="record.status_name !== 'PENDING SUBMIT'"
                    type="primary" size="small" shape="round" class="uppercase mb-2"
                    @click="openDetail(record, false)"
                  >{{ t('审核') }}</a-button>
                </template>
                <!-- <a-button
                    v-if="record.status_name === 'PENDING APPLY' && Boolean(record.is_me)"
                    type="primary" size="small" shape="round" class="uppercase mb-2"
                    @click="openDetail(record, true)"
                  >{{ t('编辑') }}</a-button> -->
                <a-button
                  type="brown" size="small" shape="round" class="uppercase"
                  @click="goDetail(record)"
                >{{ t('详情') }}</a-button>
              </template>
            </template>
          </a-table>
        </div>
        <div v-if="tableData.length" class="mt-5">
          <a-pagination
            size="small"
            :total="pageObj.total"
            :current="pageObj.currentPage"
            :page-size="pageObj.pageSize"
            show-size-changer
            show-quick-jumper
            :show-total="(total) => t('共{0}条', [total])"
            @change="pageChange"
          />
        </div>
      </a-spin>
    </template>
  </detail-layout>
</template>

<script setup>
import { ref, onMounted, watch, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import tool, { navigationTo } from '@/utils/tool';
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import detailLayout from '../components/detailLayout.vue';
import { projectVariationList, projectVariationForecastUpd } from '@/api/project/variation';
import { useTableList } from '@/hooks/useTableList';
import { useRoute } from 'vue-router';
import { hasPermission } from '@/directives/permission/index';
import AddVariations from '@/views/projects/variations/components/form/AddVariations.vue';
import DetailDialog from './components/DetailDialog.vue';
import { useUserStore } from '@/store';
import CheckPassConfirm from '@/views/projects/variations/add/components/check-pass-confirm.vue';

const { t } = useI18n();
const route = useRoute();
const uuid = ref(route.query.uuid);
const userStore = useUserStore();

const colors = ref({
  'FC REVIEW': '#d3a631',
  'FC PENDING REVIEW': '#d3a631',
  'DIRECTOR PENDING REVIEW': '#d3a631',
  'PENDING APPLY': '#d3a631',
  'LM PENDING REVIEW': '#0bda8e',
  'PENDING SUBMIT': '#F19915',
  'DECLINED PENALTY': '#c1430c',
});

const columns = reactive([
  { title: '', dataIndex: 'cricle', width: 40, align: 'center' },
  { title: t('变更类型'), dataIndex: 'type_name', width: 180, align: 'center' },
  { title: t('变更开始日期'), dataIndex: 'start_date', width: 130, align: 'center' },
  { title: t('类型'), dataIndex: 'is_late', width: 120, align: 'center' },
  { title: t('首次放款'), dataIndex: 'initial_amount', width: 140, align: 'center' },
  { title: t('变更金额'), dataIndex: 'amount', width: 140, align: 'center' },
  { title: t('变更后结束日期'), dataIndex: 'end_date', width: 130, align: 'center' },
  { title: t('状态'), dataIndex: 'status_name', width: 165, align: 'center' },
  { title: t('创建时间'), dataIndex: 'create_time', width: 120, align: 'center' },
  {
    title: t('操作1'),
    dataIndex: 'operation',
    fixed: 'right',
    align: 'center',
    width: 110,
  },
]);

const tableDataRef = computed(() => {
  const data = tableData.value;
  data.forEach((item) => {
    item.plus = [1, 4].includes(item.type)
    item.declined = [-900].includes(item.state)
  });
  return data;
})

// 定义表格相关的逻辑
const { tableRef, tableLoading, pageObj, tableData, pageChange, getTableData } = useTableList(
  projectVariationList,
  { uuid: uuid.value },
  false // 不立即请求，等 uuid 获取到后再请求
);

const projectDetail = ref();
const getProjectDetail = (val) => {
  projectDetail.value = val;
};

const projectEndDate = computed(() => {
  return tool.showDate(projectDetail.value?.date?.end_date)
})

const getTotal = (data) => {
  const amount = Number(data.amount)
  const num = Number(projectDetail.value?.base?.loan_money) || 0
  let res = 0
  if (data.plus) {
    res = tool.plus(num, amount)
  } else {
    res = tool.minus(num, amount)
  }

  return res
}

const editVariationsRef = ref()

const currentData = ref(null)
const detailVisible = ref(false)
const openDetail = (data, flag) => {
  currentData.value = data

  if (flag) {
    editVariationsRef.value.init()
  } else {
    detailVisible.value = true
  }
}

const goDetail = (data) => {
  navigationTo(`/projects/variations-details/about?uuid=${uuid.value}&id=${data.id}`)
}

const updateHandle = (flag) => {
  userStore.getTaskNumInfo()
  getTableData(flag)
}

const checkPassConfirmVisible = ref(false);

// 监听 uuid 的变化
watch(() => route.params.uuid, (newUuid) => {
  uuid.value = newUuid; // 当 url 中的 uuid 改变时更新 uuid
});

onMounted(() => {
  uuid.value = route.query.uuid;
  if (route.query.uuid) {
    getTableData();
  }
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.ProjectDrawdowns {
  .grid {
    display: grid;
    gap: 36px;
    grid-template-columns: 2.9fr 1.1fr;
    align-items: start;
  }
}

.table-content {
  width: 100%;
  min-height: 300px;
  :deep(.ant-statistic-content) {
    font-size: 16px !important;
    white-space: nowrap;
  }
}

.circle {
  border-radius: 4px;
  display: inline-block;
  height: 8px;
  width: 8px;
  background-color: transparent;
  border: 2px solid;
  border-color: #181818;
  &.done {
    background-color: #181818;
  }
}

.amount-type {
  font-size: 16px;
  color: #eb4b6d;
  &.plus {
    color: #31bd65;
  }
}

.amout-total {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  line-height: 1 !important;
  color: #888;
  :deep(.ant-statistic-content) {
    font-size: 12px !important;
    line-height: 1 !important;
  }
  &.no {
    line-height: 1.2 !important;
    :deep(.ant-statistic-content) {
      font-size: 14px !important;
    }
  }
}

.end-date-before {
  > p {
    line-height: 1.25;
    font-size: 12px;
    color: #888;
    &:last-child {
      font-size: 10px;
    }
  }
}

.declined-txt {
  color: #aaa !important;
  :deep(.ant-statistic-content) {
    color: #aaa !important;
  }
}
</style>
