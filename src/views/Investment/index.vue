<template>
  <div class="flex justify-between items-end" style="margin-top: -30px">
    <TableSearch class="mb-5" ref="tableSearchRef" @search="searchHandle"></TableSearch>
    <FormModal ref="FormModalRef" @update="getTableData" v-if="hasPermission('Investment:add')">
      <a-button type="cyan" shape="round" class="mb-5">{{ t('创建投资') }}</a-button>
    </FormModal>
  </div>

  <a-spin :spinning="tableLoading" size="large">
    <div class="table-content">
      <table-block :table-data="tableData" @showEdit="showEdit" @update="getTableData"></table-block>
    </div>

    <div v-if="tableData.length" class="mt-5">
      <a-pagination size="small" :total="pageObj.total" :current="pageObj.currentPage" :page-size="pageObj.pageSize" show-size-changer show-quick-jumper :show-total="(total) => t('共{0}条', [total])" @change="pageChange" />
    </div>
  </a-spin>
</template>

<script setup name="Projects">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTableList } from '@/hooks/useTableList';
import TableSearch from './components/TableSearch.vue';
import FormModal from './components/FormModal.vue';
import TableBlock from './components/TableBlock.vue';
import { investList } from '@/api/invest/index';
import { hasPermission } from '@/directives/permission/index';

const { t } = useI18n();

const { currentParams, tableRef, tableLoading, pageObj, tableData, otherInfo, pageChange, getTableData } = useTableList(investList, {}, true);

const searchHandle = (data = {}) => {
  const params = {
    ...data
  };
  getTableData(params);
};

const FormModalRef = ref();
const showEdit = (val) => {
  FormModalRef.value.init(val)
}
</script>
