<template>
  <a-spin :spinning="loading" size="large">
    <div class="flex justify-between title items-center">
      <div class="bold fs_2xl">
        {{ t('待办事项1') }}
        ({{ userStore.taskInfo.total }})
      </div>
      <div class="cursor-pointer" @click="navigationTo('/tasks')">{{ t('更多') }}</div>
    </div>
    <div class="wrapper">
      <div class="item cursor-pointer" v-for="(item, index) in list" :key="index" @click="navigationTo('/tasks?type=' + item.type)">
        <!-- <i class="iconfont">&#xe679;</i> -->
        <img class="icon" :src="item.icon" alt="" />
        <div>
          <p class="num" :class="{ active: item.backlog_count > 0 }">{{ item.backlog_count }}</p>
          <p :title="item.name" class="name">{{ item.name }}</p>
        </div>
      </div>
      <div style="text-align: center; width: 100%">
        <a-empty v-if="!list.length && !loading" :image="simpleImage" style="min-height: 100px" />
      </div>
    </div>
  </a-spin>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Empty } from 'ant-design-vue';
import { navigationTo } from '@/utils/tool';
import { useUserStore } from '@/store';
import { quick } from '@/api/home/index';

const { t } = useI18n();
const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;
const userStore = useUserStore();
const list = ref([]);
const loading = ref(false);

const geList = () => {
  loading.value = true;
  quick({ ptype: '2' })
    .then((res) => {
      list.value = res;
    })
    .finally(() => {
      loading.value = false;
    });
};
onMounted(() => {
  geList();
});
</script>

<style lang="less" scoped>
.title {
  border-bottom: 1px solid #dbdbdb;
  padding: 8px 15px;
}
.wrapper {
  display: flex;
  flex-wrap: wrap;
  padding: 10px 30px;
  .item {
    display: flex;
    align-items: center;
    gap: 5px;
    height: 90px;
    padding: 0 10px;
    box-sizing: border-box;
    border: 1px solid transparent;
    &:hover {
      border: 1px solid #dbdbdb;
    }
    .iconfont {
      font-size: 40px;
    }
    .icon {
      display: inline-block;
      width: 38px;
      height: auto;
      max-height: 60px;
    }
    .name {
      white-space: nowrap; /* 禁止换行 */
      overflow: hidden; /* 隐藏超出部分 */
      text-overflow: ellipsis; /* 显示省略号 */
      width: 90px; /* 需要设置一个宽度 */
    }
    .num {
      font-size: 16px;
      position: relative;
      top: -7px;
    }
    .active {
      color: red;
    }
  }
}
</style>
