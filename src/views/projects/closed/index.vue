<template>
  <div>
    <vco-page-nav sup-path="/projects"></vco-page-nav>

    <div class="mt-5" v-if="false">
      <div class="flex justify-end" >
        <a-input-search v-model:value="value" placeholder="input search text" style="width: 200px" @search="onSearch" />

      </div>
      <div class="mt-5">
        <a-spin :spinning="orgsStore.loading" size="large">
          <div class="table-content">
            <table-block :table-data="orgsStore.list" :indeterminate="Boolean(rowSelection.length && rowSelection.length !== orgsStore.list.length)" @check="checkHandle"></table-block>
          </div>
          <div class="mt-5" v-if="orgsStore.total">
            <a-pagination
              size="small"
              :total="orgsStore.total"
              :pageSize="orgsStore.pagination.limit"
              :current="orgsStore.pagination.page"
              show-size-changer
              show-quick-jumper
              :show-total="(total) => t('共{0}条', [total])"
              @change="orgsStore.setPaginate"
            />
          </div>
        </a-spin>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import TableSearch from './components/TableSearch.vue';
import TableBlock from './components/TableBlock.vue';
import { navigationTo } from '@/utils/tool';
import { useOrgsStore } from '@/store';

const { t } = useI18n();
const orgsStore = useOrgsStore();

const cid = ref('');
const sortType = ref('desc');
const sortValue = ref('');
const sortTypeData = [
  {
    label: t('默认'),
    value: ''
  },
  {
    label: t('名字'),
    value: 'firstName'
  },
  {
    label: t('ID'),
    value: 'id'
  },
  {
    label: t('注册日期'),
    value: 'create_time'
  }
];

const tabChange = (val) => {
  cid.value = val;
  orgsStore.setSearchParams({ cid: cid.value });
};

const rowSelection = computed(() => {
  return orgsStore.list.filter((item) => item.checked);
});

const currentCheckAll = ref(false);
const checkHandle = (flag) => {
  currentCheckAll.value = flag;
  orgsStore.list.forEach((item) => (item.checked = flag));
};

const categoryData = computed(() => {
  return [
    {
      name: t('全部'),
      id: ''
    },
    ...orgsStore.category
  ];
});

onMounted(() => {
  cid.value = orgsStore.searchParams.cid;
  // 加载数据
  orgsStore.getList();
  // 加载分类
  orgsStore.getCategory();
});

watch([sortType, sortValue], ([newSortType, newSortValue]) => {
  let desc = 'sort__desc';
  let asc = 'sort__asc';
  let params = {};
  if (newSortType === 'desc') {
    params = {
      [desc]: newSortValue,
      [asc]: undefined
    };
  } else {
    params = {
      [desc]: undefined,
      [asc]: newSortValue
    };
  }
  orgsStore.setSearchParams(params);
});
</script>
