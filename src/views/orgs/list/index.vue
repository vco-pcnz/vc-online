<template>
  <div>
    <div class="types">
      <div class="cidBox">
        <div v-for="item in categoryData" :key="item.id" class="cidBoxItem" :class="{ active: cid == item.id }" @click="tabChange(item.id)">
          {{ item.name }}{{item.id?'s':""}}
        </div>
      </div>
      <a-button type="cyan" shape="round" @click="navigationTo('/orgs/form/add')">{{ t('添加组织') }}</a-button>
    </div>

    <div class="mt-5">
      <table-search></table-search>
      <div class="mt-10">
        <vco-table-tool>
          <template #left>
            <!-- <a-button type="cyan" :disabled="!rowSelection.length">{{
                        t("指派角色")
                      }}</a-button> -->
          </template>
          <template #right>
            <vco-table-sort v-model="sortType" v-model:value="sortValue" :type-data="sortTypeData"></vco-table-sort>
          </template>
        </vco-table-tool>

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
                :show-total="total => t('共{0}条', [total])"
                @change="orgsStore.setPaginate" />
            </div>
          </a-spin>
        </div>
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
    value: '',
  },
  {
    label: t('名字'),
    value: 'firstName',
  },
  {
    label: t('ID'),
    value: 'id',
  },
  {
    label: t('注册日期'),
    value: 'create_time',
  },
];

const tabChange = val => {
  cid.value = val;
  orgsStore.setSearchParams({ cid: cid.value });
};

const rowSelection = computed(() => {
  return orgsStore.list.filter(item => item.checked);
});

const currentCheckAll = ref(false);
const checkHandle = flag => {
  currentCheckAll.value = flag;
  orgsStore.list.forEach(item => (item.checked = flag));
};

const categoryData = computed(() => {
  return [
    {
      name: t('全部'),
      id: '',
    },
    ...orgsStore.category,
  ];
});

onMounted(() => {
  cid.value = orgsStore.searchParams.cid
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
      [asc]: undefined,
    };
  } else {
    params = {
      [desc]: undefined,
      [asc]: newSortValue,
    };
  }
  orgsStore.setSearchParams(params);
});
</script>

<style lang="less" scoped>
.table-content {
  width: 100%;
  min-height: 300px;
}
.types {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #808080;
  padding-bottom: 20px;
  align-items: flex-end;
}
.cidBox {
  display: flex;
  align-items: center;
  gap: 5px;
  .cidBoxItem {
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
