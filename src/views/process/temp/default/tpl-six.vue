<template>
  <div>
    <a-spin :spinning="pageLoading" size="large">
      <div class="block-container">
        <div v-if="dataInfo" class="left-content">
          <!-- 基础信息 -->
          <base-info-content
            :step-type="2"
            :data-info="dataInfo"
            @refresh="getDataInit"
          ></base-info-content>

          <!-- 放款信息 -->
          <credit-form
            :step-type="2"
            :current-id="currentId"
            :offer-amount="offerAmount"
            @done="showForecast = true"
            @refresh="getDataInit"
          ></credit-form>

          <!-- 抵押物 -->
          <security-items
            :step-type="2"
            :current-id="currentId"
            :security-info="securityInfo"
            @refresh="getDataInit"
          ></security-items>

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

        <div v-if="dataInfo" class="right-content">
          <bind-users :current-id="currentId"></bind-users>
          <operation-log :current-id="currentId"></operation-log>
          <forecast-list
            v-if="showForecast"
            :current-id="currentId"
            :info-data="currentDataInfo"
          ></forecast-list>
          <security-list
            :current-id="currentId"
            :security-info="securityInfo"
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
    projectFcAuditDetail,
    projectApplyLmCheck
  } from "@/api/process";
  import BaseInfoContent from "./components/BaseInfoContent.vue";
  import TempFooter from "./components/TempFooter.vue";
  import CreditForm from "./components/CreditForm.vue";
  import SecurityItems from "./components/SecurityItems.vue";
  import BindUsers from "./../../components/BindUsers.vue";
  import OperationLog from "./../../components/OperationLog.vue";
  import ForecastList from "./../../components/ForecastList.vue";
  import SecurityList from "./../../components/SecurityList.vue";
  import emitter from "@/event"
  import { message } from "ant-design-vue/es";

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

  const currentDataInfo = ref()
  const showForecast = ref(false)

  const subLoading = ref(false)
  const submitHandle = () => {
    const data = currentDataInfo.value
    if (!data.borrower_info.is_check) {
      message.error(t('请审核') + t('借款人信息'))
      return false
    }
    if (!data.project_info.is_check) {
      message.error(t('请审核') + t('项目信息'))
      return false
    }
    if (!data.project_cert.is_check) {
      message.error(t('请审核') + t('证件资料'))
      return false
    }
    if (!data.loan_info.is_check) {
      message.error(t('请审核') + t('借款信息'))
      return false
    }
    if (!data.offer_amount.is_check) {
      message.error(t('请审核') + t('放款信息'))
      return false
    }
    if (!data.security.is_check) {
      message.error(t('请审核') + t('抵押物信息'))
      return false
    }

    const params = {
      uuid: props.currentId
    }
    subLoading.value = true
    projectApplyLmCheck(params).then(() => {
      subLoading.value = false
      footerRef.value.nextHandle(props.currentId)

      // 触发列表数据刷新
      emitter.emit('refreshRequestsList')
    }).catch(() => {
      subLoading.value = false
    })
  }

  const dataInfo = ref(null)
  const offerAmount = ref(null)
  const securityInfo = ref(null)
  const dataInit = (infoMsg = {}) => {
    const data = cloneDeep({...infoMsg, ...props.infoData})

    offerAmount.value = data.offer_amount
    securityInfo.value = data.security
    dataInfo.value = data
    currentDataInfo.value = data
    emits('dataDone', data.project_apply_sn)
  }

  const pageLoading = ref(false)
  const getDataInit = async () => {
    pageLoading.value = true
    let infoData = {}

    if (props.currentId) {
      await projectFcAuditDetail({
        uuid: props.currentId
      }).then(res => {
        infoData = res
      })
    }

    pageLoading.value = false
    dataInit(infoData)
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