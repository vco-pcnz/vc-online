<template>
  <product-tab v-model:current="pageStore.product_uuid" @change="tabChange">
    <div style="flex: 1"></div>
    <div class="flex">
      <DateExport :sta="pageStore.sta" v-if="hasPermission('projects:list:export')"></DateExport>
      <a-button type="cyan" size="small" class="ml-3" shape="round" @click="report" :loading="downloading" v-if="hasPermission('projects:newLoan:download')">{{ t('新开贷款') }}</a-button>
    </div>
  </product-tab>
  <vco-page-tab class="mt-5" :tabData="tabData" v-model:current="pageStore.sta" @change="tabChange"></vco-page-tab>

  <TableSearch class="mb-5" ref="tableSearchRef" :type="pageStore.sta == 1 ? 'open' : 'closed'"></TableSearch>

  <a-spin :spinning="pageStore.loading" size="large">
    <div class="table-content">
      <table-block :table-data="pageStore.list" :type="pageStore.sta == 1 ? 'current' : 'closed'"></table-block>
    </div>
    <div class="mt-5" v-if="pageStore.total">
      <a-pagination
        size="small"
        :total="pageStore.total"
        :pageSize="pageStore.pagination.limit"
        :current="pageStore.pagination.page"
        show-size-changer
        show-quick-jumper
        :show-total="(total) => t('共{0}条', [total])"
        @change="pageStore.setPaginate"
      />
    </div>
  </a-spin>
</template>

<script setup name="Projects">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import TableSearch from '../components/TableSearch.vue';
import TableBlock from '../components/TableBlock.vue';
import { useProjectsStore } from '@/store';
import { hasPermission } from '@/directives/permission/index';
import ProductTab from './../components/ProductTab.vue';
import { downGs } from '@/api/project/project';
import DateExport from './components/DateExport.vue';

const { t } = useI18n();
const pageStore = useProjectsStore();

const tabData = ref([
  {
    label: t('当前项目'),
    value: 1,
    num: 0
  },
  {
    label: t('已关闭的项目'),
    value: 2,
    num: 0
  }
]);

const tableSearchRef = ref();

const tabChange = () => {
  pageStore.pagination.page = 1;
  pageStore.searchParams['order'] = 'desc';
  pageStore.searchParams['sort'] = 'start_date';
  if (tableSearchRef.value) {
    tableSearchRef.value.searchHandle(true);
  } else {
    pageStore.getList();
  }
};

onMounted(() => {});
const downloading = ref(false);
const report = () => {
  downloading.value = true;
  downGs()
    .then((res) => {
      window.open(res);
    })
    .finally(() => {
      downloading.value = false;
    });
};
</script>
