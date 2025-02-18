<template>
  <div class="mb-5">
    <table-search @search="search"></table-search>
  </div>
  <vco-table-tool>
    <template #left>
      <a-popconfirm :title="t('确定要移除吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" :disabled="Boolean(!rowSelection.length)" @confirm="remove">
        <a-button type="danger" :disabled="!rowSelection.length">{{ t('移除') }}</a-button>
      </a-popconfirm>
    </template>
    <template #right>
      <vco-table-sort v-model="sortType" v-model:value="sortValue" :type-data="sortTypeData"></vco-table-sort>
    </template>
  </vco-table-tool>

  <div class="mt-5">
    <a-spin :spinning="loading" size="large">
      <div class="table-content">
        <table-block ref="tableRef" :table-data="tableData" v-model:keys="rowSelection" @loadData="loadData"></table-block>
      </div>
      <div class="mt-5" v-if="total">
        <a-pagination size="small" :total="total" :pageSize="pagination.limit" :current="pagination.page" show-size-changer show-quick-jumper :show-total="(total) => t('共{0}条', [total])" @change="setPaginate" />
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import TableSearch from './TableSearch.vue';
import TableBlock from './TableBlock.vue';
import { navigationTo } from '@/utils/tool';
import { getRelation, relationDel } from '@/api/users';

const props = defineProps({
  uuid: {
    type: String
  }
});
const { t } = useI18n();

const tableRef = ref();
const sortType = ref('desc');
const sortValue = ref('');
const loading = ref(false);
const searchParams = ref({});
const sortParams = ref({});
const rowSelection = ref([]);
const tableData = ref([]);
const total = ref(0);
const pagination = ref({
  page: 1,
  limit: 2
});

const loadData = () => {
  loading.value = true;
  getRelation({ suuid: props.uuid, ...pagination.value, ...searchParams.value, ...sortParams.value })
    .then((r) => {
      tableData.value = r.data;
      total.value = r.count;
      loading.value = false;
      resolve(r.data);
    })
    .catch((e) => {
      loading.value = false;
    });
};

const sortTypeData = ref([
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
]);

const setPaginate = (page, limit) => {
  pagination.value = {
    page,
    limit
  };
  loadData();
};

const search = (val) => {
  searchParams.value = val;
  reload();
};

onMounted(() => {});

const reload = () => {
  pagination.value.page = 1;
  loadData();
};

// 移除
const remove = () => {
  relationDel({ uuids: rowSelection.value, type: 1 }).then((r) => {
    loadData();
    tableRef.value.resetSelect();
  });
};

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

  sortParams.value = params;
  loadData();
});

watch(
  () => props.uuid,
  (val) => {
    if (val) {
      reload();
    }
  },
  { deep: true, immediate: true }
);
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
.table-content {
  width: 931px;
  min-height: 200px;
  padding-top: 5px;
}
.page-search-content {
  margin-top: 0;
}
</style>
