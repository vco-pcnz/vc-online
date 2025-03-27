<template>
  <div class="main-info-container">
    <vco-page-panel :title="pageTitle" @back="goBack">
      <!-- 流程进行中操作拦 -->
      <div v-if="pageStep" class="flex nav-content">
        <a-button shape="round" @click="goHandleProcess('process')">{{ t('项目详情1') }}</a-button>
        <a-button
          shape="round"
          class="active"
        >{{ t('预算信息') }}</a-button>
        <a-button
          shape="round"
          @click="goHandleProcess('schedule')"
        >{{ t('明细表') }}</a-button>
        <a-button
          shape="round"
          @click="goHandleProcess('documents')"
        >{{ t('项目文件') }}</a-button>
      </div>
    </vco-page-panel>
    
    <vco-page-tab :tabData="tabData" v-model:current="currentTab"></vco-page-tab>

    <div v-if="currentId" class="mt-5">
      <Schedule v-if="currentTab === '1'" :current-id="currentId" :is-details="details" :budget="true" :linefee="1" />
      <Schedule v-if="currentTab === '2'" :current-id="currentId" :is-details="details" :budget="true" :linefee="0" />
    </div>
    
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();
import tool, { goBack, navigationTo } from '@/utils/tool';
import { useI18n } from 'vue-i18n';
import Schedule from "@/components/schedule/index.vue"

const { t } = useI18n();

const currentId = ref('');
const details = ref(false)

const pageTitle = ref(t('预算信息'))
const pageStep = ref('')

const goHandleProcess = (page) => {
  let href = ''
  if (page === 'process') {
    href = `/process/${pageStep.value}?uuid=${currentId.value}`
  } else {
    href = `/requests/${page}?uuid=${currentId.value}&step=${pageStep.value}&sn=${pageTitle.value}`
  }

  navigationTo(href)
}

const currentTab = ref('1');
const tabData = ref([
  {
    label: t('有Linefee'),
    value: '1'
  },
  {
    label: t('没有Linefee'),
    value: '2'
  }
]);

onMounted(() => {
  const { uuid, sn, step, isDetails } = route.query;
  if (uuid) {
    if (sn) {
      pageTitle.value = sn
    }

    if (step) {
      pageStep.value = step
    }

    currentId.value = uuid
    
    details.value = isDetails === 'true'
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
