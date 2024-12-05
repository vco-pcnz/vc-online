<template>
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
        <div class="flex mt-5 items-end gap-20 justify-between">
          <div v-if="!check">
            <a-button
              type="grey"
              shape="round"
              class="weight uppercase"
              :loading="draftLoading"
              @click="draftHandle"
            >{{ t('保存草稿') }}</a-button>
            <p v-if="hasDrafData" class="mt-2 text-sm pl-1 form-tips-color">{{ t('* 存在草稿数据，请点击{0}保存', [`"${t('提交审核1')}"`]) }}</p>
          </div>
          <p v-else></p>
          <div class="flex gap-5">
            <a-button
              v-if="!check"
              type="primary" shape="round" class="big shadow bold uppercase"
              @click="previousHandle"
            >{{ t('上一步') }}</a-button>
            <a-button
              type="dark" shape="round" class="big shadow bold uppercase"
              @click="submitHandle"
              :loading="subLoading"
            >{{ check ? t('保存') : t('提交审核1') }}</a-button>
          </div>
          
        </div>
      </div>
    </div>
    <div v-if="!check" class="right-content">
      2
    </div>
  </div>
</template>

<script setup>
  import { reactive, ref, watch } from "vue";
  import dayjs from "dayjs";
  import { useI18n } from "vue-i18n";
  import { cloneDeep } from "lodash";
  import { projectSelectList, projectApplySaveLoanInfo, projectSaveSaveDraft } from "@/api/process";
  import tool, { navigationTo } from "@/utils/tool";
  import { message } from "ant-design-vue/es";

  const emits = defineEmits(['checkDone'])

  const props = defineProps({
    infoData: {
      type: Object,
      default: () => {}
    },
    draftData: {
      type: Object,
      default: () => {}
    },
    check: {
      type: Boolean,
      default: false
    }
  })

  const { t } = useI18n();
  const formRef = ref()

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
        if (props.check) {
          emits('checkDone')
        } else {
          navigationTo(`/requests/details?uuid_info=${res.uuid}`)
        }
      }).catch(() => {
        subLoading.value = false
      })
    })
    .catch(error => {
      console.log('error', error);
    });
  }

  const draftLoading = ref(false)
  const hasDrafData = ref(false)
  const draftHandle = () => {
    const dataObj = cloneDeep(formState)
    if (dataObj.time_date) {
      dataObj.time_date = [dayjs(dataObj.time_date[0]).format('YYYY-MM-DD'), dayjs(dataObj.time_date[1]).format('YYYY-MM-DD')]
    }

    if (tool.isAllValuesEmpty(dataObj)) {
      message.error(t('暂无数据，无需保存'))
    } else {
      const params = {
        uuid: props.infoData.uuid,
        draft_step: 'four',
        draft: JSON.stringify(tool.filterEmptyValues(dataObj))
      }

      draftLoading.value = true
      projectSaveSaveDraft(params).then(res => {
        message.success(t('保存成功'))
        draftLoading.value = false
        hasDrafData.value = true
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

  const previousHandle = () => {
    navigationTo(`/process/three?uuid_info=${props.infoData.uuid}`)
  }

  const projectTypeData = ref([])
  const getTypeData = () => {
    projectSelectList().then(res => {
      const data = res.project_loan_cascade || []
      const dataArr = data.find(item => Number(item.value) === Number(props.infoData.project_type))
      projectTypeData.value = dataArr ? dataArr.children : []
    })
  }

  const dataInit = () => {
    const data = cloneDeep(props.infoData)
    if (data && data.start_date && data.end_date) {
      data.time_date = [data.start_date, data.end_date]
      timeChange(data.time_date)
    }
    const draftData = cloneDeep(props.draftData)

    let useData = data
    if (draftData && Object.keys(draftData).length) {
      useData = draftData
      hasDrafData.value = true
    }

    for (const key in formState) {
      if (key === 'time_date' && useData[key]) {
        formState.time_date = [dayjs(useData[key][0]), dayjs(useData[key][1])]
      } else {
        formState[key] = useData[key] || formState[key] || ''
      }
    }
  }

  watch(
    () => props.infoData,
    (val) => {
      if (val) {
        getTypeData()
        dataInit()
      }
    }, {
      immediate: true
    }
  )
</script>

<style lang="less" scoped>
  @import '././styles/common.less';
  .sys-form-content {
    :deep(.ant-input-number-input) {
      font-size: 18px !important;
    }
  }
</style>