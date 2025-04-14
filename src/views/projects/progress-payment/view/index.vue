<template>
  <div class="main-info-container">
    <vco-page-panel :title="pageTitle" @back="goBack"></vco-page-panel>

    <template v-if="currentId && currentTemp">
      <view-content :show-process="true" @done="getProjectInfo"></view-content>
    </template>

    <a-empty v-if="!currentTemp && !pageLoading" />
  </div>
</template>


<script setup>
  import { ref, onMounted, computed } from "vue";
  import { useRoute } from "vue-router";
  import { useI18n } from "vue-i18n";
  import { productGetCode } from "@/api/process"
  import { goBack } from "@/utils/tool"
  import { useProductStore } from "@/store"
  import ViewContent from "@/views/requests/progress-payment/components/ViewContent.vue";
  
  const { t } = useI18n();
  const route = useRoute();
  const productStore = useProductStore()
  const productData = computed(() => productStore.productData)
  const currentTemp = ref('')

  const pageLoading = ref(true)
  const currentId = ref()
  const typeStr = ref('')

  const pageTitle = ref(t('进度付款阶段'))

  const getProjectInfo = (data) => {
    pageTitle.value = `${typeStr.value}${data.base.project_apply_sn}`
  }
  
  onMounted(async () => {
    const { uuid } = route.query;
    if (uuid) {
      currentId.value = uuid
      const code = await productGetCode({uuid})
      if (!code) {
        pageLoading.value = false
      } else {
        currentTemp.value = code
        const obj = productData.value.find(item => item.code === code)
        const rType = obj ? `${obj.name} - ` : ''

        typeStr.value = rType

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