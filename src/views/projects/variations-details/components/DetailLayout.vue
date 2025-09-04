<template>
  <vco-page-panel @back="back">
    <template #title>
      <div class="page-title-content">
        <div v-if="detail?.base?.project_apply_sn" class="tag">{{ (detail?.product?.name ? detail?.product?.name + ' - ' : '') + detail?.borrower?.organization_name || detail?.base?.project_apply_sn }}</div>
        <div class="tag uppercase">{{ t('变更1') }}</div>
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
import { onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/store';
import { useRouter, useRoute } from 'vue-router';
import { projectDetail } from '@/api/project/project';
import { projectVariationInfo } from '@/api/project/variation';
import { cloneDeep } from 'lodash';

const pageRole = computed(() => useUserStore().pageRole);
const mode = pageRole.value ? '/' + pageRole.value.toLowerCase() : '';

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

  const projectsArr = dataArr.find((item) => item.path === `${mode}/projects`);
  const childArr = projectsArr.children || [];
  const detailsArr = childArr.find((item) => item.path === `${mode}/projects/details`);
  const child = detailsArr.children || [];

  const variationsDetails = child.find((item) => item.path === `${mode}/projects/variations-details`);
  const variationsChild = variationsDetails.children || [];

  arr = variationsChild
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
  router.push(`${mode}/projects/variations-details/${key}?uuid=${route.query.uuid}&id=${route.query.id}`);
};

const back = () => {
  router.push(`${mode}/projects/variations?uuid=${route.query.uuid}`);
};

const detail = ref(null);
const getProjectDetail = async (userId) => {
  const uuid = userId || route.query.uuid;

  const variationInfo = await projectVariationInfo({
    uuid: route.query.uuid,
    id: route.query.id
  });

  if (uuid) {
    // 发起请求
    projectDetail({ uuid }).then((res) => {
      res['loan'] = res.date;
      res['variationInfo'] = variationInfo;
      if (pageRole.value == 'Umbrella' || userStore.userInfo.roles === 'Guest') {
        res.base.is_close = 1;
      }
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
