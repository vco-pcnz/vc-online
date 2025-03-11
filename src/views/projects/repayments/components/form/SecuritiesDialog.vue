<template>
  <a-modal
    :open="visible"
    :title="t('抵押物')"
    :width="isDetails ? 920 : 700"
    :footer="null"
    :keyboard="false"
    :maskClosable="false"
    @cancel="updateVisible(false)"
  >
    <a-spin :spinning="tableLoading" size="large">
      <div class="table-content sys-table-content">
        <a-table
          ref="tableRef"
          rowKey="uuid"
          :columns="columns"
          :row-selection="isDetails ? null : rowSelection"
          :data-source="isDetails ? selectData : tableData"
          :pagination="false"
          table-layout="fixed"
          :scroll="{ x: '100%' }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'amount'">
              <vco-number size="fs_md" :value="record.amount" :precision="2"></vco-number>
            </template>
            <template v-if="column.dataIndex === 'real_amount'">
              <vco-number size="fs_md" :value="record.real_amount" :precision="2"></vco-number>
            </template>
          </template>
        </a-table>
      </div>
      <div v-if="!isDetails && tableData.length" class="mt-5">
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

    <div class="mt-5 flex gap-5 justify-end">
      <a-button
        v-if="!isDetails"
        type="grey" class="big shadow bold uppercase mb-5 mt-5"
        @click="updateVisible(false)"
      >{{ t('取消') }}</a-button>

      <a-button
        type="dark" class="big shadow bold uppercase mb-5 mt-5"
        :disabled="!selectedRowKeys.length && !isDetails"
        @click="submitHandle"
      >{{ isDetails ? t('关闭') : t('确定') }}</a-button>
    </div>
  </a-modal>
</template>

<script setup>
  import { ref, watch, reactive, computed } from "vue";
  import { useI18n } from "vue-i18n";
  import { useTableList } from '@/hooks/useTableList';
  import { projectDischargeSelSecurity } from '@/api/project/loan';

  const emits = defineEmits(['update:visible', 'done'])

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    uuid: {
      type: String,
      default: ''
    },
    selectData: {
      type: Array,
      default: () => []
    },
    isDetails: {
      type: Boolean,
      default: false
    }
  });

  const { t } = useI18n();

  const { tableRef, tableLoading, tableData, pageObj, pageChange, getTableData } = useTableList(projectDischargeSelSecurity, {uuid: props.uuid}, false);
  const columns = computed(() => {
    const data = [
      { title: t('名称'), dataIndex: 'security_name', width: 140 },
      { title: t('产权编号'), dataIndex: 'card_no', width: 140 },
      { title: t('抵押物价值'), dataIndex: 'amount', width: 140 },
      { title: t('类型'), dataIndex: 'type_name', width: 90 },
      
    ]
    if (props.isDetails) {
      return [...data,
        {title: t('当前抵押物价值'), dataIndex: 'real_amount', width: 140}]
    } else {
      return data
    }
  })

  // 维护所有已选的行
  const selectedRowKeys = ref([]);
  const selectedRows = ref([]);

  const rowSelection = {
    selectedRowKeys,  // 使用 selectedRowKeys 来管理选中状态
    onSelect: (record, selected) => {
      if (selected) {
        selectedRowKeys.value = [...new Set([...selectedRowKeys.value, record.uuid])];
        selectedRows.value = [...selectedRows.value, record];
      } else {
        selectedRowKeys.value = selectedRowKeys.value.filter((key) => key !== record.uuid);
        selectedRows.value = selectedRows.value.filter((row) => row.uuid !== record.uuid);
      }
    },
    onSelectAll: (selected, changeSelectedRows, changeRows) => {
      if (selected) {
        // 全选时，将 changeRows 中的数据加入 selectedRows
        selectedRowKeys.value = Array.from(new Set([...selectedRowKeys.value, ...changeRows.map((row) => row.uuid)]));
        selectedRows.value = Array.from(new Set([...selectedRows.value, ...changeSelectedRows]));
      } else {
        // 取消全选时，移除 changeRows 中的数据
        selectedRowKeys.value = selectedRowKeys.value.filter((key) => !changeRows.some((row) => row.uuid === key));
        selectedRows.value = selectedRows.value.filter((row) => !changeRows.some((r) => r.uuid === row.uuid));
      }
    }
  };

  /* 更新visible */
  const updateVisible = (value) => {
    emits('update:visible', value);
  };

  const submitHandle = () => {
    if (!props.isDetails) {
      emits('done', selectedRows.value)
    }
    
    updateVisible(false)
  }

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        if (!props.isDetails) {
          if (props.selectData.length) {
          const arr = props.selectData.map(item => item.uuid)
            selectedRowKeys.value = arr
          }
          getTableData(true)
        } else {
          tableLoading.value = false
        }
      } else {
        tableLoading.value = false
      }
    }
  )
</script>