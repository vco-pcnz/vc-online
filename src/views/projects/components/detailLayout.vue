<template>
  <vco-page-panel :title="(detail && detail.base.project_apply_sn) || ''" @back="back">
    <div class="TabsPanel-Tab">
      <a-button
        v-for="item in panes"
        :key="item.key"
        @click="onChange(item.key)"
        :class="`tab-button ${item.key === props.activeTab ? 'active-tab' : ''}`"
      >
        {{ item.label }}
        {{ item.extraInfo ? `(${item.extraInfo})` : '' }}
      </a-button>
    </div>
  </vco-page-panel>
  <slot name="content"></slot>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { projectDetailApi } from '@/api/process';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const props = defineProps(['title', 'activeTab']);

const panes = reactive([
  {
    key: 'about',
    label: t('关于')
  },
  {
    key: 'drawdowns',
    label: t('提款')
  },
  {
    key: 'schedule',
    label: t('明细表'),
    extraInfo: 0
  },
  {
    key: 'forecast',
    label: t('预测'),
    extraInfo: 0
  },
  {
    key: 'documents',
    label: t('项目文件'),
    extraInfo: 0
  }
]);

const onChange = (key) => {
  router.push(`/projects/${key}?uuid=` + route.query.uuid);
};

const back = () => {
  router.push(`/projects/current`);
};

const detail = ref(null);
const getProjectDetail = (userId) => {
  const uuid = userId || route.query.uuid;
  if (uuid) {
    // 发起请求
    projectDetailApi({ uuid }).then((res) => {
      detail.value = res;
    });
  }
};

onMounted(() => {
  getProjectDetail();
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
</style>
