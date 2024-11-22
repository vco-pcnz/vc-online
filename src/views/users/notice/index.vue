<template>
  <profile-layout active-tab="notice">
    <template #content>
      <template v-if="!showDetail">
        <a-tabs v-model:activeKey="activeKey">
          <a-tab-pane key="all" :tab="t('全部')">
            <notice-list :tableData="noticeList" v-model:showDetail="showDetail" @selectNotice="handleSelectNotice" />
          </a-tab-pane>
          <a-tab-pane key="system" :tab="t('系统')">2</a-tab-pane>
          <a-tab-pane key="business" :tab="t('业务')">3</a-tab-pane>
          <template #rightExtra>
            <notice-search />
          </template>
        </a-tabs>
      </template>
      <template v-else>
        <notice-detail :noticeInfo="selectedNotice" v-model:showDetail="showDetail" />
      </template>
    </template>
  </profile-layout>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import profileLayout from "../components/profile-layout.vue";
import NoticeList from "./components/NoticeList.vue";
import NoticeSearch from "./components/NoticeSearch.vue";
import { getNoticeList } from "@/api/notice";
import NoticeDetail from "./components/NoticeDetail.vue";

const { t } = useI18n();
const activeKey = ref("all");
const noticeList = reactive([]);
const showDetail = ref(false);
const selectedNotice = ref(null);
const handleSelectNotice = (notice) => {
  selectedNotice.value = notice;
};

onMounted(() => {
  getNoticeList().then((res) => {
    Object.assign(noticeList, res);
  });
});
</script>

<style scoped lang="less"></style>
