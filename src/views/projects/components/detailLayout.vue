<template>
  <vco-page-panel :title="title" :isBack="true">
    <div class="TabsPanel-Tab">
      <a-button v-for="item in panes" :key="item.key" @click="onChange(item.key)" :class="`tab-button ${item.key === props.activeTab ? 'active-tab' : ''}`">
        {{ item.label }}
        {{ item.extraInfo ? `(${item.extraInfo})` : '' }}
      </a-button>
    </div>
  </vco-page-panel>
  <slot name="content"></slot>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();

const props = defineProps(['title','activeTab']);

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
  router.push(`/projects/${key}`);
};

</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.TabsPanel-Tab {
  list-style: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 5px;
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
