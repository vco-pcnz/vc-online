<template>
  <div class="flex justify-between items-center">
    <vco-page-tab :tabData="tabData" v-model:current="pageStore.sta" @change="tabChange"></vco-page-tab>
    <div class="flex">
      <a-button type="cyan" size="small" class="ml-3" shape="round" v-if="hasPermission('project:list:bindValuer')" @click="open_projects = true">{{ t('绑定估值') }}</a-button>
      <a-button type="cyan" size="small" class="ml-3" shape="round" @click="buildProgressReport" :loading="buildProgressDownloading" v-if="hasPermission('projects:buildProgress:download')">{{ t('建筑进度') }}</a-button>
      <ScheduleExport :sta="pageStore.sta" :searchParams="pageStore.searchParams" v-if="hasPermission('projects:schedule:download')"></ScheduleExport>
      <DateExport :sta="pageStore.sta" :searchParams="pageStore.searchParams" v-if="hasPermission('projects:list:export')"></DateExport>
      <a-button type="cyan" size="small" class="ml-3" shape="round" @click="report" :loading="downloading" v-if="hasPermission('projects:newLoan:download')">{{ t('新开贷款') }}</a-button>
    </div>
  </div>

  <TableSearch class="mb-5" ref="tableSearchRef" :type="staName[pageStore.sta]"></TableSearch>

  <a-spin :spinning="pageStore.loading" size="large">
    <div class="table-content">
      <table-block v-if="!isNormalUser" :table-data="pageStore.list" :type="staName[pageStore.sta]"></table-block>
      <table-block-vip v-if="isNormalUser" :table-data="pageStore.list" :type="staName[pageStore.sta]"></table-block-vip>
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
  
  <BindValuer v-model:visible="open_projects" :selectedData="bindData" :product_uuid="productStore.currentProduct" @update="handleBindLoneChange" />
</template>

<script setup name="Projects">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import TableSearch from '../components/TableSearch.vue';
import TableBlock from '../components/TableBlock.vue';
import TableBlockVip from '../components/TableBlockVip.vue';
import { useProjectsStore, useUserStore } from '@/store';
import { hasPermission } from '@/directives/permission/index';
import { downGs, buildProgressIndex } from '@/api/project/project';
import DateExport from './components/DateExport.vue';
import ScheduleExport from './components/ScheduleExport.vue';
import useProductStore from '@/store/modules/product';
const productStore = useProductStore();
import BindValuer from './components/BindValuer.vue';
import { message } from 'ant-design-vue';

const { t } = useI18n();
const pageStore = useProjectsStore();
const isNormalUser = computed(() => useUserStore().isNormalUser);
const current_num = computed(() => pageStore.otherInfo['1']);
const closed_num = computed(() => pageStore.otherInfo['2']);
const Written_off_num = computed(() => pageStore.otherInfo['4']);

const tabData = ref([
  {
    label: t('当前项目'),
    value: 1,
    num: current_num
  },
  {
    label: t('已核销的项目'),
    value: 4,
    num: Written_off_num
  },
  {
    label: t('已关闭的项目'),
    value: 2,
    num: closed_num
  }
]);

const staName = {
  1: 'current',
  2: 'closed',
  4: 'written'
};

const tableSearchRef = ref();

const tabChange = () => {
  if (window.location.pathname.includes('umbrella')) {
    useUserStore().pageRole = 'Umbrella';
  }
  pageStore.pagination.page = 1;
  pageStore.searchParams['order'] = 'desc';
  pageStore.searchParams['sort'] = 'start_date';
  if (tableSearchRef.value) {
    tableSearchRef.value.searchHandle();
  } else {
    pageStore.getList();
  }
};

const downloading = ref(false);
const report = () => {
  downloading.value = true;
  downGs({product_uuid: productStore.currentProduct})
    .then((res) => {
      window.open(res);
    })
    .finally(() => {
      downloading.value = false;
    });
};

const buildProgressDownloading = ref(false);
const buildProgressReport = () => {
  buildProgressDownloading.value = true;
  buildProgressIndex({product_uuid: productStore.currentProduct})
    .then((res) => {
      window.open(res);
    })
    .finally(() => {
      buildProgressDownloading.value = false;
    });
};


const open_projects = ref(false);
const bindData = ref([]);
const handleBindLoneChange = () => {
  message.success(t('操作成功'));
  // update();
};


watch(
  () => productStore.currentProduct,
  (val) => {
    if (val) {
      pageStore.product_uuid = val;
      pageStore.searchParams['lender'] = '';
      tableSearchRef.value?.resetLender?.();
      tabChange();
    }
  },
  { immediate: true }
);
</script>
