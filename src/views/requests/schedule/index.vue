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
          class="active"
        >{{ t('明细表') }}</a-button>
        <a-button
          shape="round"
          @click="goHandleProcess('documents')"
        >{{ t('项目文件') }}</a-button>
      </div>
    </vco-page-panel>

    <Schedule v-if="currentId && currentTemp" :current-id="currentId" :current-product="currentTemp" :is-details="details" />
    <a-empty v-if="!currentTemp && !pageLoading" />
  </div>
</template>


<script setup>
  import { ref, onMounted, computed } from "vue";
  import { useRoute } from "vue-router";
  import { useI18n } from "vue-i18n";
  import { productGetCode } from "@/api/process"
  import { goBack, navigationTo } from "@/utils/tool"
  import Schedule from "@/components/schedule/index.vue"
  import { useProductStore } from "@/store"
  
  const { t } = useI18n();
  const route = useRoute();
  const productStore = useProductStore()
  const productData = computed(() => productStore.productData)
  const currentTemp = ref('')

  const pageLoading = ref(true)
  const currentSn = ref('')
  const currentId = ref()
  const details = ref(false)

  const pageTitle = ref(t('明细表'))
  const pageStep = ref('')

  const showBudget = computed(() => {
    return [].includes(currentTemp.value)
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

        pageLoading.value = false
      }
    } else {
      pageLoading.value = false
    }
  })
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