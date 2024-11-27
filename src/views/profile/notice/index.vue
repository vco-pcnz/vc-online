<template>
  <profile-layout active-tab="notice">
    <template #content>
      <template v-if="!noticeStore.showDetail">
        <a-tabs v-model:activeKey="activeKey">
          <a-tab-pane
            v-for="item in noticeTabPane"
            :key="item.key"
            :tab="item.name"
          >
            <notice-list />
          </a-tab-pane>
          <template #rightExtra>
            <notice-search />
          </template>
        </a-tabs>
      </template>
      <template v-else>
        <notice-detail />
      </template>
    </template>
  </profile-layout>
</template>

<script setup>
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import profileLayout from "../components/ProfileLayout.vue";
import NoticeList from "./components/NoticeList.vue";
import NoticeSearch from "./components/NoticeSearch.vue";
import NoticeDetail from "./components/NoticeDetail.vue";
import { useNoticeStore } from "@/store";

const { t } = useI18n();
const activeKey = ref(0);
const noticeStore = useNoticeStore();

const noticeTabPane = [
  {
    name: t("全部"),
    key: 0
  },
  {
    name: t("系统"),
    key: 1
  },
  {
    name: t("业务"),
    key: 2
  },
];

watch(
  () => activeKey.value,
  (val) => {
    noticeStore.setNoticeSearchParams({ sta: val });
    noticeStore.getNoticeList();
  },
  {
    immediate: true,
  }
);
</script>

<style scoped lang="less"></style>
