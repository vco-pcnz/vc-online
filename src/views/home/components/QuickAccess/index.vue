<template>
  <div class="flex justify-between title">
    <div class="bold fs_2xl">{{ t('快捷入口') }}</div>
    <div class="flex gap-1 items-center"><i class="iconfont">&#xe604;</i>{{ t('设置1') }}</div>
  </div>
  <div class="wrapper">
    <div class="item" v-for="(item, index) in 6" :key="index">
      <i class="iconfont">&#xe679;</i>
      <p>放款</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<style lang="less" scoped>
.title {
  border-bottom: 1px solid #dbdbdb;
  padding: 8px 15px;
}
.wrapper {
  display: flex;
  flex-wrap: wrap;
  padding: 10px 15px 0;
  .item {
    margin-right: 50px;
    text-align: center;
    margin-bottom: 15px;
    &:nth-child(5n) {
      margin-right: 0;
    }
    .iconfont {
      font-size: 30px;
    }
    p {
      line-height: 1;
    }
  }
}
</style>
