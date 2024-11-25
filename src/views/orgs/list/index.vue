<template>
  <div>
    <div class="types">
      <vco-page-tab
        :tabData="tabData"
        v-model:current="currentTab"
        @change="tabChange"
      ></vco-page-tab>
      <a-button
        type="cyan"
        shape="round"
        @click="navigationTo('/process/one')"
        >{{ t("添加组织") }}</a-button
      >
    </div>

    <div class="mt-5">
      <table-search @search="searchHandle"></table-search>
      <div class="mt-10">
        <vco-table-tool>
          <template #left>
            <a-button type="cyan" :disabled="!rowSelection.length">{{
              t("指派角色")
            }}</a-button>
          </template>
          <template #right>
            <vco-table-sort
              v-model="sortType"
              v-model:value="sortValue"
              :type-data="sortTypeData"
            ></vco-table-sort>
          </template>
        </vco-table-tool>

        <div class="mt-5">
          <a-spin :spinning="tableLoading" size="large">
            <div class="table-content">
              <table-block
                :table-data="tableData"
                :indeterminate="
                  Boolean(
                    rowSelection.length &&
                      rowSelection.length !== tableData.length
                  )
                "
                @check="checkHandle"
              ></table-block>
            </div>
            <vco-table-pagination
              v-model="pagination"
              @change="loadData"
            ></vco-table-pagination>
          </a-spin>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import TableSearch from "./components/TableSearch.vue";
import TableBlock from "./components/TableBlock.vue";
import VcoTablePagination from "@/components/vco-table-pagination/index.vue";
import { navigationTo } from "@/utils/tool";
import { getCategory, getList } from "@/api/orgs";

const { t } = useI18n();

const tabLayout = ref(0);
const currentTab = ref("");
const tabData = ref([]);

const sortType = ref("desc");
const sortValue = ref("");
const sortTypeData = [
  {
    label: t("默认"),
    value: "",
  },
  {
    label: t("创建时间"),
    value: "time",
  },
  {
    label: t("ID"),
    value: "id",
  },
  {
    label: t("贷款金额"),
    value: "amount",
  },
];

const tabChange = () => {
  pagination.value.page = 1;
  loadData();
};

const pagination = ref({
  count: 0,
  page: 1,
  limit: 2,
});

let params = {};
const searchHandle = (data) => {
  pagination.value.page = 1
  params = data;
  loadData();
};

const rowSelection = computed(() => {
  return tableData.value.filter((item) => item.checked);
});

const currentCheckAll = ref(false);
const checkHandle = (flag) => {
  currentCheckAll.value = flag;
  tableData.value.forEach((item) => (item.checked = flag));
};

const tableLoading = ref(false);
const tableData = ref([]);
const count = ref(0);

const loadData = () => {
  getList(
    Object.assign({}, pagination.value, params, { cid: currentTab.value }) || {}
  ).then((res) => {
    tableData.value = res.list;
    pagination.value.count = res.count;
  });
};

onMounted(() => {
  // 加载分类
  getCategory().then((res) => {
    if (res && res.length) {
      tabData.value = [{ label: "全部", value: "" }];
      res.map((item) => {
        tabData.value.push({
          label: item.name,
          value: item.id,
        });
      });
    }
  });

  // 加载列表数据
  loadData();
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
}
</style>
