<template>
  <div>
    <discharge-application-dialog
      v-model:visible="dischargeApplicationDialogVisible"
      :uuid="uuid"
      :info-data="currentDataInfo"
      @done="getTableData"
    />

    <!-- 解押弹窗 -->
    <security-discharge-dialog
      v-model:visible="securityDischargeDialogVisible"
      :uuid="uuid"
      :projectDetail="projectDetail"
      :info-data="securityTableData"
      :detail-info="securityDetailInfo"
      :is-reapply="true"
      @done="getTableData"
    ></security-discharge-dialog>

    <div class="table-content sys-table-content mt-5">
      <a-table
        ref="tableRef"
        rowKey="uuid"
        :columns="columns"
        :data-source="tableData"
        table-layout="fixed"
        :loading="tableLoading"
        :pagination="false"
        :scroll="{ x: 1330 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'name'">
            {{ record.info?.dirname }}
          </template>
          <template v-if="column.dataIndex === 'number'">
            <vco-number :value="record.data?.list.length || 0" :precision="0" prefix="" size="fs_md"></vco-number>
          </template>
          <template v-if="column.dataIndex === 'status_name'">
            <a-tag v-if="record.mark === 'discharge_security_fc'" color="cyan">{{ record.status_name }}</a-tag>
            <div v-if="record.mark === 'DECLINED'" class="flex items-center justify-center">
              <a-tag color="red">{{ record.status_name }}</a-tag>
              <a-tooltip placement="top">
                <template #title>
                  <span>{{ record.decline_reason }}</span>
                </template>
                <i class="iconfont cursor-pointer" style="color: #ff4d4f;">&#xe60e;</i>
              </a-tooltip>
            </div>
          </template>
          <template v-if="column.dataIndex === 'create_time'">
            <span>{{ tool.showDate(record.create_time) }}</span>
          </template>

          <template v-if="column.dataIndex === 'operation'">
            <div class="flex items-center justify-center gap-3">
              <a-button
                v-if="hasPermission('projects:securities:discharge:check') && record.mark === 'discharge_security_fc'"
                type="primary" size="small" shape="round" class="uppercase"
                @click="dischargeApplicationHandle(record)"
              >{{ t('审核') }}</a-button>
              <a-button
                v-if="hasPermission('projects:securities:discharge:request') && record.mark === 'DECLINED'"
                type="dark" size="small" shape="round" class="uppercase"
                @click="securityDischargeHandle(record)"
              >{{ t('重新申请') }}</a-button>
              <a-button
                type="brown" size="small" shape="round" class="uppercase"
                @click="navigationTo(`/projects/discharge/details/discharge?p_uuid=${uuid}&id=${record.id}`)"
              >{{ t('详情') }}</a-button>
            </div>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { hasPermission } from '@/directives/permission/index';
import tool, { navigationTo } from '@/utils/tool';
import { useTableList } from '@/hooks/useTableList';
import { dischargeApplyDischarge } from '@/api/project/loan';
import DischargeApplicationDialog from './DischargeApplicationDialog.vue';
import SecurityDischargeDialog from './../../table-content/components/SecurityDischargeDialog.vue';

const { t } = useI18n();
const props = defineProps({
  uuid: {
    type: String,
    default: ''
  },
  projectDetail: {
    type: Object,
    default: () => {}
  }
});

const columns = ref([
  { title: t('文件夹名称'), dataIndex: 'name', width: 140, align: 'center' },
  { title: t('抵押物数量'), dataIndex: 'number', width: 100, align: 'center' },
  { title: t('状态'), dataIndex: 'status_name', width: 130, align: 'center' },
  { title: t('申请时间'), dataIndex: 'create_time', width: 130, align: 'center' },
  {
    title: t('操作1'),
    dataIndex: 'operation',
    fixed: 'right',
    align: 'center',
    width: 130
  }
])

// 定义表格相关的逻辑
const { tableRef, tableLoading, pageObj, tableData, pageChange, getTableData } = useTableList(
  dischargeApplyDischarge,
  { uuid: props.uuid },
  false // 不立即请求，等 uuid 获取到后再请求
);

const dischargeApplicationDialogVisible = ref(false)
const currentDataInfo = ref({})
const dischargeApplicationHandle = (record) => {
  currentDataInfo.value = record
  dischargeApplicationDialogVisible.value = true
}

const securityDischargeDialogVisible = ref(false)
const securityDetailInfo = ref({})
const securityTableData = ref([])
const securityDischargeHandle = (record) => {
  securityDetailInfo.value = record
  securityTableData.value = record.data?.list || []
  securityDischargeDialogVisible.value = true
}

onMounted(() => {
  if (props.uuid) {
    getTableData(true)
  }
})
</script>
