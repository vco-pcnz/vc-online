<template>
  <div class="flex justify-between title items-center">
    <div class="bold fs_2xl">{{ t('待办事项1') }}(10)</div>
    <div>{{ t('更多') }}</div>
  </div>
  <div class="wrapper">
    <div class="item" v-for="(item, index) in 10" :key="index">
      <i class="iconfont">&#xe679;</i>
      <div>
        <p class="num">10</p>
        <p>放款</p>
      </div>
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
    display: flex;
    align-items: center;
    gap: 5px;
    margin-right: 50px;
    margin-bottom: 15px;
    .iconfont {
      font-size: 40px;
    }
  }
}
</style>
