<template>
  <div>
    <a-spin :spinning="pageLoading" size="large">
      <div class="block-container">
        <div class="left-content">
          <div class="block-item" :class="{'check': check}">
            <div class="sys-form-content mt-5">
              <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
                <a-row :gutter="24">
                  <a-col :span="24">
                    <a-form-item :label="t('借款金额')" name="loan_money">
                      <a-input-number
                        v-model:value="formState.loan_money"
                        :formatter="value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                        :parser="value => value.replace(/\$\s?|(,*)/g, '')"
                      />
                    </a-form-item>
                  </a-col>
                  <a-col :span="24">
                    <a-form-item :label="t('借款目的')" name="loan_type">
                      <a-select
                        v-model:value="formState.loan_type"
                        :options="projectTypeData"
                        mode="multiple"
                      ></a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :span="16">
                    <a-form-item :label="t('借款起止日期')" name="time_date">
                      <a-range-picker
                        v-model:value="formState.time_date"
                        :disabled-date="disabledStartDate"
                        :placeholder="[t('开放日期'), t('到期日期')]"
                        @change="timeChange"
                      />
                    </a-form-item>
                  </a-col>
                  <a-col :span="4">
                    <a-form-item :label="t('借款周期')" name="term">
                      <a-input
                        v-model:value="formState.term"
                        :suffix="t('月')"
                        @input="termInput"
                      />
                    </a-form-item>
                  </a-col>
                  <a-col :span="4">
                    <a-form-item label=" " name="days">
                      <a-input
                        v-model:value="formState.days"
                        :suffix="t('天')"
                        @input="termInput"
                      />
                    </a-form-item>
                  </a-col>
                </a-row>
              </a-form>
            </div>
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
        </div>
        <div v-if="!check" class="right-content">
          <bind-users
            v-if="!isNormalUser"
            v-permission="'process:bind:pre'"
            :current-id="currentId"
          ></bind-users>

          <div v-if="isNormalUser" class="block-item ads-content">
            <img src="./../../../../assets/images/img1.png" alt="">
          </div>
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
    projectSelectList,
    projectApplySaveLoanInfo,
    projectAuditSaveLoanInfo,
    projectSaveSaveDraft,
    projectDraftInfo,
    projectApplyLoanInfo
  } from "@/api/process";
  import tool from "@/utils/tool";
  import { message } from "ant-design-vue/es";
  import TempFooter from "./components/TempFooter.vue";
  import BindUsers from "./../../components/BindUsers.vue";
  import { useUserStore } from "@/store";
  import emitter from "@/event"

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

  const userStore = useUserStore();

  const isNormalUser = computed(() => userStore.isNormalUser);

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
        loan_money: data.loan_money,
        loan_type: data.loan_type.join(','),
        start_date: dayjs(data.time_date[0]).format('YYYY-MM-DD'),
        end_date: dayjs(data.time_date[1]).format('YYYY-MM-DD')
      }

      if ((props.infoData && props.infoData.uuid) || props.currentId) {
        params.uuid = props.infoData?.uuid || props.currentId
      }

      let ajaxFn = projectApplySaveLoanInfo

      if (props.check) {
        params.loan_info_status = props.infoData.check_status
        ajaxFn = projectAuditSaveLoanInfo
      } else {
        params.draft_step = markInfo.value
      }

      subLoading.value = true

      ajaxFn(params).then(res => {
        subLoading.value = false
        if (props.check) {
          emits('checkDone')
        } else {
          footerRef.value.nextHandle(res.uuid)
        }

        // 触发列表数据刷新
        emitter.emit('refreshRequestsList')
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
    const dataObj = cloneDeep(formState)
    if (dataObj.time_date) {
      dataObj.time_date = [dayjs(dataObj.time_date[0]).format('YYYY-MM-DD'), dayjs(dataObj.time_date[1]).format('YYYY-MM-DD')]
    }

    if (tool.isAllValuesEmpty(dataObj)) {
      message.error(t('暂无数据，无需保存'))
    } else {
      const params = {
        draft_step: markInfo.value,
        draft: JSON.stringify(tool.filterEmptyValues(dataObj))
      }

      if ((props.infoData && props.infoData.uuid) || props.currentId) {
        params.uuid = props.infoData?.uuid || props.currentId
      }

      draftLoading.value = true
      projectSaveSaveDraft(params).then(res => {
        message.success(t('保存成功'))
        draftLoading.value = false
        hasDraftData.value = true
      }).catch(() => {
        draftLoading.value = false
      })
    }
  }

  const disabledStartDate = (current) => {
    return current && current < new Date().setHours(0, 0, 0, 0); // 禁用今天之前的日期
  }

  const timeChange = (date) => {
    if (date) {
      const calcDay = tool.calculateDurationPrecise(date[0], date[1])
      formState.term = calcDay.months
      formState.days = calcDay.days
    } else {
      formState.term = ''
      formState.days = ''
    }
  }

  const termInput = () => {
    const months = Number(formState.term)
    const days = Number(formState.days)
    if (!isNaN(months) && !isNaN(days)) {
      if (months || days) {
        let statrDate = dayjs(new Date())
        if (formState.time_date) {
          statrDate = formState.time_date[0]
        }
        const endDate = tool.calculateEndDate(statrDate, months, days)
        formState.time_date = [dayjs(statrDate), dayjs(endDate)]
      } else {
        formState.time_date = []
      }
    }
  }

  const projectTypeData = ref([])
  const getTypeData = (type) => {
    projectSelectList().then(res => {
      const data = res.project_loan_cascade || []
      const dataArr = data.find(item => Number(item.value) === Number(type))
      projectTypeData.value = dataArr ? dataArr.children : []
    })
  }

  const dataInit = (infoMsg = {}, draftMsg = {}) => {
    const data = cloneDeep({...infoMsg, ...props.infoData})
    const draftData = cloneDeep({...draftMsg, ...props.draftData})

    if (data && data.start_date && data.end_date) {
      data.time_date = [data.start_date, data.end_date]
      timeChange(data.time_date)
    }

    let useData = data
    if (draftData && Object.keys(draftData).length) {
      useData = draftData
      hasDraftData.value = true
    }

    for (const key in formState) {
      if (key === 'time_date' && useData[key]) {
        formState.time_date = [dayjs(useData[key][0]), dayjs(useData[key][1])]
      } else if (key === 'loan_money') {
        formState.loan_money = Number(useData[key]) ? useData[key] : ''
      } else {
        formState[key] = useData[key] || formState[key] || ''
      }
    }

    emits('dataDone', data.project_apply_sn)
    getTypeData(data.project_type)
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
      await projectApplyLoanInfo({
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