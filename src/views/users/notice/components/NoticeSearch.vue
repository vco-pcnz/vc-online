<template>
  <vco-page-search class="search-container">
    <vco-page-search-item>
      <a-select :placeholder="t('请选择')" v-model:value="searchForm.type">
        <a-select-option
          v-for="(item, index) in statusData"
          :key="item.value || index"
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

const emits = defineEmits(["search"]);

const { t } = useI18n();

const statusData = [
  {
    label: t("全部"),
    value: "",
  },
  {
    label: t("未读"),
    value: "1",
  },
  {
    label: t("已读"),
    value: "2",
  },
];

const KeywordsData = [
  {
    label: t("关键字"),
    value: "",
  },
];

const searchForm = ref({
  type: "",
  keywords: "",
});

const searchHandle = () => {
  emits("search", data);
};
</script>

<style scoped lang="less">
.search-container {
  margin-top: 0;
  gap: 5px;
}
</style>
