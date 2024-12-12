<template>
  <div>
    <vco-page-nav sup-path="/projects"></vco-page-nav>
    <a-spin :spinning="tableLoading" size="large">
      <div class="table-content">
        <a-table
          ref="tableRef"
          rowKey="uuid"
          :columns="columns"
          :data-source="dataSource"
          :pagination="false"
          :scroll="{ x: '100%' }"
        >
          <template #bodyCell="{ column, record }"></template>
        </a-table>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTableList } from '@/hooks/useTableList';
import { projectListApi } from "@/api/process";

const { t } = useI18n();
const {
  tableRef,
  tableLoading,
  pageObj,
  tableData,
  pageChange,
  getTableData,
  searchReset,
} = useTableList(projectListApi); // TODO
const columns = reactive([
  { title: t('项目•类型'), dataIndex: 'project', width: 80, align: 'center' },
  {
    title: t('借款人•贷款经理'),
    dataIndex: 'borrower',
    width: 180,
    align: 'left',
  },
  { title: t('到期'), dataIndex: 'maturity', width: 160, align: 'left' },
  { title: t('IRR预测'), dataIndex: 'irr', width: 100, align: 'center' },
  { title: t('收入'), dataIndex: 'income', width: 220, align: 'center' },
  { title: t('待提取'), dataIndex: 'undrawn', width: 100, align: 'center' },
  { title: t('贷款余额'), dataIndex: 'balance', width: 120, align: 'center' },
  { title: t('FC2'), dataIndex: 'facility2', width: 100, align: 'center' },
  { title: t('UPD'), dataIndex: 'upd', width: 100, align: 'center' },
]);
const dataSource = reactive([
  {
    project: '项目1',
    borrower: {
      avatar: '',
      name: '张三',
    },
    maturity: '2022-01-01',
    irr: '5.5%',
    income: '1820000',
    undrawn: '434422',
    balance: '1538764',
    facility2: '1820000',
    upd: '11',
  },
]);
</script>

<style scoped lang="less"></style>
