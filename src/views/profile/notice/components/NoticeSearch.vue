<template>
  <vco-page-search class="search-container">
    <vco-page-search-item>
      <a-select :placeholder="t('请选择')" v-model:value="searchForm.key">
        <a-select-option
          v-for="item in statusData"
          :key="item.value"
          :value="item.value"
        >
          {{ item.label }}
        </a-select-option>
      </a-select>
    </vco-page-search-item>

    <vco-page-search-item width="240">
      <vco-type-input
        v-model="searchForm.keywords"
        v-model:type="searchForm.keywords"
        :type-data="KeywordsData"
        :placeholder="t('关键字')"
      ></vco-type-input>
    </vco-page-search-item>

    <vco-page-search-item width="100%">
      <a-button @click="searchHandle"
        ><i class="iconfont">&#xe756;</i>{{ t("搜索") }}</a-button
      >
    </vco-page-search-item>
  </vco-page-search>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useNoticeStore } from "@/store";

const noticeStore = useNoticeStore();

const { t } = useI18n();

const statusData = [
  {
    label: t("全部"),
    value: "all",
  },
  {
    label: t("未读"),
    value: "unread",
  },
  {
    label: t("已读"),
    value: "already",
  },
];

const KeywordsData = [
  {
    label: t("关键字"),
    value: "",
  },
];

const searchForm = ref({
  key: "all",
  keywords: undefined,
});

const searchHandle = () => {
  noticeStore.setNoticeSearchParams(searchForm.value);
  noticeStore.getNoticeList();
};
</script>

<style scoped lang="less">
.search-container {
  margin-top: 0;
  gap: 5px;
}
</style>
