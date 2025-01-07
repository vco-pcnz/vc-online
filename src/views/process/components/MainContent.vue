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
              <a-button v-if="current === 1 && !orderSn && pageDone" type="grey" @click="goBack">{{ t('取消请求') }}</a-button>
              <div v-if="orderSn && pageDone" class="page-title">ID: {{ orderSn }}</div>
            </template>
            <template #right>
              <!-- <a-button type="primary" shape="round" ghost size="small">{{ t('帮助') }}?</a-button> -->
              
              <div v-if="orderSn && showHeaderTab" class="flex gap-5">
                <a-button type="dark" @click="navigationTo(`/requests/schedule?uuid_info=${currentId}`)">{{ t('放款计划') }}</a-button>
                <a-button type="dark" @click="navigationTo(`/requests/documents?uuid=${currentId}`)">{{ t('项目文件') }}</a-button>
              </div>
            </template>
          </process-header>

          <component
            v-if="tempModule"
            :is="tempModule"
            :current-id="currentId"
            :current-step="currentStep"
            :step-data="stepData"
            :previous-page="previousPage"
            :previous-step="previousStep"
            :next-page="nextPage"
            :next-step="nextStep"
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
  import { ref, onMounted } from "vue"
  import { useDynamicModule } from "@/hooks/useDynamicModule";
  import ProcessHeader from "./ProcessHeader.vue";
  import { useI18n } from "vue-i18n";
  import { goBack, navigationTo } from "@/utils/tool"
  import emitter from '@/event';

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
    previousStep,
    previousPage,
    nextPage,
    nextStep,
    stepData,
    canNext
  } = useDynamicModule();

  const pageDone = ref(false)
  const orderSn = ref('')
  const dataDone = (res) => {
    pageDone.value = true
    orderSn.value = res
  }

  const showHeaderTab = ref(false)

  onMounted(() => {
    emitter.on('showHeaderTab', () => {
      showHeaderTab.value = true
    });
  })
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
