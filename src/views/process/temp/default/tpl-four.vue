<template>
  <div>
    <!-- 提示弹窗 -->
    <a-modal
      :open="tipsVisible"
      :title="t('提示')"
      :width="460"
      :footer="null"
      :keyboard="false"
      :maskClosable="false"
      @cancel="tipsVisible = false"
    >
      <div class="tips-content">
        <p class="tips-txt">{{ t('已存在预测列表，修改贷款周期，将会强制重新生成预测列表，是否提交？') }}</p>

        <div class="mt-5 flex justify-between gap-5">
          <a-button
            type="grey" class="big shadow bold uppercase w-full mb-5 mt-5"
            @click="tipsVisible = false"
          >{{ t('取消') }}</a-button>

          <a-button
            type="dark" class="big shadow bold uppercase w-full mb-5 mt-5"
            :loading="sureLoading"
            @click="sureHandle"
          >{{ t('提交') }}</a-button>
        </div>
      </div>
    </a-modal>

    <a-spin :spinning="pageLoading" size="large">
      <div v-if="currentInfo && currentInfo.cancel_reason && !check" class="block-item details process-fail mt-5">
        <p class="title">{{ t('拒绝原因') }}</p>
        <p class="info">{{ currentInfo.cancel_reason || t('拒绝原因') }}</p>
      </div>

      <div class="block-container">
        <div class="left-content">
          <div class="block-item" :class="{'check': check}">
            <div class="sys-form-content mt-5">
              <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
                <a-row :gutter="24">
                  <a-col :span="devCost ? 12 : 24">
                    <a-form-item :label="t('预计借款金额')" name="old_loan_money">
                      <a-input-number
                        v-model:value="formState.old_loan_money"
                        :disabled="changeTimeStep"
                        :formatter="value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                        :parser="value => value.replace(/\$\s?|(,*)/g, '')"
                      />
                    </a-form-item>
                  </a-col>
                  <a-col v-if="devCost" :span="12">
                    <a-form-item :label="t('开发成本')">
                      <div class="flex items-center" style="height: 50px;">
                        <vco-number :bold="true" :value="devCost" :precision="2" :end="true"></vco-number>
                      </div>
                    </a-form-item>
                  </a-col>
                  <a-col :span="24">
                    <a-form-item :label="t('借款目的')" name="loan_type">
                      <a-select
                        v-model:value="formState.loan_type"
                        :disabled="changeTimeStep"
                        :options="projectTypeData"
                        mode="multiple"
                      ></a-select>
                    </a-form-item>
                  </a-col>
                  <template v-if="!changeTimeStep">
                    <a-col :span="12">
                      <a-form-item :label="t('预计项目周期')" name="time_date">
                        <a-range-picker
                          v-model:value="formState.time_date"
                          :format="selectDateFormat()"
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
                    <a-col :span="4">
                      <a-form-item :label="t('总天数')" name="totalDay">
                        <div class="show-days">
                          {{ formState.totalDay }}
                          <span>{{ t('天') }}</span>
                        </div>
                      </a-form-item>
                    </a-col>
                  </template>
                  <template v-else>
                    <a-col :span="7">
                      <a-form-item :label="t('开放日期')" name="startDate">
                        <a-date-picker v-model:value="formState.startDate" :format="selectDateFormat()" :placeholder="t('开放日期')" @change="openDateChange" />
                      </a-form-item>
                    </a-col>
                    <a-col :span="7">
                      <div class="info-content">
                        <p class="name">{{ t('确认贷款日期') }}</p>
                        <p class="txt">{{ tool.showDate(showStartDate) + ' - ' + tool.showDate(showEndDate) }}</p>
                      </div>
                    </a-col>
                    <a-col :span="6">
                      <div class="info-content">
                        <p class="name">{{ t('借款周期') }}</p>
                        <p class="txt">{{ showTerm }}</p>
                      </div>
                    </a-col>
                    <a-col :span="4">
                      <div class="info-content">
                        <p class="name">{{ t('总天数') }}</p>
                        <p class="txt">{{ showTotalDay }}</p>
                      </div>
                    </a-col>
                  </template>
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
              :previous-step="previousStep"
              :next-page="nextPage"
              :can-next="canNext"
              :current-id="currentId"
              :current-step="currentStep"
              :next-step="nextStep"
              @draft="draftHandle"
              @submit="submitHandle"
            ></temp-footer>
          </div>
        </div>
        <div v-if="!check" class="right-content">
          <bind-users
            ref="bindUsersRef"
            v-if="bindUserPermission"
            :current-id="currentId"
          ></bind-users>

          <ads-content></ads-content>
        </div>
      </div>
    </a-spin>
  </div>
  
</template>

<script setup>
  import { reactive, ref, watch, onMounted, computed } from "vue";
  import dayjs from "dayjs";
  import { useI18n } from "vue-i18n";
  import { useRoute } from 'vue-router'
  import { cloneDeep } from "lodash";
  import {
    projectSelectList,
    projectApplySaveLoanInfo,
    projectAuditSaveMode,
    projectSaveSaveDraft,
    projectDraftInfo,
    projectApplyLoanInfo,
    projectApplyProjectInfo
  } from "@/api/process";
  import tool, { selectDateFormat } from "@/utils/tool";
  import { message } from "ant-design-vue/es";
  import TempFooter from "./components/TempFooter.vue";
  import BindUsers from "./../../components/BindUsers.vue";
  import AdsContent from "./../../components/AdsContent.vue";
  import emitter from "@/event"
  import useProcessStore from "@/store/modules/process"
  import { hasPermission } from "@/directives/permission/index"
  import useProductStore from '@/store/modules/product'

  const productStore = useProductStore();
  const route = useRoute()

  const processStore = useProcessStore()
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
    code: {
      type: String,
      default: ''
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
    },
    currentRequest: {
      type: String,
      default: ''
    }
  })

  const { t } = useI18n();
  const formRef = ref()
  const footerRef = ref()
  const bindUsersRef = ref();

  const bindUserPermission = computed(() => {
    return hasPermission('requests:loan:bind:vcTeam') || hasPermission('requests:loan:bind:broker') || hasPermission('requests:loan:bind:user')
  })

  const markInfo = computed(() => (props.currentStep ? props.currentStep.mark : ''))

  const currentInfo = ref(null)

  const changeTimeStep = computed(() => {
    // return props.check && ['step_lm_check', 'step_open'].includes(markInfo.value)
    return false
  })

  const showStartDate = computed(() => {
    let txt = 'XXXX'
    if (formState.time_date) {
      const startDate = formState.time_date[0]
      txt = dayjs(startDate).format('YYYY-MM-DD');
    }
    return txt
  })

  const showEndDate = computed(() => {
    let txt = 'XXXX'
    if (formState.time_date) {
      const endDate = formState.time_date[1]
      txt = dayjs(endDate).format('YYYY-MM-DD');
    }
    return txt
  })

  const showTerm = computed(() => {
    const data = tool.calculateDurationPrecise(showStartDate.value, showEndDate.value);
    if (data.months && data.days) {
      return `${data.months} ${t('月')} ${data.days} ${t('天')}`;
    }

    if (data.months && !data.days) {
      return `${data.months} ${t('月')}`;
    }

    if (!data.months && data.days) {
      return `${data.days} ${t('天')}`;
    }

    return '--';
  });

  const showTotalDay = computed(() => {
    const data = tool.calculateDurationPrecise(showStartDate.value, showEndDate.value);
    return data.gapDay || 0;
  });

  const formState = reactive({
    old_loan_money: '',
    loan_type: [],
    time_date: [],
    term: '',
    days: '',
    totalDay: 0
  })

  const formRules = {
    old_loan_money: [
      { required: true, message: t('请输入') + t('借款金额'), trigger: 'blur' },
      {
        pattern: /^[+]?([1-9]\d*)(\.\d+)?$/,
        message: t("请输入大于0的数字"),
        trigger: 'change'
      }
    ],
    loan_type: [
      { required: true, message: t('请选择') + t('借款目的'), trigger: 'change' }
    ],
    time_date: [
      { required: true, message: t('请选择') + t('预计项目周期'), trigger: 'change' }
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

  if (changeTimeStep.value) {
    formState['startDate'] = ''
    formRules['startDate'] = [{ required: true, message: t('请选择') + t('开放日期'), trigger: 'change' }]
  }

  const openDateChange = (date) => {
    if (date) {
      const data = cloneDeep(props.infoData)

      if (data && data.apply_start_date && data.apply_end_date) {
        const { apply_start_date, apply_end_date } = props.infoData;
        const calcDay = tool.calculateDurationPrecise(apply_start_date, apply_end_date);
        const gapDay = calcDay.gapDay;

        if (gapDay) {
          const statrDate = dayjs(date);
          const endDateStr = tool.calculateEndDateByDays(statrDate, gapDay);

          formState.time_date = [statrDate, dayjs(endDateStr)]
        }
      }
    }
  };

  const currentForParams = ref(null)
  const tipsVisible = ref(false)
  const sureLoading = ref(false)
  const sureHandle = async () => {
    sureLoading.value = true
    await normalRequest(currentForParams.value, true)

    emitter.emit('refreshRefinancial', true)
    emitter.emit('refreshForecastList')

    sureLoading.value = false
  }

  const needBindUser = ref(false);

  const subLoading = ref(false)
  const normalRequest = async (params, flag) => {
    const ajaxFn = flag ? projectAuditSaveMode : projectApplySaveLoanInfo
    subLoading.value = true

    await ajaxFn(params).then(async (res) => {
      if (props.check) {
        emitter.emit('refreshAuditHisList')
        
        // 触发奖金刷新
        emitter.emit('refreshBouns')
        emits('checkDone')
      } else {

        if (needBindUser.value) {
          await bindUsersRef.value.bindUsersRequest(res.uuid);
          needBindUser.value = false;
        }

        // 触发列表数据刷新
        emitter.emit('refreshRequestsList')

        footerRef.value.nextHandle(res)
      }

      subLoading.value = false
    }).catch(() => {
      subLoading.value = false
    })
  }

  const submitHandle = () => {
    formRef.value
    .validate()
    .then(async () => {
      const data = cloneDeep(formState)
      const params = {
        old_loan_money: data.old_loan_money,
        loan_type: data.loan_type.join(','),
        apply_start_date: dayjs(data.time_date[0]).format('YYYY-MM-DD'),
        apply_end_date: dayjs(data.time_date[1]).format('YYYY-MM-DD')
      }

      if ((props.infoData && props.infoData.uuid) || props.currentId) {
        params.uuid = props.infoData?.uuid || props.currentId
      }

      const product_uuid = productStore.getProductUuid(props.currentRequest)

      if (product_uuid) {
        params.product_uuid = product_uuid
      }

      if (props.check) {
        params.loan_info_status = props.infoData.check_status
        params.code = props.code
        if (props.infoData.apply_start_date === params.apply_start_date && props.infoData.apply_end_date === params.apply_end_date) {
        // if (props.infoData.apply_start_date === params.apply_start_date && props.infoData.apply_end_date === params.apply_end_date && Number(props.infoData.old_loan_money) === Number(params.old_loan_money)) {
          await normalRequest(params, true)
        } else {
          // if (processStore.hasForcast) {
          //   currentForParams.value = params
          //   tipsVisible.value = true
          // } else {
          //   if (props.infoData.apply_start_date !== params.apply_start_date || props.infoData.apply_end_date !== params.apply_end_date) {
          //     emitter.emit('refreshRefinancial', true)
          //   }

          //   await normalRequest(params, true)
          // }
          await normalRequest(params, true)
        }
      } else {
        params.draft_step = markInfo.value
        await normalRequest(params, false)
      }
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

      if ((props.infoData && props.infoData.base.uuid) || props.currentId) {
        params.uuid = props.infoData?.base?.uuid || props.currentId
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
      const startDate = typeof date[0] === 'string' ? date[0] : date[0].format('YYYY-MM-DD')
      const endDate = typeof date[1] === 'string' ? date[1] : date[1].format('YYYY-MM-DD')
      const calcDay = tool.calculateDurationPrecise(startDate, endDate)
      formState.term = calcDay.months
      formState.days = calcDay.days
      formState.totalDay = calcDay.gapDay
    } else {
      formState.term = ''
      formState.days = ''
      formState.totalDay = 0
    }
  }

  const termInput = () => {
    const months = Number(formState.term)
    const days = Number(formState.days)
    if (!isNaN(months) && !isNaN(days)) {
      if (months || days) {
        let startDate = dayjs(new Date())
        if (formState.time_date) {
          startDate = formState.time_date[0]
        }
        const endDate = tool.calculateEndDate(startDate, months, days)
        formState.time_date = [dayjs(startDate), dayjs(endDate)]
        const calcDay = tool.calculateDurationPrecise(dayjs(startDate).format('YYYY-MM-DD'), dayjs(endDate).format('YYYY-MM-DD'))
        formState.totalDay = calcDay.gapDay
      } else {
        formState.time_date = []
        formState.totalDay = 0
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

    if (data && data.apply_start_date && data.apply_end_date) {
      data.time_date = [data.apply_start_date, data.apply_end_date]
      // lm 再次检查
      if (changeTimeStep.value) {
        formState.startDate = dayjs(data.apply_start_date)
      }
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
      } else if (key === 'old_loan_money') {
        formState.old_loan_money = Number(useData[key]) ? useData[key] : ''
      } else if (key === 'totalDay') {
        formState[key] = formState[key] || 0
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

    currentInfo.value = infoData

    dataInit(infoData, draftData)
  }

  const devCost = ref(0)
  const getProjectInfo = () => {
    projectApplyProjectInfo({
      uuid: props.currentId
    }).then(res => {
      const devCostDetail = res.devCostDetail || []
      if (devCostDetail.length) {
        devCost.value = devCostDetail[0].data[0].loan
      }
    })
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
      if (props.currentId) {
        getProjectInfo()
      }
    }

    emitter.on('stepOneBindUser', () => {
      needBindUser.value = true;
    });
  })
</script>

<style lang="less" scoped>
  @import './styles/common.less';
  .sys-form-content {
    :deep(.ant-input-number-input) {
      font-size: 18px !important;
    }
  }

  .tips-content {
    padding: 30px;
    padding-top: 10px;
    padding-bottom: 0;
    .tips-txt {
      font-size: 14px;
      text-align: center
    }
  }

  .show-days {
    line-height: 50px;
    font-size: 18px;
    > span {
      opacity: 0.7;
    }
  }

  .info-content {
    .name {
      font-size: 12px;
      color: #666;
      padding: 0 0 8px;
      height: 30px;
    }
    .txt {
      font-size: 14px;
      font-weight: 500;
      line-height: 50px;
    }
  }
</style>