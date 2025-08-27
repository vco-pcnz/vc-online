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
                num: searchForm.module == 'other' && !tableLoading ? currentTotal : userStore.taskInfo.other
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
const { t } = useI18n();

const emits = defineEmits(['search']);

const props = defineProps({
  tableLoading: {
    type: Boolean,
    default: false
  },
  currentTotal: {
    type: [String, Number]
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
      num: !searchForm.value.module && !props.tableLoading ? props.currentTotal : userStore.taskInfo.all
    },
    {
      label: t('借款'),
      value: 'loan',
      num: searchForm.value.module == 'loan' && !props.tableLoading ? props.currentTotal : userStore.taskInfo.project
    },
    {
      label: t('请求1'),
      value: 'request',
      num: searchForm.value.module == 'request' && !props.tableLoading ? props.currentTotal : userStore.taskInfo.request
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
