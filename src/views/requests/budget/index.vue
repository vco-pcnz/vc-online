<template>
  <div class="main-info-container">
    <vco-page-panel :title="pageTitle" @back="goBack"></vco-page-panel>
    
    <vco-page-tab v-if="currentTemp" :tabData="tabData" v-model:current="currentTab"></vco-page-tab>

    <div v-if="currentId && currentTemp" class="mt-5">
      <Schedule v-if="currentTab === '1'" :current-id="currentId" :is-details="details" :budget="true" :linefee="1" />
      <Schedule v-if="currentTab === '2'" :current-id="currentId" :is-details="details" :budget="true" :linefee="0" />
    </div>
    
    <a-empty v-if="!currentTemp && !pageLoading" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { goBack, navigationTo } from '@/utils/tool';
import { useI18n } from 'vue-i18n';
import { productGetCode } from "@/api/process"
import Schedule from "@/components/schedule/index.vue"
import { useProductStore } from "@/store"

const route = useRoute();
const { t } = useI18n();
const productStore = useProductStore()
const productData = computed(() => productStore.productData)
const currentTemp = ref('')

const pageLoading = ref(true)
const currentSn = ref('')
const currentId = ref('');
const details = ref(false)

const pageTitle = ref(t('预算信息'))
const pageStep = ref('')

const showBudget = computed(() => {
  return ['default'].includes(currentTemp.value)
})

// 是否显示进度付款
const showProgressPayment = computed(() => {
  return ['default', 'vsl'].includes(currentTemp.value)
})

const goHandleProcess = (page) => {
  let href = ''
  if (page === 'process') {
    href = `/process/${pageStep.value}?uuid=${currentId.value}`
  } else {
    href = `/requests/${page}?uuid=${currentId.value}&step=${pageStep.value}&sn=${currentSn.value}`
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

onMounted(async () => {
  const { uuid, sn, step, isDetails } = route.query;
  if (uuid) {
    const code = await productGetCode({uuid})
    if (!code) {
      pageLoading.value = false
    } else {
      currentTemp.value = code
      const obj = productData.value.find(item => item.code === code)
      const rType = obj ? `${obj.name} - ` : ''

      if (sn) {
        currentSn.value = sn
        pageTitle.value = rType + sn
      }

      if (step) {
        pageStep.value = step
      }

      currentId.value = uuid
      
      details.value = isDetails === 'true'
    }
  } else {
    pageLoading.value = false
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
