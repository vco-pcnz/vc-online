<template>
  <span class="arrow arrow-left" @click="goBack">
    <i class="iconfont">&#xe794;</i>
  </span>
  <!-- <span class="arrow arrow-right" @click="handleNext">
    <i class="iconfont">&#xe794;</i>
  </span> -->
  <div class="header">
    <h1>{{ noticeStore.noticeDetail.title }}</h1>
    <p>{{ noticeStore.noticeDetail.create_time }}</p>
  </div>
  <p class="content">{{ noticeStore.noticeDetail.content }}</p>
</template>

<script setup>
import { onMounted } from "vue";
import { setNoticeRead } from "@/api/notice";
import { useNoticeStore } from "@/store";

const noticeStore = useNoticeStore();

const goBack = () => {
  noticeStore.setShowDetail(false);
};

const handleNext = () => {};

onMounted(() => {
  const id = noticeStore.noticeDetail.id;
  if (id) {
    // TODO
    // setNoticeRead({ids: [id]}).then(() => {
    //   noticeStore.getNoticeList();
    // });
  }
});
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
  }
}

.content {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid @clr_stone1;
}
</style>
