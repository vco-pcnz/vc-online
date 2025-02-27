<template>
  <vco-page-panel :title="(detail && detail.base.project_apply_sn+(pageTitle?'` '+t(pageTitle) :'')) || ''" @back="back">
    <div class="TabsPanel-Tab">
      <a-button v-for="item in panes" :key="item.key" @click="onChange(item.key)" :class="`tab-button ${item.key === props.activeTab ? 'active-tab' : ''}`">
        {{ item.title }}
      </a-button>
    </div>
  </vco-page-panel>
  <slot name="content"></slot>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/store';
import { useRouter, useRoute } from 'vue-router';
// import { projectDetailApi } from '@/api/process';
import { projectDetail } from '@/api/project/project';
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

  const projectsArr = dataArr.find((item) => item.path === '/projects');
  const childArr = projectsArr.children || [];
  const detailsArr = childArr.find((item) => item.path === '/projects/details');
  const child = detailsArr.children || [];

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
  router.push(`/projects/${key}?uuid=` + route.query.uuid);
};

const prevBackArr = ['penalty', 'variations', 'journal']
const backPrev = (link) => {
  for (let i = 0; i < prevBackArr.length; i++) {
    if (link.indexOf(prevBackArr[i]) > -1) {
      return true
    }
  }
  return false
}

const back = () => {
  const previousRoute = router.options.history.state.back;

  if (backPrev(previousRoute)) {
    router.back()
  } else {
    if (detail.value?.base?.is_open === 2 || detail.value?.base?.is_open === 3) {
      router.push(`/projects/closed`);
    } else {
      router.push(`/projects/current`);
    }
  }
};

const detail = ref(null);
const getProjectDetail = (userId) => {
  const uuid = userId || route.query.uuid;
  if (uuid) {
    // 发起请求
    projectDetail({ uuid }).then((res) => {
      res['loan'] = res.date;
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

const pageTitle = ref('');
watch(
  () => route,
  (val) => {
    if (val) {
      if (router.currentRoute._value.meta.hide) {
        pageTitle.value = router.currentRoute._value.meta.title;
      } else {
        pageTitle.value = '';
      }
    }
  },
  {
    immediate: true
  }
);
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
</style>
