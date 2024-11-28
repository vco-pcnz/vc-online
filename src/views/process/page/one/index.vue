<template>
  <div>
    <a-spin :spinning="tempLoading" size="large">
      <div class="main-info-container">
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
          ></component>
          <a-empty v-if="!tempModule && queryError" :image="simpleImage" />
        </a-spin>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
  import { watch, ref } from "vue";
  import { useDynamicModule } from "@/hooks/useDynamicModule";
  import ProcessHeader from "../../components/ProcessHeader.vue";
  import { useI18n } from "vue-i18n";
  import { goBack } from "@/utils/tool";
  import { projectApplyBorrowerInfo } from "@/api/process"

  const { t } = useI18n();
  const { tempLoading, tempModule, currentId, queryError, simpleImage, processStepData } = useDynamicModule();

  const formLoading = ref(false)

  const infoData = ref({})
  const getInfo = () => {
    formLoading.value = true

    projectApplyBorrowerInfo({
      project_apply_sn: currentId.value
    }).then(res => {
      infoData.value = res
      formLoading.value = false
    }).catch(() => {
      formLoading.value = false
    })
  }

  watch(
    currentId,
    (val) => {
      if (val) {
        getInfo()
      }
    }
  )
</script>
