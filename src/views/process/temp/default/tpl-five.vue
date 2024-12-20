<template>
  <div>
    <a-spin :spinning="pageLoading" size="large">
      <div class="block-container">
        <div v-if="dataInfo" class="left-content">
          <!-- 基础信息 -->
          <base-info-content
            :data-info="dataInfo"
            @refresh="getDataInit"
          ></base-info-content>

          <!-- 放款信息 -->
          <credit-form
            :current-id="currentId"
            :loan-info="loanInfo"
            @done="showForecast = true"
            @refresh="getDataInit"
          ></credit-form>

          <temp-footer
            ref="footerRef"
            :check="check"
            :sub-loading="subLoading"
            :show-draft="false"
            :previous-page="previousPage"
            :next-page="nextPage"
            :can-next="canNext"
            :current-id="currentId"
            :current-step="currentStep"
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
        </div>
      </div>
    </a-spin>
  </div>
  
</template>

<script setup>
  import { reactive, ref, watch, onMounted, computed } from "vue";
  import dayjs from "dayjs";
  import { useI18n } from "vue-i18n";
  import { cloneDeep } from "lodash";
  import {
    projectApplySaveLoanInfo,
    projectLmAuditDetail
  } from "@/api/process";
  import { navigationTo } from "@/utils/tool";
  import BaseInfoContent from "./components/BaseInfoContent.vue";
  import TempFooter from "./components/TempFooter.vue";
  import CreditForm from "./components/CreditForm.vue";
  import BindUsers from "./../../components/BindUsers.vue";
  import OperationLog from "./../../components/OperationLog.vue";
  import ForecastList from "./../../components/ForecastList.vue";

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
    currentStep: {
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
  const formRef = ref()
  const footerRef = ref()

  const currentDataInfo = ref()
  const showForecast = ref(false)

  const markInfo = computed(() => (props.currentStep ? props.currentStep.mark : ''))

  const formState = reactive({
    loan_money: '',
    loan_type: [],
    time_date: [],
    term: '',
    days: ''
  })

  const formRules = {
    loan_money: [
      { required: true, message: t('请输入') + t('借款金额'), trigger: 'blur' },
      {
        pattern: /^(?!0(\.0+)?$)(\d+(\.\d+)?|\.\d+)$/,
        message: t("请输入大于0的数字"),
        trigger: 'blur'
      }
    ],
    loan_type: [
      { required: true, message: t('请选择') + t('借款目的'), trigger: 'change' }
    ],
    time_date: [
      { required: true, message: t('请选择') + t('借款起止日期'), trigger: 'change' }
    ],
    term: [
      {
        pattern: /^[0-9]\d*$/,
        message: t("请输入正整数"),
        trigger: 'blur'
      }
    ],
    days: [
      {
        pattern: /^[0-9]\d*$/,
        message: t("请输入正整数"),
        trigger: 'blur'
      }
    ]
  }

  const subLoading = ref(false)
  const submitHandle = () => {
    formRef.value
    .validate()
    .then(() => {
      const data = cloneDeep(formState)
      const params = {
        uuid: props.infoData.uuid,
        draft_step: 'four',
        loan_money: data.loan_money,
        loan_type: data.loan_type.join(','),
        start_date: dayjs(data.time_date[0]).format('YYYY-MM-DD'),
        end_date: dayjs(data.time_date[1]).format('YYYY-MM-DD')
      }
      subLoading.value = true

      projectApplySaveLoanInfo(params).then(res => {
        subLoading.value = false
        navigationTo(`/requests/details?uuid_info=${res.uuid}`)
        console.log('res', res)
      }).catch(() => {
        subLoading.value = false
      })
    })
    .catch(error => {
      console.log('error', error);
    });
  }

  const dataInfo = ref(null)
  const loanInfo = ref(null)
  const dataInit = (infoMsg = {}) => {
    const data = cloneDeep({...infoMsg, ...props.infoData})

    loanInfo.value = data.loan_info
    dataInfo.value = data
    currentDataInfo.value = data
    emits('dataDone', data.project_apply_sn)
  }

  const pageLoading = ref(false)
  const getDataInit = async () => {
    pageLoading.value = true
    let infoData = {}
    
    // 草稿数据
    const params = {
      draft_step: markInfo.value
    }
    if (props.currentId) {
      params.uuid = props.currentId
    }

    if (props.currentId) {
      await projectLmAuditDetail({
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