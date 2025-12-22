<template>
  <vco-page-panel :title="pageTitleRef" w="200px" @back="back">
    <div class="TabsPanel-Tab">
      <a-button v-for="item in panes" :key="item.key" @click="onChange(item.key)" :class="`tab-button ${item.key === props.activeTab ? 'active-tab' : ''}`">
        {{ item.title }}
      </a-button>
      <a-button type="brown" shape="round" v-if="hasImportAndPerfect && detail?.base?.old" @click="onChange('import-and-perfect')" class="flex items-center">
        {{ t('进入补充信息') }}
        <i class="iconfont" style="line-height: 1">&#xe602;</i>
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

const pageRole = computed(() => useUserStore().pageRole);
const mode = pageRole.value ? '/' + pageRole.value.toLowerCase() : '';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const userStore = useUserStore();

const props = defineProps(['title', 'activeTab']);
const emits = defineEmits(['getProjectDetail']);
const hasImportAndPerfect = ref(false);

const pageTitleRef = computed(() => {
  const name = detail.value?.product?.name ? `${detail.value?.product?.name} - ` : '';
  const type = pageTitle.value ? ` ${t(pageTitle.value)}` : '';
  const borrower_user_name = (pageTitle.value ? ' - ' : '') + (detail.value?.base?.borrower_user_name || detail.value?.base?.project_name);
  return `${name}${type}${borrower_user_name}`;
});

const panes = computed(() => {
  let arr = [];
  const data = userStore.routerInfo || [];
  const dataArr = cloneDeep(data);
  const projectsArr = dataArr.find((item) => item.path === mode + '/projects');
  const childArr = projectsArr.children || [];
  const detailsArr = childArr.find((item) => item.path === mode + '/projects/details');
  const child = detailsArr.children || [];

  arr = child
    .filter((item) => !item.meta.hide)
    .map((item) => {
      let title = t(item.meta.title);
      // 如果是普通用户且 title 是 schedule，则改为 Transactions
      if (title.toLowerCase() === 'schedule' && userStore.isNormalUser) {
        title = 'Transactions';
      }
      return {
        title: title,
        path: item.path,
        key: item.path.slice(item.path.lastIndexOf('/') + 1),
      };
    });
  hasImportAndPerfect.value = child.find((item) => item.path === mode + '/projects/import-and-perfect') ? true : false;

  return arr;
});

const onChange = (key) => {
  router.push(mode + `/projects/${key}?uuid=` + route.query.uuid);
};

const prevBackArr = ['penalty', 'variations', 'journal'];
const backPrev = (link) => {
  for (let i = 0; i < prevBackArr.length; i++) {
    if (link.indexOf(prevBackArr[i]) > -1) {
      return true;
    }
  }
  return false;
};

const back = () => {
  if (backPrev(route.path)) {
    router.push(mode + `/projects/about?uuid=${route.query.uuid}`);
  } else if (route.path.indexOf('schedule/reconciliation') > -1) {
    router.push(mode + `/projects/schedule?uuid=${route.query.uuid}`);
  } else {
    router.push(mode + `/projects/list`);
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
      if (pageRole.value == 'Umbrella' || userStore.userInfo.roles === 'guest') {
        res.base.is_close = 1;
      }
      emits('getProjectDetail', res);
    });
  }
};

onMounted(() => {
  getProjectDetail();
});

// 暴露方法给父组件
defineExpose({
  getProjectDetail,
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
    immediate: true,
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
