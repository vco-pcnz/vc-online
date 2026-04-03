<template>
  <div class="flex justify-between items-end" style="margin-top: -30px">
    <TableSearch class="mb-5" ref="tableSearchRef" @search="searchHandle"></TableSearch>
    <FormModal ref="FormModalRef" @update="getTableData" v-if="hasPermission('Investment:add') && !isVslProduct">
      <a-button type="cyan" shape="round" class="mb-5">{{ t('创建投资') }}</a-button>
    </FormModal>
    <FormModalVsl ref="FormModalVslRef" @update="getTableData" v-if="hasPermission('Investment:add') && isVslProduct">
      <a-button type="cyan" shape="round" class="mb-5">{{ t('创建投资') }}</a-button>
    </FormModalVsl> 
  </div>

  <a-spin :spinning="tableLoading" size="large">
    <div class="table-content">
      <table-block v-if="!isVslProduct" :table-data="tableData" @showEdit="showEdit" @update="getTableData"></table-block>
      <table-block-vsl v-else :table-data="tableData" @showEdit="showEdit" @update="getTableData"></table-block-vsl>
    </div>

    <div v-if="tableData.length" class="mt-5">
      <a-pagination size="small" :total="pageObj.total" :current="pageObj.currentPage" :page-size="pageObj.pageSize" show-size-changer show-quick-jumper :show-total="(total) => t('共{0}条', [total])" @change="pageChange" />
    </div>
  </a-spin>
</template>

<script setup name="Projects">
import { ref, reactive, watch,  computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTableList } from '@/hooks/useTableList';
import TableSearch from './components/TableSearch.vue';
import FormModal from './components/FormModal.vue';
import FormModalVsl from './components/FormModalVsl.vue';
import TableBlock from './components/TableBlock.vue';
import TableBlockVsl from './components/TableBlockVsl.vue';
import { investList } from '@/api/invest/index';
import { hasPermission } from '@/directives/permission/index';
import useProductStore from '@/store/modules/product';

const { t } = useI18n();

const productStore = useProductStore();
const listParams = reactive({ product_uuid: '' });

const { currentParams, tableRef, tableLoading, pageObj, tableData, otherInfo, pageChange, getTableData } = useTableList(investList, listParams, false);

watch(
  () => productStore.currentProduct,
  (val) => {
    if (val) {
      listParams.product_uuid = val;
      getTableData(true);
    }
  },
  { immediate: true }
);

const isVslProduct = computed(() => {
  const p = productStore.productData.find((item) => item.uuid === productStore.currentProduct);
  return String(p?.code || '').toLowerCase() === 'vsl';
});

const searchHandle = (data = {}) => {
  const params = {
    ...data
  };
  getTableData(params);
};

const FormModalRef = ref();
const FormModalVslRef = ref();
const showEdit = (val) => {
  if (isVslProduct.value) {
    FormModalVslRef.value.init(val);
  } else {
    FormModalRef.value.init(val);
  }
}
</script>
