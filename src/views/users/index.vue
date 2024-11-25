<template>
  <div>
    <vco-page-nav sup-path="/users">
      <template #action>
        <a-button
          type="cyan"
          shape="round"
          @click="addUser"
          >{{ t("新增用户") }}</a-button
        >
      </template>
    </vco-page-nav>

    <div class="mt-5">
      <table-search @search="searchHandle"></table-search>
      <div class="mt-10">
        <vco-table-tool>
          <template #left>
            <a-button type="cyan" :disabled="!rowSelection.length">{{
              t("分配角色")
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
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { getUserList } from "@/api/users";
import TableSearch from "./components/TableSearch.vue";
import TableBlock from "./components/TableBlock.vue";

const { t } = useI18n();

const sortType = ref("desc");
const sortValue = ref("");
const sortTypeData = [
  {
    label: t("默认"),
    value: "",
  },
  {
    label: t("名字"),
    value: "name",
  },
  {
    label: t("ID"),
    value: "id",
  },
  {
    label: t("注册日期"),
    value: "create_time",
  },
];

const addUser = () => {
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
const tableData = ref([]);

onMounted(() => {
  getUserList().then(res => {
    tableData.value = res.data;
  });
})
</script>

<style lang="less" scoped>
.table-content {
  width: 100%;
  min-height: 300px;
}
</style>
