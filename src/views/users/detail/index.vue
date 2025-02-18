<template>
  <div class="orgsDetail">
    <vco-page-panel :title="detail?.user_name" :isBack="true">
      <a-button type="cyan" shape="round" @click="navigationTo({ path: '/orgs/form/add', query: { uuid: detail?.uuid } })">
        {{ t('添加人员') }}
      </a-button>
    </vco-page-panel>
    <div class="orgsDetail-content">
      <div class="orgsDetail-left">
        <Detail @getDetail="getDetail"></Detail>
      </div>

      <div class="orgsDetail-right">
        <div style="padding: 0 24px">
          <table-search @search="search"></table-search>
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
            <a-spin :spinning="loading" size="large">
              <div style="padding: 24px">
                <div class="table-content">
                  <table-block :table-data="tableData"></table-block>
                </div>
                <div class="mt-5" v-if="total">
                  <a-pagination
                    size="small"
                    :total="total"
                    :pageSize="pagination.limit"
                    :current="pagination.page"
                    show-size-changer
                    show-quick-jumper
                    :show-total="(total) => t('共{0}条', [total])"
                    @change="setPaginate"
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
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Detail from '../components/detail.vue';
import TableSearch from './components/TableSearch.vue';
import TableBlock from './components/TableBlock.vue';
import { navigationTo } from '@/utils/tool';

const { t } = useI18n();

const sortType = ref('desc');
const sortValue = ref('');

const loading = ref(false)
const total = ref(0)
const pagination = ref({
      page: 1,
      limit: 10,
  
})
const tableData = ref([])

const setPaginate = () => {
  
}

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

});


const detail = ref({});


const getDetail = (val) => {
  detail.value = val;
  // 加载数据
};

const search = (val) => {
  console.log(val)
}

onMounted(() => {

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
