<template>
  <div>
    <edit-application-dialog
      v-model:visible="editApplicationDialogVisible"
      :uuid="uuid"
      :infoData="currentDataInfo"
      @done="getTableData(true)"
    ></edit-application-dialog>

    <!-- 编辑弹窗 -->
    <security-edit-dialog
      v-model:visible="securityEditDialogVisible"
      :uuid="uuid"
      :projectDetail="projectDetail"
      :infoData="itemDataInfo"
      :reapply-edit="true"
      @done="getTableData"
    ></security-edit-dialog>

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
          <template v-if="column.dataIndex === 'security_name'">
            <p>{{ record.data.security_name }}</p>
          </template>
          <template v-if="column.dataIndex === 'card_no'">
            <p>{{ record.data.card_no }}</p>
          </template>
          <template v-if="column.dataIndex === 'type_name'">
            <p>{{ record.data.type_name }}</p>
          </template>
          <template v-if="column.dataIndex === 'is_gst'">
            <span v-if="Number(record.data.is_gst) === 1">{{ t('包含') }}</span>
            <span v-else>{{ t('不包含') }}</span>
          </template>
          <template v-if="column.dataIndex === 'amount'">
            <vco-number size="fs_md" :value="record.data.amount" :precision="2" :end="true"></vco-number>
          </template>
          <template v-if="column.dataIndex === 'status_name'">
            <a-tag v-if="record.mark === 'security_edit_fc'" color="cyan">{{ record.status_name }}</a-tag>
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
                v-if="hasPermission('projects:securities:edit:check') && record.mark === 'security_edit_fc'"
                type="primary" size="small" shape="round" class="uppercase"
                @click="checkHandle(record)"
              >{{ t('审核') }}</a-button>
              <a-button
                v-if="hasPermission('projects:securities:edit') && record.mark === 'DECLINED'"
                type="dark" size="small" shape="round" class="uppercase"
                @click="securityEditHandle(record)"
              >{{ t('重新编辑') }}</a-button>
              <a-button
                type="brown" size="small" shape="round" class="uppercase"
                @click="navigationTo(`/projects/discharge/details/edit?p_uuid=${uuid}&id=${record.id}`)"
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
import { dischargeApplySecurityEdit } from '@/api/project/loan';
import EditApplicationDialog from './EditApplicationDialog.vue';
import SecurityEditDialog from './SecurityEditDialog.vue';

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
  { title: t('名称'), dataIndex: 'security_name', width: 140, align: 'center' },
  { title: t('产权编号'), dataIndex: 'card_no', width: 120, align: 'center' },
  { title: t('类型'), dataIndex: 'type_name', width: 90, align: 'center' },
  { title: t('消费税'), dataIndex: 'is_gst', width: 100, align: 'center' },
  { title: t('抵押物价值'), dataIndex: 'amount', width: 130, align: 'center' },
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
  dischargeApplySecurityEdit,
  { uuid: props.uuid },
  false // 不立即请求，等 uuid 获取到后再请求
);

const editApplicationDialogVisible = ref(false)
const currentDataInfo = ref({})
const checkHandle = (record) => {
  currentDataInfo.value = record
  editApplicationDialogVisible.value = true
}

const securityEditDialogVisible = ref(false)
const itemDataInfo = ref({})
const securityEditHandle = (record) => {
  const data = {
    process__id: record.id,
    ...record.data
  }
  itemDataInfo.value = data
  securityEditDialogVisible.value = true
}

onMounted(() => {
  if (props.uuid) {
    getTableData(true)
  }
})
</script>
