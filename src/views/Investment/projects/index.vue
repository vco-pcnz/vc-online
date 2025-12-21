<template>
  <DetailLayout :title="t('项目')" active-tab="projects"></DetailLayout>

  <vco-product-tab v-model:current="pageStore.product_uuid" @change="tabChange">
    <div class="flex justify-end flex-1">
      <vco-popconfirm v-if="hasPermission('Investment:unbindProject')" :formParams="{ id: invest_id, uuids: selectKeys }" url="invest/unbindProject" :disabled="!selectKeys.length" :tip="t('确定取消绑定选中的项目吗？')" @update="update()">
        <a-button type="cyan" :disabled="!selectKeys.length" class="mr-3" shape="round">{{ t('取消绑定项目') }}</a-button>
      </vco-popconfirm>

      <a-button v-if="hasPermission('Investment:bindObject')" type="cyan" shape="round" @click="setOpenProjects(true)">{{ t('绑定项目') }}</a-button>
      <vco-import
        v-if="hasPermission('Investment:bindObject')"
        type="project"
        accept=".xls, .xlsb, .xlsx, .csv, .doc, .docx"
        :params="{ id: invest_id }"
        imporUrl="/invest/bindProjectImport"
        @change="handleImportChange"
        @update:loading="handleImportLoading"
      >
        <a-button type="cyan" shape="round" class="ml-3" :loading="uploadLoading">{{ t('批量绑定项目') }}</a-button>
      </vco-import>
    </div>
  </vco-product-tab>
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
  <BindLone v-model:visible="open_projects" :selectedData="bindData" :id="invest_id" @update="handleBindLoneChange" />
</template>

<script setup name="Projects">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import TableSearch from './TableSearch.vue';
import TableBlock from './TableBlock.vue';
import { useInvestment_project } from '@/store';
import { investBindData } from '@/api/invest';
import { useRoute } from 'vue-router';
import BindLone from './BindLone.vue';
import DetailLayout from '../components/detailLayout.vue';
import { hasPermission } from '@/directives/permission/index';
import { message } from 'ant-design-vue';

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
const uploadLoading = ref(false);

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

const handleImportLoading = (val) => {
  uploadLoading.value = val;
};

const handleImportChange = () => {
  uploadLoading.value = false;
  update();
  message.success(t('操作成功'));
};

const handleBindLoneChange = () => {
  message.success(t('操作成功'));
  update();
};

const bindData = ref([]);
const loadInvestBindData = () => {
  investBindData({ id: invest_id.value, type: 1 }).then((res) => {
    bindData.value = res.projects;
  });
};



const update = () => {
  // 清空表格勾选后再刷新数据
  selectKeys.value = [];
  loadInvestBindData();
  tabChange();
};

const invest_id = ref('');
onMounted(() => {
  invest_id.value = route.query.uuid;
  loadInvestBindData();
});
</script>
