<template>
  <div class="main-info-container">
    <vco-page-panel :title="pageTitle" @back="goBack">
      <!-- 流程进行中操作拦 -->
      <div v-if="pageStep" class="flex nav-content">
        <a-button shape="round" @click="goHandleProcess('process')">{{ t('项目详情1') }}</a-button>
        <a-button
          v-if="showBudget"
          shape="round"
          @click="goHandleProcess('budget')"
        >{{ t('预算信息') }}</a-button>
        <a-button
          shape="round"
          @click="goHandleProcess('schedule')"
        >{{ t('明细表') }}</a-button>
        <a-button
          shape="round"
          class="active"
        >{{ t('项目文件') }}</a-button>
      </div>
    </vco-page-panel>
    <Documents :project_id="currentId" v-if="currentId"></Documents>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import Documents from '@/components/documents/index.vue';
import { useRoute } from 'vue-router';
import { goBack, navigationTo } from '@/utils/tool';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const { t } = useI18n();

const currentId = ref('');
const pageTitle = ref(t('项目文件'))
const pageStep = ref('')

const showBudget = computed(() => {
  return ['default'].includes(route.query.type)
})

const goHandleProcess = (page) => {
  let href = ''
  if (page === 'process') {
    href = `/process/${pageStep.value}?type=${route.query.type}&uuid=${currentId.value}`
  } else {
    href = `/requests/${page}?type=${route.query.type}&uuid=${currentId.value}&step=${pageStep.value}&sn=${pageTitle.value}`
  }

  navigationTo(href)
}

onMounted(() => {
  const { uuid, sn, step } = route.query;
  if (uuid) {
    if (sn) {
      pageTitle.value = sn
    }

    if (step) {
      pageStep.value = step
    }

    currentId.value = uuid
  }
});
</script>

<style lang="less" scoped>
  @import '@/styles/variables.less';
  .nav-content {
    gap: 10px;
    .ant-btn {
      color: @clr_charcoal;
      border-color: @clr_charcoal;
      &.active,
      &:hover {
        color: @clr_yellow;
        border-color: @clr_yellow;
      }
    }
  }
</style>
