<template>
  <div>
    <resovle-dialog
      v-model:visible="resovleVisible"
      :uuid="currentId"
      :type="3"
      :required="false"
      @done="subDone"
    ></resovle-dialog>

    <a-spin :spinning="pageLoading" size="large">
      <div v-if="dataInfo && dataInfo.base.cancel_reason" class="block-item details process-fail mt-5">
        <p class="title">{{ t('拒绝原因') }}</p>
        <p class="info">{{ dataInfo.base.cancel_reason || t('拒绝原因') }}</p>
      </div>

      <div class="block-container">
        <div v-if="dataInfo && PageBlockObjRef" class="left-content">
          <temp-block
            :block-arr="PageBlockArrRef"
            :block-info="PageBlockObjRef"
            :data-info="dataInfo"
            :current-id="currentId"
            :current-step="currentStep"
            @refresh="getDataInit"
            @lendingDone="showForecast = true"
          ></temp-block>

          <div v-if="dataInfo.base.fc_review" class="block-item mb">
            <vco-process-title :title="t('{0}审核批示', ['FC'])"></vco-process-title>
            <div class="mt-2">{{ dataInfo.base.fc_review }}</div>
          </div>

          <temp-footer
            ref="footerRef"
            :check="check"
            :sub-loading="subLoading"
            :show-draft="false"
            :previous-page="previousPage"
            :previous-step="previousStep"
            :next-page="nextPage"
            :can-next="canNext"
            :current-id="currentId"
            :current-step="currentStep"
            :next-step="nextStep"
            @submit="submitHandle"
          ></temp-footer>
        </div>

        <div v-if="dataInfo && PageBlockObjRef" class="right-content">
          <bind-users :current-id="currentId"></bind-users>
          <operation-log :current-id="currentId"></operation-log>

          <forecast-list
            v-if="showForecast && PageBlockObjRef.lending"
            :current-id="currentId"
            :info-data="currentDataInfo"
            :block-info="PageBlockObjRef.lending"
          ></forecast-list>

          <security-list
            v-if="PageBlockObjRef.security"
            :current-id="currentId"
            :security-info="securityInfo"
            :block-info="PageBlockObjRef.security"
          >
          </security-list>
        </div>
      </div>
    </a-spin>
  </div>
  
</template>

<script setup>
  import { ref, watch, onMounted } from "vue";
  import { useI18n } from "vue-i18n";
  import { cloneDeep } from "lodash";
  import {
    projectAuditStepDetail,
    projectAuditSaveStep
  } from "@/api/process";
  import TempBlock from "./components/TempBlock.vue";
  import TempFooter from "./components/TempFooter.vue";
  import BindUsers from "./../../components/BindUsers.vue";
  import OperationLog from "./../../components/OperationLog.vue";
  import ForecastList from "./../../components/ForecastList.vue";
  import SecurityList from "./../../components/SecurityList.vue";
  import emitter from "@/event"
  import { message } from "ant-design-vue/es";
  import useProcessStore from "@/store/modules/process"
  import { processBlockName } from "@/constant"

  import ResovleDialog from '@/views/process/components/ResovleDialog.vue';

  // 初始化当前项目的forcastList 状态
  const processStore = useProcessStore()
  processStore.setForcastState(false)

  const emits = defineEmits(['checkDone', 'dataDone'])

  const props = defineProps({
    infoData: {
      type: Object,
      default: () => {}
    },
    draftData: {
      type: Object,
      default: () => {}
    },
    previousStep: {
      type: Object
    },
    currentStep: {
      type: Object
    },
    nextStep: {
      type: Object
    },
    currentId: {
      type: [Number, String],
      default: ''
    },
    check: {
      type: Boolean,
      default: false
    },
    previousPage: {
      type: String,
      default: ''
    },
    nextPage: {
      type: String,
      default: ''
    },
    canNext: {
      type: Boolean,
      default: false
    }
  })

  const { t } = useI18n();
  const footerRef = ref()

  const PageBlockObjRef = ref(null)
  const PageBlockArrRef = ref([])

  const currentDataInfo = ref()
  const showForecast = ref(false)

  const subLoading = ref(false)
  const resovleVisible = ref(false);
  const submitHandle = () => {
    const data = currentDataInfo.value

    for (let i = 0; i < PageBlockArrRef.value.length; i ++) {
      const key = PageBlockArrRef.value[i]
      if (PageBlockObjRef.value[key].showCheck) {
        if (key === 'security' && !data.security.count) {
          message.error(t('请上传') + t(processBlockName[key]))
          return false
        }
        if (key === 'offer' && !data.offer.cert_images) {
          message.error(t('请上传') + t(processBlockName[key]))
          return false
        }
        if (!data[key].is_check) {
          message.error(t('请审核') + t(processBlockName[key]))
          return false
        }
      }
    }

    resovleVisible.value = true;
  }

  const subDone = (data) => {
    footerRef.value.nextHandle({
      ...data,
      uuid: props.currentId
    })
  }

  const dataInfo = ref(null)
  const securityInfo = ref(null)
  const guarantorInfo = ref(null)

  const dataInit = (infoMsg = {}) => {
    const data = cloneDeep({...infoMsg, ...props.infoData})
    securityInfo.value = data.security
    guarantorInfo.value = data.guarantor
    
    dataInfo.value = data
    currentDataInfo.value = data
    emits('dataDone', data.base.project_apply_sn)
  }

  const pageLoading = ref(false)
  const getDataInit = async () => {
    pageLoading.value = true
    let infoData = {}

    if (props.currentId) {
      await projectAuditStepDetail({
        uuid: props.currentId
      }).then(res => {
        infoData = res
      })
    }

    pageLoading.value = false
    dataInit(infoData)
  }

  const blockInit = () => {
    const data = cloneDeep(props.currentStep)
    if (data.check_rule && data.check_rule.length) {
      const obj = {}
      const arr = []

      for (let i = 0; i < data.check_rule.length; i++) {
        obj[data.check_rule[i].code] = data.check_rule[i]
        arr.push(data.check_rule[i].code)
      }

      PageBlockObjRef.value = obj
      PageBlockArrRef.value = arr
    }
  }

  watch(
    () => props.infoData,
    (val) => {
      if (val) {
        dataInit()
      }
    }, {
      immediate: true
    }
  )

  onMounted(() => {
    // 模块初始化
    blockInit()

    if (!props.check) {
      getDataInit()
    }

    emitter.on('refreshSecurityInfo', () => {
      getDataInit()
    })
  })
</script>

<style lang="less" scoped>
  @import './styles/common.less';
  .sys-form-content {
    :deep(.ant-input-number-input) {
      font-size: 18px !important;
    }
  }
</style>