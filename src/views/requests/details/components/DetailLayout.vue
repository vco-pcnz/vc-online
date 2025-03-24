<template>
  <vco-page-panel @back="back">
    <template #title>
      <div class="page-title-content">
        <div v-if="detail?.base?.project_apply_sn" class="tag">{{ detail?.base?.project_apply_sn }}</div>
      </div>
    </template>
    <div class="TabsPanel-Tab">
      <a-button v-for="item in panes" :key="item.key" @click="onChange(item.key)" :class="`tab-button ${item.key === props.activeTab ? 'active-tab' : ''}`">
        {{ item.title }}
      </a-button>
    </div>
  </vco-page-panel>
  <slot name="content"></slot>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/store';
import { useRouter, useRoute } from 'vue-router';
import { projectDetailApi } from "@/api/process";
import { cloneDeep } from 'lodash';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const props = defineProps(['title', 'activeTab']);
const emits = defineEmits(['getProjectDetail']);

const panes = computed(() => {
  let arr = [];
  const data = userStore.routerInfo || [];
  const dataArr = cloneDeep(data);

  const projectsArr = dataArr.find((item) => item.path === '/requests');
  const childArr = projectsArr.children || [];
  const detailsArr = childArr.find((item) => item.path === '/requests/details');
  const child = detailsArr.children || []

  arr = child
    .filter((item) => !item.meta.hide)
    .map((item) => {
      return {
        title: t(item.meta.title),
        path: item.path,
        key: item.path.slice(item.path.lastIndexOf('/') + 1)
      };
    });
  return arr;
});

const onChange = (key) => {
  router.push(`/requests/details/${key}?uuid=${route.query.uuid}`);
};

const back = () => {
  router.push(`/requests/loan`);
};

const detail = ref(null);
const getProjectDetail = async (userId) => {
  const uuid = userId || route.query.uuid;

  if (uuid) {
    // 发起请求
    projectDetailApi({ uuid }).then((res) => {
      detail.value = res;
      emits('getProjectDetail', res);
    });
  }
};

onMounted(() => {
  getProjectDetail();
});

// 暴露方法给父组件
defineExpose({
  getProjectDetail
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.TabsPanel-Tab {
  list-style: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
}
.tab-button {
  color: @clr_charcoal;
  background-color: transparent;
  border: 1px solid @clr_charcoal;
  padding: 4px 20px;
  border-radius: 55px;
}

.active-tab {
  color: @clr_yellow;
  border: 1px solid @clr_yellow;
}

.page-title-content {
  display: flex;
  align-items: center;
  gap: 15px;
  > .tag {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    font-weight: 500;
    font-size: 14px;
    letter-spacing: 1px;
    text-transform: uppercase;
    white-space: nowrap;
    background-color: @clr_charcoal;
    color: @clr_white;
    border-radius: 16px;
    padding: 0 30px;
    &:first-child {
      border-radius: 0 16px 16px 0 !important;
    }
    &.uppercase {
      padding: 0 20px;
      background-color: @colorPrimary;
    }
  }
}
</style>
