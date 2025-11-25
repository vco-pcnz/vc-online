<template>
  <DetailLayout :title="t('项目')" active-tab="projects"></DetailLayout>

  <product-tab v-model:current="pageStore.product_uuid" @change="tabChange">
    <div class="flex justify-end flex-1">
      <vco-popconfirm v-if="hasPermission('Investment:unbindProject')" :formParams="{ id: invest_id, uuids: selectKeys }" url="invest/unbindProject" :disabled="!selectKeys.length" :tip="t('确定取消绑定选中的项目吗？')" @update="update()">
        <a-button type="cyan" :disabled="!selectKeys.length" class="mr-3" shape="round">{{ t('取消绑定项目') }}</a-button>
      </vco-popconfirm>

      <a-button v-if="hasPermission('Investment:bindObject')" type="cyan" shape="round" @click="setOpenProjects(true)">{{ t('绑定项目') }}</a-button>
    </div>
  </product-tab>
  <vco-page-tab class="mt-5" :tabData="tabData" v-model:current="pageStore.sta" @change="tabChange"></vco-page-tab>

  <TableSearch class="mb-5" ref="tableSearchRef" :type="pageStore.sta == 1 ? 'open' : 'closed'"></TableSearch>

  <a-spin :spinning="pageStore.loading" size="large">
    <div class="table-content">
      <table-block :table-data="pageStore.list" v-model:keys="selectKeys" :type="pageStore.sta == 1 ? 'current' : 'closed'"></table-block>
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
  <BindLone v-model:visible="open_projects" :selectedData="bindData" :id="invest_id" @update="update" />
</template>

<script setup name="Projects">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import TableSearch from './TableSearch.vue';
import TableBlock from './TableBlock.vue';
import { useInvestment_project } from '@/store';
import ProductTab from '@/views/projects/components/ProductTab.vue';
import { investBindData } from '@/api/invest';
import { useRoute } from 'vue-router';
import BindLone from './BindLone.vue';
import DetailLayout from '../components/detailLayout.vue';
import { hasPermission } from '@/directives/permission/index';

const route = useRoute();

const { t } = useI18n();
const pageStore = useInvestment_project();
const current_num = computed(() => pageStore.otherInfo['1']);
const closed_num = computed(() => pageStore.otherInfo['2']);

const tabData = ref([
  {
    label: t('当前项目'),
    value: 1,
    num: current_num
  },
  {
    label: t('已关闭的项目'),
    value: 2,
    num: closed_num
  }
]);

const tableSearchRef = ref();
const selectKeys = ref([]);

const tabChange = () => {
  pageStore.pagination.page = 1;
  pageStore.searchParams['order'] = 'desc';
  pageStore.searchParams['id'] = route.query.uuid;
  pageStore.searchParams['sort'] = 'start_date';
  if (tableSearchRef.value) {
    tableSearchRef.value.searchHandle();
  } else {
    pageStore.getList();
  }
};

const open_projects = ref(false);
const setOpenProjects = (flag) => {
  open_projects.value = flag;
};

const bindData = ref([]);
const loadInvestBindData = () => {
  investBindData({ id: invest_id.value, type: 1 }).then((res) => {
    bindData.value = res.projects;
  });
};

const update = () => {
  loadInvestBindData();
  tabChange();
};

const invest_id = ref('');
onMounted(() => {
  invest_id.value = route.query.uuid;
  loadInvestBindData();
});
</script>
