<template>
  <vco-page-panel :title="title" w="200px" @back="back">
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
import { cloneDeep } from 'lodash';

const pageRole = computed(() => useUserStore().pageRole);
const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const userStore = useUserStore();

const props = defineProps(['title', 'activeTab']);

const panes = computed(() => {
  let arr = [];
  const data = userStore.routerInfo || [];
  const dataArr = cloneDeep(data);
  const projectsArr = dataArr.find((item) => item.path === '/Investment');
  const childArr = projectsArr.children || [];
  const detailsArr = childArr.find((item) => item.path === '/Investment/details');
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
  router.push(`/Investment/detail/${key}?uuid=` + route.query.uuid);
};

const back = () => {
  router.push('/Investment');
};

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
