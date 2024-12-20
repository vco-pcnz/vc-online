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
          <credit-form :current-id="currentId" @done="showForecast = true"></credit-form>

          <temp-footer
            ref="footerRef"
            :check="check"
            :draft-loading="draftLoading"
            :sub-loading="subLoading"
            :has-draft="hasDraftData"
            :previous-page="previousPage"
            :next-page="nextPage"
            :can-next="canNext"
            :current-id="currentId"
            :current-step="currentStep"
            @draft="draftHandle"
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
    projectSaveSaveDraft,
    projectLmAuditDetail,
    projectDraftInfo
  } from "@/api/process";
  import tool, { navigationTo } from "@/utils/tool";
  import { message } from "ant-design-vue/es";
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
        pattern: /^[+]?(0|[1-9]\d*)(\.\d+)?$/,
        message: t("请输入大于0的数字"),
        trigger: 'change'
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
        trigger: 'change'
      }
    ],
    days: [
      {
        pattern: /^[0-9]\d*$/,
        message: t("请输入正整数"),
        trigger: 'change'
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

  const draftLoading = ref(false)
  const hasDraftData = ref(false)
  const draftHandle = () => {
    console.log('dsafdsafdsa')
    // const dataObj = cloneDeep(formState)
    // if (dataObj.time_date) {
    //   dataObj.time_date = [dayjs(dataObj.time_date[0]).format('YYYY-MM-DD'), dayjs(dataObj.time_date[1]).format('YYYY-MM-DD')]
    // }

    // if (tool.isAllValuesEmpty(dataObj)) {
    //   message.error(t('暂无数据，无需保存'))
    // } else {
    //   const params = {
    //     uuid: props.infoData.uuid,
    //     draft_step: 'four',
    //     draft: JSON.stringify(tool.filterEmptyValues(dataObj))
    //   }

    //   draftLoading.value = true
    //   projectSaveSaveDraft(params).then(res => {
    //     message.success(t('保存成功'))
    //     draftLoading.value = false
    //     hasDraftData.value = true
    //   }).catch(() => {
    //     draftLoading.value = false
    //   })
    // }
  }

  const dataInfo = ref(null)
  const dataInit = (infoMsg = {}, draftMsg = {}) => {
    const data = cloneDeep({...infoMsg, ...props.infoData})
    const draftData = cloneDeep({...draftMsg, ...props.draftData})

    dataInfo.value = data

    // if (data && data.start_date && data.end_date) {
    //   data.time_date = [data.start_date, data.end_date]
    //   timeChange(data.time_date)
    // }
    // const draftData = cloneDeep(props.draftData)

    // let useData = data
    // if (draftData && Object.keys(draftData).length) {
    //   useData = draftData
    //   hasDraftData.value = true
    // }

    // for (const key in formState) {
    //   if (key === 'time_date' && useData[key]) {
    //     formState.time_date = [dayjs(useData[key][0]), dayjs(useData[key][1])]
    //   } else {
    //     formState[key] = useData[key] || formState[key] || ''
    //   }
    // }
    currentDataInfo.value = data
    emits('dataDone', data.project_apply_sn)
  }

  const pageLoading = ref(false)
  const getDataInit = async () => {
    pageLoading.value = true

    let draftData = {}
    let infoData = {}
    
    // 草稿数据
    const params = {
      draft_step: markInfo.value
    }
    if (props.currentId) {
      params.uuid = props.currentId
    }
    await projectDraftInfo(params).then(res => {
      if (res.draft) {
        const data = JSON.parse(res.draft)
        draftData = data
      }
    })

    if (props.currentId) {
      await projectLmAuditDetail({
        uuid: props.currentId
      }).then(res => {
        infoData = res
      })
    }

    pageLoading.value = false

    dataInit(infoData, draftData)
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