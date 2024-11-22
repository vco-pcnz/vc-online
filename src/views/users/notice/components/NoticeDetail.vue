<template>
  <div class="nav">
    <span class="arrow arrow-left" @click="goBack">
      <i class="iconfont">&#xe794;</i>
    </span>
    <!-- <span class="arrow arrow-right" @click="handleNext">
      <i class="iconfont">&#xe794;</i>
    </span> -->
  </div>
  <div class="header">
    <h1>{{ noticeInfo.title }}</h1>
    <p>{{ noticeInfo.create_time }}</p>
  </div>
  <p class="content">{{ noticeInfo.content }}</p>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
  noticeInfo: {
    type: Object,
    default: {},
  },
});

const emits = defineEmits(["update:showDetail"]);

const goBack = () => {
  emits("update:showDetail", false);
};

const handleNext = () => {};
</script>

<style scoped lang="less">
@import "@/styles/variables.less";
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

.nav {
  display: flex;
  justify-content: space-between;

  .arrow:hover {
    cursor: pointer;
  }

  .iconfont {
    color: @clr_stone1;
  }

  .arrow-left {
    transform: rotate(-180deg);
  }

  .arrow-right {
    text-align: right;
  }
}
</style>
