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
            <div class="mt-5">
              <a-pagination
                size="small"
                :total="50"
                show-size-changer
                show-quick-jumper
                :show-total="(total) => t('共{0}条', [total])"
              />
            </div>
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
  console.log(currentTab.value);
};

const searchHandle = (data) => {
  console.log("search", data);
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
const tableData = ref([
  {
    id: "VCO202411240001",
    project_name: "张小美普通贷款项目",
    project_images:
      "https://pcnz-staging-api.s3.ap-southeast-2.amazonaws.com/project/d169c5e8-7abe-4466-9b69-c98f535f5e8f/30621/AzMYrljhQtVU7ALbHdERn63nMT0oOV6QVEwSB9kr.jpg",
    address:
      "Corporate headquarters and logistics centre in Mansfield, Texas USA.",
    loan_money: 99999999,
    borrower: "张小美",
    borrower_ver: true,
    borrower_email: "misszhang@gmail.com",
    borrower_email_ver: false,
    borrower_phone: "+86 18888888881",
    borrower_phone_ver: false,
    openDate: "",
    maturityDate: "",
    maxLvr: "70%",
    createDate: "2023-01-16",
    lm: {
      avatar: "",
      name: "Miss Zhang",
    },
    checked: false,
    status: "审核中",
    op: true,
  },
  {
    id: "VCO202411240002",
    project_name: "张小美普通贷款项目2张小美普通贷款项目2张小美普通贷款项目2",
    project_images: "",
    address:
      "Corporate headquarters and logistics centre in Mansfield, Texas USA.",
    loan_money: 99999999,
    borrower: "张小美",
    borrower_ver: true,
    borrower_email: "misszhang@gmail.com",
    borrower_email_ver: true,
    borrower_phone: "+86 18888888881",
    borrower_phone_ver: false,
    openDate: "2023-06-20",
    maturityDate: "2024-02-12",
    maxLvr: "20%",
    createDate: "2025-01-16",
    checked: false,
    lm: {
      avatar: "",
      name: "Miss ZhangZhangZhangZhang",
    },
    status: "带提交",
    op: false,
  },
  {
    id: "VCO202411240003",
    project_name: "张小美普通贷款项目3",
    project_images: "",
    address:
      "Corporate headquarters and logistics centre in Mansfield, Texas USA.",
    loan_money: 99999999,
    borrower: "张小美",
    borrower_ver: true,
    borrower_email: "misszmisszhangmisszhanghang@gmail.com",
    borrower_email_ver: true,
    borrower_phone: "+86 18888888881",
    borrower_phone_ver: true,
    openDate: "2023-02-20",
    maturityDate: "2024-02-12",
    maxLvr: "60%",
    createDate: "2024-11-16",
    checked: false,
    status: "审核中",
    op: true,
  },
]);

onMounted(() => {
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
