<template>
  <div>
    <table-search ref="tableSearchRef" @search="searchHandle"></table-search>
    <div class="mt-5">
      <a-spin :spinning="tableLoading" size="large">
        <div class="table-content sys-table-content no-top-line">
          <a-table ref="tableRef" rowKey="uuid" :columns="columns" :data-source="tableData" table-layout="fixed" :customRow="rowClick" :pagination="false">
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'project_name'">
                <div :title="record.project_name" class="black bold">{{ record.project_name || t('项目名称') }}</div>
              </template>
              <template v-if="column.dataIndex === 'Operation'">
              <i class="iconfont nav-icon">&#xe794;</i>
            </template>
            </template>
          </a-table>
        </div>
        <div v-if="tableData.length">
          <a-pagination size="small" :total="pageObj.total" :current="pageObj.currentPage" :page-size="pageObj.pageSize"
                        show-size-changer show-quick-jumper :show-total="(total) => t('共{0}条', [total])"
                        @change="pageChange" />
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { projectValuer } from '@/api/project/project';
import { navigationTo } from '@/utils/tool';
import TableSearch from './TableSearch.vue';
import useProductStore from '@/store/modules/product';
import { useTableList } from '@/hooks/useTableList';

const { t } = useI18n();


const productStore = useProductStore();
const { currentParams, tableRef, tableLoading, pageObj, tableData, otherInfo, pageChange, getTableData } = useTableList(projectValuer);

const columns = reactive([
  { title: t('项目名称'), dataIndex: 'project_name', align: 'left' },
  { title: t('ID'), dataIndex: 'project_apply_sn', align: 'left' },
  { title: t('操作'), dataIndex: 'Operation', align: 'right',width: 120 }
]);

const searchHandle = (data = {}) => {
  const params = {
    ...data,
    product_uuid: productStore.currentProduct
  };
  getTableData(params);
};

const rowClick = (record, index) => {
  return {
    onClick: () => {
      navigationTo(`/valuer/detail?uuid=${record.uuid}&name=${record.project_name}`);
    }
  };
};

onMounted(() => {
  // getTableData()
})

</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.nav-icon {
  cursor: pointer;
  display: inline-block;
  transform: rotate(-45deg);
  color: #bf9425!important;
  font-size: 10px !important;
}
</style>
