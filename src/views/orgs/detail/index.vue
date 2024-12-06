<template>
  <div class="orgsDetail">
    <vco-page-panel :title="detail?.name" :isBack="true">
      <a-button type="cyan" shape="round" @click="update">
        {{ t('更新') }}
      </a-button>
      <a-button v-if="!detail?.pid" type="cyan" shape="round" @click="navigationTo({ path: '/orgs/form/add', query: { uuid: detail.uuid } })">
        {{ t('添加人员') }}
      </a-button>
    </vco-page-panel>
    <div class="orgsDetail-content">
      <div class="orgsDetail-left">
        <Detail @getDetail="getDetail"></Detail>
      </div>

      <div class="orgsDetail-right">
        <div style="padding: 0 24px">
          <table-search></table-search>
        </div>
        <div class="mt-10">
          <vco-table-tool>
            <template #left></template>
            <template #right>
              <div style="padding: 0 30px">
                <vco-table-sort v-model="sortType" v-model:value="sortValue" :type-data="sortTypeData"></vco-table-sort>
              </div>
            </template>
          </vco-table-tool>

          <div class="mt-5">
            <a-spin :spinning="orgsDetailStore.loading" size="large">
              <div style="padding: 24px">
                <div class="table-content">
                  <table-block :table-data="orgsDetailStore.list" :indeterminate="Boolean(rowSelection.length && rowSelection.length !== orgsDetailStore.list.length)" @check="checkHandle"></table-block>
                </div>
                <div class="mt-5" v-if="orgsDetailStore.total">
                  <a-pagination
                    size="small"
                    :total="orgsDetailStore.total"
                    :pageSize="orgsDetailStore.pagination.limit"
                    :current="orgsDetailStore.pagination.page"
                    show-size-changer
                    show-quick-jumper
                    :show-total="(total) => t('共{0}条', [total])"
                    @change="orgsDetailStore.setPaginate"
                  />
                </div>
              </div>
            </a-spin>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Detail from '../components/detail.vue';
import TableSearch from './components/TableSearch.vue';
import TableBlock from './components/TableBlock.vue';
import { navigationTo } from '@/utils/tool';
import { useOrgsDetailStore } from '@/store';
import { useRoute } from 'vue-router';
import { stakeChildMebSync } from '@/api/orgs';
const route = useRoute();

const { t } = useI18n();
const orgsDetailStore = useOrgsDetailStore();
const detail = ref(null);

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

const rowSelection = computed(() => {
  return orgsDetailStore.list.filter((item) => item.checked);
});

const currentCheckAll = ref(false);
const checkHandle = (flag) => {
  currentCheckAll.value = flag;
  orgsDetailStore.list.forEach((item) => (item.checked = flag));
};

const getDetail = (val) => {
  detail.value = val;
  // 加载数据
  orgsDetailStore.setSearchParams({ uuid: route.query.uuid });
};

const update = () => {
  stakeChildMebSync({ uuid: route.query.uuid }).then((res) => {
    orgsDetailStore.setSearchParams({ uuid: route.query.uuid });
  });
};

onMounted(() => {
  orgsDetailStore.list = []
  // 加载分类
  orgsDetailStore.getCategory();
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
  orgsDetailStore.setSearchParams(params);
});
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
.table-content {
  width: 100%;
  min-height: 200px;
  padding-top: 5px;
}

.orgsDetail-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  align-items: flex-start;
  .orgsDetail-left {
    background-color: #faf9f9;
    border-radius: 12px;
  }
  .orgsDetail-right {
    flex: 1;
    background-color: #faf9f9;
    border-radius: 12px;
    min-width: 0;
  }
}
</style>
