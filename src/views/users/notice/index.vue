<template>
  <profile-layout active-tab="notice">
    <template #content>
      <template v-if="!noticeStore.showDetail">
        <a-tabs v-model:activeKey="activeKey">
          <a-tab-pane key="all" :tab="t('全部')">
            <notice-list />
          </a-tab-pane>
          <a-tab-pane key="system" :tab="t('系统')">2</a-tab-pane>
          <a-tab-pane key="business" :tab="t('业务')">3</a-tab-pane>
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
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import profileLayout from "../components/profile-layout.vue";
import NoticeList from "./components/NoticeList.vue";
import NoticeSearch from "./components/NoticeSearch.vue";
import NoticeDetail from "./components/NoticeDetail.vue";
import { useNoticeStore } from "@/store";

const { t } = useI18n();
const activeKey = ref("all");
const noticeStore = useNoticeStore();

onMounted(() => {
  noticeStore.getNoticeList();
});
</script>

<style scoped lang="less"></style>
