<template>
  <div>
    <a-spin :spinning="tempLoading" size="large">
      <div class="main-info-container">
        <div v-if="!tempLoading && !queryError">
          <process-header
            :main-step-data="mainStepData"
            :step-data="stepData"
            :current="current"
            :current-step="currentStep"
            :status="currentStatus"
            :status-info="currentStatusInfo"
          >
            <template #left>
              <a-button v-if="current === 1" type="grey">{{ t('取消请求') }}</a-button>
              <template v-else>
                <div v-if="orderSn" class="page-title">ID: {{ orderSn }}</div>
              </template>
            </template>
            <template #right>
              <a-button type="primary" shape="round" ghost size="small">{{ t('帮助') }}?</a-button>
            </template>
          </process-header>

          <component
            v-if="tempModule"
            :is="tempModule"
            :current-id="currentId"
            :current-step="currentStep"
            :step-data="stepData"
            :previous-page="previousPage"
            :next-page="nextPage"
            :can-next="canNext"
            @dataDone="dataDone"
          ></component>
        </div>
        <a-empty v-if="!tempLoading && queryError" :image="simpleImage" />
      </div>
    </a-spin>
  </div>
</template>

<script setup>
  import { ref } from "vue"
  import { useDynamicModule } from "@/hooks/useDynamicModule";
  import ProcessHeader from "./ProcessHeader.vue";
  import { useI18n } from "vue-i18n";

  defineProps({
    current: {
      type: Number,
      default: 1
    }
  })

  const { t } = useI18n();
  const {
    tempLoading,
    tempModule,
    currentId,
    queryError,
    simpleImage,
    mainStepData,
    currentStatus,
    currentStatusInfo,
    currentStep,
    previousPage,
    nextPage,
    stepData,
    canNext
  } = useDynamicModule();

  const orderSn = ref('')
  const dataDone = (res) => {
    orderSn.value = res
  }
</script>

<style lang="less" scoped>
  .page-title {
    background-color: rgba(39, 39, 39, 1);
    color: #fff;
    padding: 8px 15px;
    padding-right: 25px;
    border-top-right-radius: 30px;
    border-bottom-right-radius: 30px;
    font-size: 16px;
    font-weight: 500;
  }
</style>
