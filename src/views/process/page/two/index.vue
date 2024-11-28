<template>
  <div>
    <a-spin :spinning="tempLoading" size="large">
      <div class="main-info-container">
        <process-header v-if="!queryError" :step-data="processStepData" :current="2">
          <template #left>
            <div class="page-title">ID: {{ currentId }}</div>
          </template>
          <template #right>
            <a-button type="primary" shape="round" ghost size="small">{{ t('帮助') }}?</a-button>
          </template>
        </process-header>
        <a-spin :spinning="formLoading" size="large">
          <component v-if="tempModule" :is="tempModule"></component>
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
  import { projectApplyProjectInfo } from "@/api/process"

  const { t } = useI18n();
  const { tempLoading, tempModule, currentId, queryError, simpleImage, processStepData } = useDynamicModule('two');

  const formLoading = ref(false)

  const infoData = ref({})
  const getInfo = () => {
    formLoading.value = true

    projectApplyProjectInfo({
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