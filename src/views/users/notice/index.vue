<template>
  <profile-layout active-tab="notice">
    <template #content>
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="all" :tab="t('全部')">
          <notice-list :tableData="noticeList" />
        </a-tab-pane>
        <a-tab-pane key="system" :tab="t('系统')">2</a-tab-pane>
        <a-tab-pane key="business" :tab="t('业务')">3</a-tab-pane>

        <template #rightExtra>
          <a-button>Right Extra Action</a-button>
        </template>
      </a-tabs>
    </template>
  </profile-layout>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import profileLayout from "../components/profile-layout.vue";
import NoticeList from "./components/NoticeList.vue";
import { getNoticeList } from "@/api/notice";

const { t } = useI18n();
const activeKey = ref("all");
const noticeList = reactive([]);

onMounted(() => {
  getNoticeList().then((res) => {
    Object.assign(noticeList, res);
  });
});
</script>

<style scoped lang="less"></style>
