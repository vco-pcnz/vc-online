<template>
  <div class="page-nav-content">
    <div class="nav-content">
      <router-link v-for="link in navData" :key="link.path" :to="link.path" class="nav-link" :class="{ active: isActive(link.path) }">
        {{ t(link.title) }}
        <template v-if="supPath === '/tasks'">
          <span v-if="link.path === '/tasks/projects'">({{ taskInfo.project }})</span>
          <span v-if="link.path === '/tasks/loan'">({{ taskInfo.request }})</span>
        </template>
        <template v-else>
          <span v-if="link.num">({{ link.num }})</span>
        </template>
      </router-link>
    </div>
    <div class="handle-content">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { cloneDeep } from 'lodash';
import { useUserStore } from '@/store';
import { useRoute } from 'vue-router';

const props = defineProps({
  supPath: {
    type: String,
    required: true
  }
});

const { t } = useI18n();
const route = useRoute();
const userStore = useUserStore();

// 这里是待办数量
const taskInfo = computed(() => userStore.taskInfo);

const navData = ref([]);

const getNavData = () => {
  const data = userStore.routerInfo || [];
  const dataArr = cloneDeep(data);
  const requestsMenu = dataArr.find((item) => item.path === props.supPath);
  const child = requestsMenu.children || [];

  const resData = child
    .filter((item) => !item.meta.hide)
    .map((item) => {
      return {
        title: item.meta.title,
        path: item.path,
        num: item.num || 0
      };
    });
  navData.value = resData;
};

const isActive = (path) => route.path === path;

onMounted(() => {
  getNavData();
});

const setNum = (num) => {
  const data = userStore.routerInfo || [];
  const requestsMenu = data.find((item) => item.path === props.supPath);
  const child = requestsMenu.children || [];
  child.find((item) => item.path === route.path).num = num;
  navData.value.find((item) => item.path === route.path).num = num;
};

// 暴露方法给父组件
defineExpose({
  setNum
});
</script>

<style lang="less" scoped>
.page-nav-content {
  border-bottom: 1px solid #808080;
  padding-bottom: 20px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  .nav-content {
    display: flex;
    align-items: center;
    gap: 5px;
    .nav-link {
      display: block;
      background-color: #f3ede5;
      padding: 12px 20px;
      font-size: 14px;
      font-weight: 500;
      color: #272727;
      border-radius: 40px;
      transition: all 0.3s ease;
      &.active {
        background-color: #272727;
        color: #fff;
      }
      &:hover {
        background-color: #272727;
        color: #fff;
      }
    }
  }
  .handle-content {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}
</style>
