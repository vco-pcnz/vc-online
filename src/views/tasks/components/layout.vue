<template>
  <div class="nav-content">
    <div v-for="item in tabList" :key="item.value" class="nav-link" :class="{ active: item.value === current }" @click="handChange(item)">
      {{ item.name }}
    </div>
  </div>
  <div class="flex justify-between items-end mt-5">
    <vco-page-tab :tabData="navData" v-model:current="isActive" @change="tabChange"></vco-page-tab>
    <TableSearch></TableSearch>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import TableSearch from './TableSearch.vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/store';
import { cloneDeep } from 'lodash';
const { t } = useI18n();

const emits = defineEmits(['update:current', 'change']);
const tabList = ref([
  { name: t('待处理'), value: '1' },
  { name: t('已完成'), value: '2' }
]);
const current = ref(tabList.value.length ? tabList.value[0].value : '');

const handChange = (data) => {
  current.value = data.value;
};

const userStore = useUserStore();

const navData = ref([]);

const getNavData = () => {
  const data = userStore.routerInfo || [];
  const dataArr = cloneDeep(data);
  const requestsMenu = dataArr.find((item) => item.path === '/tasks');
  const child = requestsMenu.children || [];

  const resData = child
    .filter((item) => !item.meta.hide)
    .map((item) => {
      let num = item.num || 0;
      if (item.path === '/tasks/projects') {
        num = userStore.taskInfo.project;
      }
      if (item.path === '/tasks/loan') {
        num = userStore.taskInfo.request;
      }
      if (item.path === '/tasks/other') {
        num = userStore.taskInfo.other;
      }

      return {
        label: t(item.meta.title),
        value: item.path,
        num: num
      };
    });
  navData.value = resData;
};

const isActive = (path) => route.path === path;

onMounted(() => {
  getNavData();
});

const tabChange = () => {};
watch(
  () => current.value,
  (val) => {
    emits('update:current', current.value);
    emits('change');
  },
  { immediate: true, deep: true }
);
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
.nav-content {
  display: flex;
  align-items: center;
  gap: 20px;
  border-bottom: 1px solid #808080;
  padding-bottom: 20px;
  .nav-link {
    display: block;
    background-color: #f3ede5;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 500;
    color: #272727;
    border-radius: 40px;
    transition: all 0.3s ease;
    cursor: pointer;
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
</style>
