<template>
  <div>
    <a-spin :spinning="tempLoading" size="large">
      <div class="main-info-container">
        <div v-if="!formLoading && !pageError">
          <process-header :step-data="processStepData" :current="1">
            <template #left>
              <a-button type="grey" @click="goBack">{{ t('取消请求') }}</a-button>
            </template>
            <template #right>
              <a-button type="primary-line" shape="round" size="small" class="uppercase">{{ t('帮助') }}?</a-button>
            </template>
          </process-header>
          <a-spin :spinning="formLoading" size="large">
            <component
              v-if="tempModule"
              :is="tempModule"
              :info-data="infoData"
              :draft-data="draftData"
            ></component>
            <a-empty v-if="!tempModule && queryError" :image="simpleImage" />
          </a-spin>
        </div>
        <a-empty v-if="!formLoading && pageError" :image="simpleImage" />
      </div>
    </a-spin>
  </div>
</template>

<script setup>
  import { ref, onMounted } from "vue";
  import { useDynamicModule } from "@/hooks/useDynamicModule";
  import ProcessHeader from "../../components/ProcessHeader.vue";
  import { useI18n } from "vue-i18n";
  import { goBack } from "@/utils/tool";
  import { projectApplyBorrowerInfo, projectDraftInfo } from "@/api/process"

  const { t } = useI18n();
  const { tempLoading, tempModule, currentId, queryError, simpleImage, processStepData } = useDynamicModule();

  const formLoading = ref(true)
  const pageError = ref(false)

  const infoData = ref({})
  const getInfo = async () => {
    formLoading.value = true

    await projectApplyBorrowerInfo({
      uuid: currentId.value
    }).then(res => {
      infoData.value = res
      formLoading.value = false
      pageError.value = false
    }).catch(() => {
      formLoading.value = false
      pageError.value = true
    })
  }

  // 草稿数据
  const draftData = ref()
  const getDraftInfo = async () => {
    const params = {
      draft_step: 'one'
    }

    if (currentId.value) {
      params.uuid = currentId.value
    }

    await projectDraftInfo(params).then(res => {
      if (res.draft) {
        const data = JSON.parse(res.draft)
        if (data.borrower_images && data.borrower_images.length) {
          data.borrower_images = data.borrower_images.split(',')
        }
        draftData.value = data
      }
    })
  }

  onMounted(async () => {
    await getDraftInfo()
    if (!currentId.value) {
      formLoading.value = false
    } else {
      await getInfo()
    }
  })
</script>
