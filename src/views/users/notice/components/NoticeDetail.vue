<template>
  <span class="arrow arrow-left" @click="handlePrevious">
    <i class="iconfont">&#xe794;</i>
  </span>
  <span class="arrow arrow-right" @click="handleNext">
    <i class="iconfont">&#xe794;</i>
  </span>
  <div class="header">
    <h1>{{ noticeDetail.title }}</h1>
    <p>{{ noticeDetail.create_time }}</p>
  </div>
  <p class="content">{{ noticeDetail.content }}</p>
</template>

<script setup>
import { onMounted, computed } from "vue";
import { useNoticeStore } from "@/store";

const noticeStore = useNoticeStore();
const noticeDetail = computed(() => noticeStore.noticeDetail);

const handlePrevious = () => {};

const handleNext = () => {};

// TODO:在获取详情后直接调用已读接口
// onMounted(() => {
//   const { id, look } = noticeStore.noticeDetail;
//   if (!look && id) {
//     noticeStore.updateNoticeStatus({ ids: [id] });
//   }
// });
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
