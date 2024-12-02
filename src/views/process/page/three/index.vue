<template>
  <div>
    <a-spin :spinning="tempLoading" size="large">
      <div class="main-info-container">
        <div v-if="!formLoading && !pageError">
          <process-header v-if="!queryError" :step-data="processStepData" :current="3">
            <template #left>
              <div class="page-title">ID: {{ infoData?.project_apply_sn || '' }}</div>
            </template>
            <template #right>
              <a-button type="primary" shape="round" ghost size="small">{{ t('帮助') }}?</a-button>
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
  import { projectApplyProjectCert, projectDraftInfo } from "@/api/process"

  const { t } = useI18n();
  const { tempLoading, tempModule, currentId, queryError, simpleImage, processStepData } = useDynamicModule('three');

  const formLoading = ref(true)
  const pageError = ref(false)

  const infoData = ref({})
  const getInfo = () => {
    formLoading.value = true

    projectApplyProjectCert({
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
      draft_step: 'three'
    }

    if (currentId.value) {
      params.uuid = currentId.value
    }

    await projectDraftInfo(params).then(res => {
      if (res.draft) {
        const data = JSON.parse(res.draft)
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

<style lang="less" scoped>
  .page-title {
    background-color: rgba(39, 39, 39, 1);
    color: #fff;
    padding: 10px 15px;
    padding-right: 25px;
    border-top-right-radius: 30px;
    border-bottom-right-radius: 30px;
    font-size: 16px;
    font-weight: 500;
  }
</style>