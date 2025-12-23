<template>
  <div class="nav-content">
    <div v-for="item in tabList" :key="item.value" class="nav-link" :class="{ active: item.value === searchForm.status }" @click="handChange(item)">
      {{ item.name }}
    </div>
  </div>
  <div class="flex justify-between items-end mt-5">
    <vco-page-tab
      :tabData="[
        ...moduleData,
        ...(hasPermission('task:other')
          ? [
              {
                label: t('其他'),
                hiden: false,
                value: 'other',
                num: tab_num?.other
              }
            ]
          : [])
      ]"
      v-model:current="searchForm.module"
    ></vco-page-tab>
    <TableSearch :module="searchForm.module" @search="updateSearchForm"></TableSearch>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import TableSearch from './TableSearch.vue';
import { useUserStore } from '@/store';
import { hasPermission } from '@/directives/permission/index';
import { cloneDeep } from 'lodash';
import useProductStore from '@/store/modules/product';
const productStore = useProductStore();
const { t } = useI18n();

const emits = defineEmits(['search']);

const props = defineProps({
  tableLoading: {
    type: Boolean,
    default: false
  },
  tab_num: {
    type: Object,
    default: () => {
      return {
        loan: 2,
        request: 1,
        other: 0
      };
    }
  }
});

const tabList = ref([
  { name: t('待处理'), value: '0' },
  { name: t('已完成'), value: '10' }
]);

const userStore = useUserStore();

const moduleData = computed(() => {
  return [
    {
      label: t('全部'),
      value: '',
      num: props.tab_num?.loan + props.tab_num?.request + props.tab_num?.other
    },
    {
      label: t('借款'),
      value: 'loan',
      num: props.tab_num?.loan
    },
    {
      label: t('请求1'),
      value: 'request',
      num: props.tab_num?.request
    }
  ];
});

const searchForm = ref({
  status: '0',
  module: '',
  borrower_search_type: '',
  project_search_type: '',
  project_keyword: ''
});

const handChange = (data) => {
  searchForm.value.status = data.value;
};

const updateSearchForm = (val) => {
  searchForm.value = { ...searchForm.value, ...val };
};

const status_type = computed(() => ({
  status: searchForm.value.status,
  ctype: searchForm.value.ctype
}));

watch(
  () => status_type,
  (val) => {
    userStore.taskInfoParams = {
      status: searchForm.value.status,
      ctype: searchForm.value.ctype
    };
    setTimeout(() => {
      userStore.getTaskNumInfo();
    }, 500);
  },
  { deep: true }
);

watch(
  () => searchForm.value,
  (val) => {
    if(!productStore.currentProduct) return;
    let updateData = cloneDeep(searchForm.value);
    if (searchForm.value.module === 'other') {
      Object.assign(updateData, {
        ctype: '',
        borrower_keyword: '',
        borrower_search_type: '',
        project_search_type: '',
        project_keyword: ''
      });
    } else {
      Object.assign(updateData, {
        key: '',
        keywords: ''
      });
    }
    emits('search', updateData);
  },
  { deep: true }
);

watch(
  () => productStore.currentProduct,
  (val) => {
    if (val) {
      searchForm.value.product_uuid = productStore.currentProduct;
    }
  },{immediate: true}
);
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
.nav-content {
  display: flex;
  align-items: center;
  gap: 20px;
  border-bottom: 1px solid #808080;
  padding-bottom: 20px;
  .nav-link {
    display: block;
    background-color: #f3ede5;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 500;
    color: #272727;
    border-radius: 40px;
    transition: all 0.3s ease;
    cursor: pointer;
    &.active {
      background-color: #272727;
      color: #fff;
    }
    &:hover {
      background-color: #272727;
      color: #fff;
    }
  }
}
</style>
