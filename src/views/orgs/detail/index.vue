<template>
  <div class="orgsDetail">
    <div class="TabsPanel">
      <div class="Panel">
        <h2 class="Panel-Title">
          <a-tag class="Tag"> {{ orgsDetailStore.detail?.name }} </a-tag>
        </h2>
      </div>
      <div class="TabsPanel-Tab">
        <a-button type="cyan" shape="round" @click="navigationTo('/orgs/addOrgs')">{{ t('添加人员') }}</a-button>
      </div>
    </div>
    <div class="orgsDetail-content">
      <div class="orgsDetail-left">
        <Detail></Detail>
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
                  <table-block
                    :table-data="orgsDetailStore.list"
                    :indeterminate="Boolean(rowSelection.length && rowSelection.length !== orgsDetailStore.list.length)"
                    @check="checkHandle"></table-block>
                </div>
                <div class="mt-5" v-if="orgsDetailStore.total">
                  <a-pagination
                    size="small"
                    :total="orgsDetailStore.total"
                    :pageSize="orgsDetailStore.pagination.limit"
                    :current="orgsDetailStore.pagination.page"
                    show-size-changer
                    show-quick-jumper
                    :show-total="total => t('共{0}条', [total])"
                    @change="orgsDetailStore.setPaginate" />
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
import Detail from './components/detail.vue';
import TableSearch from './components/TableSearch.vue';
import TableBlock from './components/TableBlock.vue';
import { navigationTo } from '@/utils/tool';
import { useorgsDetailStore } from '@/store';
import { useRoute } from 'vue-router';
const route = useRoute();

const { t } = useI18n();
const orgsDetailStore = useorgsDetailStore();

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
  orgsDetailStore.setSearchParams({ cid: cid.value });
};

const rowSelection = computed(() => {
  return orgsDetailStore.list.filter(item => item.checked);
});

const currentCheckAll = ref(false);
const checkHandle = flag => {
  currentCheckAll.value = flag;
  orgsDetailStore.list.forEach(item => (item.checked = flag));
};

const categoryData = computed(() => {
  return [
    {
      name: t('全部'),
      id: '',
    },
    ...orgsDetailStore.category,
  ];
});

onMounted(() => {
  // 加载数据
  orgsDetailStore.getList(route.query.id);
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
      [asc]: undefined,
    };
  } else {
    params = {
      [desc]: undefined,
      [asc]: newSortValue,
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
}
.TabsPanel {
  display: grid;
  grid-template-columns: 1fr auto;
  margin-bottom: 40px;
  padding-bottom: 16px;
  border-bottom: 1px solid grey;

  .Panel {
    display: flex;
    justify-content: stretch;
    align-items: center;
    gap: 20px;

    .Panel-Avatar {
      flex-shrink: 0;
    }

    .Panel-Title {
      font-size: @fs_2xl;
      font-weight: bold;
      width: 100%;
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 12px;
    }

    .Tag {
      display: inline-flex;
      align-items: center;
      gap: 6.8px;
      height: 30px;
      padding: 10.2px 20.4px;
      border-radius: 37.4px;

      font-weight: 500;
      font-size: 14px;
      line-height: 2;
      letter-spacing: 1px;
      text-transform: uppercase;
      white-space: nowrap;
      padding: 15px 30px;
      background-color: @clr_charcoal;
      color: @clr_white;

      border-radius: 0 16px 16px 0;
      overflow: hidden;
    }
  }

  &-Tab {
    list-style: none;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 5px;
  }

  .tab-button {
    color: @clr_charcoal;
    background-color: transparent;
    border: 1px solid @clr_charcoal;
    padding: 4px 20px;
    border-radius: 55px;
  }

  .active-tab {
    color: @clr_yellow;
    border: 1px solid @clr_yellow;
  }
}

.orgsDetail-content {
  display: grid;
  grid-template-columns: 330px 1fr;
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
  }
}
</style>
