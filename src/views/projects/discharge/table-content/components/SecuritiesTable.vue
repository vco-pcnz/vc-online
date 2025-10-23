<template>
  <div>
    <!-- 编辑弹窗 -->
    <security-edit-dialog
      v-model:visible="securityEditDialogVisible"
      :uuid="uuid"
      :projectDetail="projectDetail"
      :infoData="currentDataInfo"
      @done="() => handleGetTableData(false)"
    ></security-edit-dialog>

    <!-- 解押弹窗 -->
    <security-discharge-dialog
      v-model:visible="securityDischargeDialogVisible"
      :uuid="uuid"
      :projectDetail="projectDetail"
      :info-data="selectData"
      @done="dischargeDone"
    ></security-discharge-dialog>

    <div v-if="hasPermission('projects:securities:discharge:request')" class="flex items-center gap-5 mt-5">
      <a-button
        type="primary"
        :disabled="!selectData.length"
        @click="securityDischargeDialogVisible = true"
      >{{ t('解押申请') }}<span v-if="selectData.length" class="pl-2">({{ selectData.length }})</span></a-button>
      
      <a-button
        type="default"
        :disabled="!selectData.length"
        @click="clearAllSelection"
      >{{ t('清除选择') }}</a-button>
    </div>
    <div class="table-content sys-table-content mt-5">
      <a-table
        ref="tableRef"
        rowKey="uuid"
        :row-selection="hasPermission('projects:securities:discharge:request') ? rowSelection : null"
        :columns="columns"
        :data-source="tableDataRef"
        table-layout="fixed"
        :loading="tableLoading"
        :pagination="false"
        :scroll="{ x: 1330 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'is_gst'">
            <span v-if="Number(record.is_gst) === 1">{{ t('包含') }}</span>
            <span v-else>{{ t('不包含') }}</span>
          </template>
          <template v-if="column.dataIndex === 'amount'">
            <vco-number size="fs_md" :value="record.amount" :precision="2" :end="true"></vco-number>
          </template>
          <template v-if="column.dataIndex === 'showStatusObj'">
            <a-tag :color="record.showStatusObj?.color">{{ record.showStatusObj?.title }}</a-tag>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <div class="flex items-center justify-center gap-3">
              <a-button
                  v-if="record.showStatusObj?.key === 4 && hasPermission('projects:securities:edit')"
                  type="primary" size="small" shape="round" class="uppercase"
                  @click="openSecurityEditDialog(record)"
                >{{ t('编辑') }}</a-button>
              <a-button
                type="brown" size="small" shape="round" class="uppercase"
                @click="navigationTo(`/projects/discharge/details/securities?p_uuid=${uuid}&uuid=${record.uuid}`)"
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
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { hasPermission } from '@/directives/permission/index';
import { navigationTo } from '@/utils/tool';
import { useTableList } from '@/hooks/useTableList';
import { dischargeSecurity } from '@/api/project/loan';
import SecurityEditDialog from './SecurityEditDialog.vue';
import SecurityDischargeDialog from './SecurityDischargeDialog.vue';

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
  { title: t('状态'), dataIndex: 'showStatusObj', width: 130, align: 'center' },
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
  dischargeSecurity,
  { uuid: props.uuid },
  false // 不立即请求，等 uuid 获取到后再请求
);

const getShowStatus = (data) => {
  if (Number(data.is_edit) === 1) {
    return {
      title: t('编辑中'),
      color: 'blue',
      disabled: true,
      key: 1
    }
  } else if (Number(data.is_repayment) === 1 || Number(data.repayment_id) > 0) {
    return {
      title: t('解押中'),
      color: 'cyan',
      disabled: true,
      key: 2
    }
  } else if (Number(data.status) === 1) {
    return {
      title: t('已解押'),
      color: 'green',
      disabled: true,
      key: 3
    }
  } else {
    return {
      title: t('待解押'),
      color: '',
      disabled: false,
      key: 4
    }
  }
}

const tableDataRef = computed(() => {
  return  tableData.value.map(item => {
    const showStatusObj = getShowStatus(item)
    return {
      ...item,
      showStatusObj
    }
  })
});

const selectedRowKeys = ref([])
// 维护选中数据的完整映射，用于跨页面选择
const selectedDataMap = ref(new Map())
// 防止递归更新的标志
const isUpdatingSelection = ref(false)
// 表格重新渲染的key
const tableKey = ref(0)

// 计算当前页面应该选中的keys
const getCurrentPageSelectedKeys = () => {
  if (!tableDataRef.value || tableDataRef.value.length === 0) return []
  return tableDataRef.value
    .map(item => item.uuid)
    .filter(uuid => selectedDataMap.value.has(uuid))
}

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys, selectedRows) => {
    if (isUpdatingSelection.value) return
    
    selectedRowKeys.value = keys
    
    // 获取当前页面的所有数据keys
    const currentPageKeys = tableDataRef.value.map(item => item.uuid)
    
    // 移除当前页面中不再选中的项
    currentPageKeys.forEach(key => {
      if (!keys.includes(key)) {
        selectedDataMap.value.delete(key)
      }
    })
    
    // 添加当前页面新选中的项
    selectedRows.forEach(row => {
      selectedDataMap.value.set(row.uuid, row)
    })
  },
  getCheckboxProps: (record) => {
    return {
      disabled: record.showStatusObj?.disabled
    }
  }
}))

const securityEditDialogVisible = ref(false)
const currentDataInfo = ref({})
const openSecurityEditDialog = (record) => {
  currentDataInfo.value = record
  securityEditDialogVisible.value = true
}

const securityDischargeDialogVisible = ref(false)
// 改造selectData，从selectedDataMap中获取完整的已选择数据
const selectData = computed(() => {
  return Array.from(selectedDataMap.value.values())
})

// 监听表格数据变化，更新当前页面的选中状态
watch(tableDataRef, async (newData) => {
  if (newData && newData.length > 0) {
    await nextTick()
    isUpdatingSelection.value = true
    
    // 计算当前页面中应该被选中的keys
    const currentPageSelectedKeys = getCurrentPageSelectedKeys()
    
    // 更新selectedRowKeys为当前页面的选中状态
    selectedRowKeys.value = currentPageSelectedKeys
    
    // 强制表格重新渲染以确保选中状态正确显示
    tableKey.value++
    
    // 恢复标志
    await nextTick()
    isUpdatingSelection.value = false
  }
}, { deep: true })

// 清除所有选择项的方法
const clearAllSelection = () => {
  // 清空所有选中状态
  selectedRowKeys.value = []
  selectedDataMap.value.clear()
  
  // 强制表格重新渲染
  tableKey.value++
}

// 扩展getTableData方法，添加清理逻辑
const handleGetTableData = async (reset = false) => {
  // 如果是重置（重新搜索等），清空之前的选中状态
  if (reset) {
    clearAllSelection()
  }
  
  await getTableData(reset)
}

const dischargeDone = () => {
  clearAllSelection()
  getTableData()
}

onMounted(() => {
  if (props.uuid) {
    handleGetTableData(true)
  }
})
</script>
