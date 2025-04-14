<template>
  <div class="flex justify-between nav-content-wrapper">
    <div class="nav-content">
      <div v-for="item in role_group" :key="item.code" class="nav-link" :class="{ active: item.code === current }" @click="change(item)">
        {{ item.name }}
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { systemDictData } from '@/api/system';

import { useUsersStore } from '@/store';
const usersStore = useUsersStore();

const role_group = ref([]);
const current = ref('');

const change = (data) => {
  current.value = data.code;
};

onMounted(() => {
  systemDictData('qt_role_group').then((res) => {
    role_group.value = res;
    current.value = res[0].code;
  });
});

watch(
  () => current.value,
  (val) => {
    usersStore.setSearchParams({ role_cid: current.value });
  },
  { immediate: true, deep: true }
);
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
.nav-content-wrapper {
  border-bottom: 1px solid #808080;
  padding-bottom: 20px;
}
.nav-content {
  display: flex;
  align-items: center;
  gap: 20px;

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
