<template>
  <span
    class="arrow arrow-left"
    @click="handlePrevious"
    v-if="noticeDetail.previous_id"
  >
    <i class="iconfont">&#xe794;</i>
  </span>
  <span
    class="arrow arrow-right"
    @click="handleNext"
    v-if="noticeDetail.next_id"
  >
    <i class="iconfont">&#xe794;</i>
  </span>
  <div class="header">
    <h1>{{ noticeDetail.title }}</h1>
    <div>{{ noticeDetail.create_time }}</div>
  </div>
  <div class="content rich-text-content" v-html="noticeDetail.content"></div>
</template>

<script setup>
import { computed } from "vue";
import { useNoticeStore } from "@/store";

const noticeStore = useNoticeStore();
const noticeDetail = computed(() => noticeStore.noticeDetail);

const handlePrevious = () => {
  noticeStore.getNoticeDetail(noticeDetail.value.previous_id);
};

const handleNext = () => {
  noticeStore.getNoticeDetail(noticeDetail.value.next_id);
};
</script>

<style scoped lang="less">
@import "@/styles/variables.less";

.arrow:hover {
  cursor: pointer;
}

.iconfont {
  color: @clr_stone1;
}

.arrow-left {
  position: absolute;
  top: 15px;
  transform: rotate(-180deg);
}

.arrow-right {
  position: absolute;
  top: 15px;
  right: 30px;
  text-align: right;
}

.header {
  text-align: center;

  h1 {
    font-weight: 600;
    margin-bottom: 6px;
  }
}

.content {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid @clr_stone1;
}
</style>
