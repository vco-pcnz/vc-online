<template>
  <div>
    <vco-page-panel @back="goBack">
      <template #title>
        <div class="page-title-content">
          <div class="tag">{{ t('进度付款') }}</div>
        </div>
      </template>
    </vco-page-panel>

    <a-spin :spinning="pageLoading" size="large">
      <div style="min-height: 300px;">
        <template v-if="pageDone">
          <content-component
            :is-open="isOpen"
            :page-uuid="uuid"
            :page-project-detail="projectDetail"
            :page-footer-data="footerDataCol"
            :page-easy-model="easyModel"
            :page-build-amount="buildAmount"
            :page-borrower-equity="borrowerEquity"
          ></content-component>
        </template>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
  import { onMounted, computed, ref } from "vue"
  import { useI18n } from "vue-i18n";
  import { useRoute } from "vue-router"
  import { toolsDetail } from '@/api/import'
  import VclContent from './components/VclContent.vue'
  import VslContent from './components/VslContent.vue'
  import { goBack } from "@/utils/tool"

  const { t } = useI18n();
  const route = useRoute();

  const props = defineProps({
    isOpen: {
      type: Boolean,
      default: false
    }
  })

  const uuid = ref('')

  const isVsl = ref(false)
  const pageLoading = ref(false)
  const pageDone = ref(false)

  const ContentComponent = computed(() => isVsl.value ? VslContent : VclContent)

  const footerDataCol = ref([])
   // 是否为简易模式
  const easyModel = ref(true)

  // 请求项目信息
  const projectDetail = ref()
    // 建筑放款额
  const buildAmount = ref(0)
  // 建筑贷款自出部分
  const borrowerEquity  = ref(0)

  const getProjectData = async () => {
    pageLoading.value = true

    const params = {
      uuid: uuid.value
    }

    try {
      await toolsDetail(params).then(res => {
        isVsl.value = String(res.product.code).toLowerCase() === 'vsl'
        projectDetail.value = res

        const costModel = Boolean(res.devCostDetail[0].model)
        easyModel.value = costModel

        const list = res.devCostDetail[0].data[0].list
        const filterType = costModel ? ['Land', 'Refinance', 'Land_gst'] : ['Land', 'Construction', 'Refinance', 'Land_gst']
        const footerData = list.filter(item => !filterType.includes(item.type))

        // 找到footerData中type为Construction的item, 如果有则把他排到第一位，并且删除原来的Construction
        const conItem = footerData.find(item => item.type === 'Construction')
        if (conItem) {
          footerData.unshift(conItem)
          footerData.splice(footerData.lastIndexOf(conItem), 1)
        }

        footerDataCol.value = footerData || []
        const Construction = list.find(item => item.type === 'Construction')
        buildAmount.value = Construction ? (Number(Construction.loan) || 0) : 0
        borrowerEquity.value = Construction ? (Number(Construction.borrower_equity) || 0) : 0

        pageLoading.value = false
        pageDone.value = true
      })
    } catch (err) {
      pageLoading.value = false
    }
  }

  onMounted(async () => {
    const { query } = route
    uuid.value = query.uuid

    if (uuid.value) {
      await getProjectData()
    }
  })
</script>
