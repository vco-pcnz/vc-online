<template>
  <div>
    <resovle-dialog
      v-if="needInsMark.includes(currentMark)"
      v-model:visible="resovleVisible"
      :uuid="currentId"
      :type="currentMark"
      :data-info="dataInfo"
      :required="false"
      @done="subDone"
    ></resovle-dialog>

    <!-- 费改动后弹窗 -->
    <vco-confirm-alert
      ref="changeFeeRef"
      :confirm-txt="saveDataTxt"
      v-model:visible="saveTipsVisible"
      @submit="backStepHandle"
    ></vco-confirm-alert>

    <!-- 项目open -->
    <open-dialog
      v-if="currentDataInfo"
      :uuid="currentId"
      :open-config="openConfig"
      :block-info="PageBlockObjRef"
      :info-data="currentDataInfo"
      :lending-info="lendingDataInfo"
      :compare-back-obj="compareBackObj"
      :type="currentMark"
      v-model:visible="openVisible"
      @done="subDone"
    ></open-dialog>

    <a-spin :spinning="pageLoading" size="large">
      <div v-if="dataInfo && dataInfo.base.cancel_reason" class="block-item details process-fail mt-5">
        <p class="title">{{ t('拒绝原因') }}</p>
        <p class="info">{{ dataInfo.base.cancel_reason ? dataInfo.base.cancel_reason.replace(/<span.*?>|<\/span>/g, '') : t('拒绝原因') }}</p>
      </div>
      
      <div class="block-container">
        <div v-if="dataInfo && PageBlockObjRef" class="left-content">
          <div class="audit-header-content">
            <p></p>
            <div class="target-content bottom" @click="targetChange">
              <div class="txt">{{ openBlock ? t('全部收起') : t('全部展开') }}</div>
              <div class="icon">
                <i v-if="openBlock" class="iconfont">&#xe711;</i>
                <i v-else class="iconfont">&#xe712;</i>
              </div>
            </div>
          </div>
          
          
          <div v-if="isAml" class="mb-10">
            <wash-table
              ref="washTableRef"
              :current-id="currentId"
              :current-step="currentStep"
              :block-info="PageBlockObjRef.AML"
              :wash-info="dataInfo.AML"
              @refresh="getDataInit"
            ></wash-table>

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
          
          <temp-block
            :block-arr="PageBlockArrRef"
            :block-info="PageBlockObjRef"
            :data-info="dataInfo"
            :current-id="currentId"
            :current-step="currentStep"
            :hide-wash="tempHideWash"
            @refresh="getDataInit"
            @lendingDone="showForecast = true"
            @openData="openDataHandle"
            @compareDone="compareDoneHandle"
          ></temp-block>

          <div v-if="dataInfo.base.alm_review" class="block-item mb">
            <vco-process-title :title="t('Submit instructions')"></vco-process-title>
            <div class="mt-2">{{ dataInfo.base.alm_review }}</div>
          </div>

          <div v-if="dataInfo.base.lm_review" class="block-item mb">
            <vco-process-title :title="t('{0}审核批示', ['LM'])"></vco-process-title>
            <div class="mt-2">{{ dataInfo.base.lm_review }}</div>
          </div>

          <div v-if="dataInfo.base.fc_review" class="block-item mb">
            <vco-process-title :title="t('{0}审核批示', ['FC'])"></vco-process-title>
            <div class="mt-2">{{ dataInfo.base.fc_review }}</div>
          </div>

          <div v-if="dataInfo.base.director_review" class="block-item mb">
            <vco-process-title
              :title="t('{0}审核批示', ['Director'])"
            ></vco-process-title>
            <div class="mt-2">{{ dataInfo.base.director_review }}</div>
          </div>

          <temp-footer
            v-if="!isAml"
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
            :sub-disabled="subDisabled"
            @submit="submitHandle"
          ></temp-footer>
        </div>

        <div v-if="dataInfo && PageBlockObjRef" class="right-content">
          <bind-users :current-id="currentId"></bind-users>

          <return-log v-if="returnLogData.length" :list-data="returnLogData"></return-log>

          <operation-log :current-id="currentId"></operation-log>

          <security-list
            v-if="PageBlockObjRef.security"
            :current-id="currentId"
            :security-info="securityInfo"
            :project-info="dataInfo.project"
            :block-info="PageBlockObjRef.security"
          >
          </security-list>

          <forecast-list
            v-if="showForecast && PageBlockObjRef.lending"
            :current-id="currentId"
            :info-data="currentDataInfo"
            :block-info="PageBlockObjRef.lending"
          ></forecast-list>

          <conditions-list
            :current-id="currentId"
            :end-date="currentDataInfo.loan.end_date"
          ></conditions-list>
        </div>
      </div>
    </a-spin>
  </div>
  
</template>

<script setup>
  import { ref, watch, onMounted, onUnmounted, computed } from "vue";
  import { useI18n } from "vue-i18n";
  import { cloneDeep } from "lodash";
  import { message } from 'ant-design-vue/es';
  import {
    projectAuditStepDetail,
    projectAuditSaveStep,
    projectAuditGoback
  } from "@/api/process";
  import TempBlock from "./components/TempBlock.vue";
  import TempFooter from "./components/TempFooter.vue";
  import BindUsers from "./../../components/BindUsers.vue";
  import OperationLog from "./../../components/OperationLog.vue";
  import ReturnLog from "./../../components/ReturnLog.vue";
  import ForecastList from "./../../components/ForecastList.vue";
  import SecurityList from "./../../components/SecurityList.vue";
  import ConditionsList from "./../../components/ConditionsList.vue";
  import WashTable from './components/WashTable.vue';
  import emitter from "@/event"
  import useProcessStore from "@/store/modules/process"
  import OpenDialog from "./components/OpenDialog.vue";
  import ResovleDialog from '@/views/process/components/ResovleDialog.vue';
  import tool, { numberStrFormat, navigationTo } from '@/utils/tool'

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

  const openBlock = ref(true)

  // 审核需要填写原因的流程
  const needInsMark = ['step_lm_audit', 'step_lm_review', 'step_fc_audit', 'step_director_audit']

  const currentMark = computed(() => props.currentStep.mark)
  const tempHideWash = computed(() => ['step_aml_audit', 'step_aml_check'].includes(currentMark.value))
  const isAml = computed(() => (PageBlockArrRef.value.includes('AML') && tempHideWash.value))

  const dataLetDisabled = ref(false)

  const subDisabled = computed(() => {
    let res = false
    const data = currentDataInfo.value

    for (let i = 0; i < PageBlockArrRef.value.length; i ++) {
      const key = PageBlockArrRef.value[i]
      if (PageBlockObjRef.value[key].showCheck && !data[key].is_check) {
        res = true
      }
    }
    return res || dataLetDisabled.value
  })

  const openVisible = ref(false)

  const openConfig = ref()
  const subLoading = ref(false)
  const resovleVisible = ref(false);

  const findCreditName = (key) => {
    const obj = creditTableInfo.value.find(item => item.credit_table === key)
    return obj ? obj.credit_name : ''
  }

  const compareBackObj = ref({})
  const saveDataTxtArr = ref([])
  const changeFeeRef = ref()
  const saveTipsVisible = ref(false)

  const saveReturnRea = computed(() => {
    const txtArr = []
    for (let i = 0; i < saveDataTxtArr.value.length; i++) {
      txtArr.push(t('{0}由{1}修改为了{2}', [saveDataTxtArr.value[i].name, saveDataTxtArr.value[i].before, saveDataTxtArr.value[i].now]))
    }
    return txtArr.join(', ')
  })

  const saveReturnRea1 = computed(() => {
    const txtArr = []
    for (let i = 0; i < saveDataTxtArr.value.length; i++) {
      txtArr.push(t('{0}由{1}修改为了{2}1', [saveDataTxtArr.value[i].name, saveDataTxtArr.value[i].before, saveDataTxtArr.value[i].now]))
    }
    return txtArr.join(', ')
  })

  const saveDataTxt = computed(() => {
    let txt = '需要退回重新审核后，才能进行下一步操作'
    return `${saveReturnRea.value}，${t(txt)}`
  })

  const compareHandle = () => {
    const obj = nowChangeData.value
    const data = cloneDeep(dataInfo.value.base.old)
    const staticFormData = {
      ...data.credit,
      ...data.project
    }

    let compareBack = {}
    const compareBackObjData = {}

    const backItems = changeBackItems.value
    const arr = []
    for (let i = 0; i < backItems.length; i++) {
      const backMarkItems = backItems[i].backMark.split(',')
      const backObj = {}
      const backMark = backMarkItems.map(item => {
        const markInfo = item.split(':')

        if (!backObj[markInfo[0]]) {
          backObj[markInfo[0]] = markInfo[1]
        }

        if (!compareBackObjData[markInfo[0]]) {
          compareBackObjData[markInfo[0]] = [markInfo[1]]
        } else {
          compareBackObjData[markInfo[0]].push(markInfo[1])
        }
        
        return markInfo[0]
      })

      compareBack = {
        ...compareBack,
        ...backObj
      }

      if (backMark.includes(props.currentStep.mark)) {
        const key = backItems[i].credit_table

        const beforeN = numberStrFormat(staticFormData[key])
        const nowN = numberStrFormat(obj[key])

        const beforeNum = backItems[i].is_ratio ? `${beforeN}${backItems[i].credit_unit}` : `${backItems[i].credit_unit}${beforeN}`
        const nowNum = backItems[i].is_ratio ? `${nowN}${backItems[i].credit_unit}` : `${backItems[i].credit_unit}${nowN}`

        if (Number(staticFormData[key]) !== Number(obj[key])) {
          if (['credit_brokerFeeRate'].includes(key)) {
            if (Number(obj[key]) > Number(staticFormData[key])) {
              arr.push({
                name: findCreditName(key),
                before: beforeNum,
                now: nowNum
              })
            }
          } else if (key === 'credit_frontFee') {
            if (Number(obj[key]) < Number(staticFormData[key])) {
              arr.push({
                name: findCreditName(key),
                before: beforeNum,
                now: nowNum
              })
            }
          } else {
            // 有中介费率
            if ('credit_brokerFeeRate' in obj && 'credit_brokerFee' in obj) {
              if (key !== 'credit_brokerFee') {
                arr.push({
                  name: findCreditName(key),
                  before: beforeNum,
                  now: nowNum
                })
              }
            } else {
              arr.push({
                name: findCreditName(key),
                before: beforeNum,
                now: nowNum
              })
            }
          }
        }
      }
    }

    // 去重每个数组
    for (const key in compareBackObjData) {
      if (Array.isArray(compareBackObjData[key])) {
        compareBackObjData[key] = [...new Set(compareBackObjData[key])];
      }
    }

    compareBackObj.value = compareBackObjData

    if (Object.keys(compareBack).includes(props.currentStep.mark)) {
      // if (obj?.start_date !== staticFormData.start_date) {
      //   arr.unshift({
      //     name: t('开放日期'),
      //     before: staticFormData.start_date,
      //     now: obj?.start_date
      //   })
      // }

      // if (obj?.end_date !== staticFormData.end_date) {
      //   arr.unshift({
      //     name: t('到期日期'),
      //     before: staticFormData.end_date,
      //     now: obj?.end_date
      //   })
      // }

      // 这里不判断日期，改为判断周期是否有改动 - 2025-07-14
      const staticDate = tool.calculateDurationPrecise(staticFormData.start_date, staticFormData.end_date);
      const nowDate = tool.calculateDurationPrecise(obj?.start_date, obj?.end_date);

      if (staticDate.months !== nowDate.months || staticDate.days !== nowDate.days) {
        arr.unshift({
          name: t('项目周期'),
          before: `${staticDate.months} ${t('月')} ${staticDate.days} ${t('天')}`,
          now: `${nowDate.months} ${t('月')} ${nowDate.days} ${t('天')}`
        })
      }

      if ((staticFormData?.initial_equity_amount || staticFormData?.initial_equity_amount === 0) && Number(obj?.initial_equity_amount) !== Number(staticFormData?.initial_equity_amount)) {
        arr.unshift({
          name: t('初始补充股权'),
          before: `$${numberStrFormat(Number(staticFormData?.initial_equity_amount))}`,
          now: `$${numberStrFormat(Number(obj?.initial_equity_amount))}`
        })
      }

      if (Number(obj?.initial_build_amount) !== Number(staticFormData?.initial_build_amount)) {
        arr.unshift({
          name: t('首次建筑贷款放款额'),
          before: `$${numberStrFormat(Number(staticFormData?.initial_build_amount))}`,
          now: `$${numberStrFormat(Number(obj?.initial_build_amount))}`
        })
      }

      if (Number(obj?.initial_land_amount) !== Number(staticFormData?.initial_land_amount)) {
        arr.unshift({
          name: t('首次土地贷款放款额'),
          before: `$${numberStrFormat(Number(staticFormData?.initial_land_amount))}`,
          now: `$${numberStrFormat(Number(obj?.initial_land_amount))}`
        })
      }

      if ((staticFormData?.substitution_amount || Number(staticFormData?.substitution_amount) === 0) && Number(obj?.substitution_amount) !== Number(staticFormData?.substitution_amount)) {
        arr.unshift({
          name: t('再融资金额'),
          before: `$${numberStrFormat(Number(staticFormData?.substitution_amount))}`,
          now: `$${numberStrFormat(Number(obj?.substitution_amount))}`
        })
      }

      if ((staticFormData?.equity_amount || Number(staticFormData?.equity_amount) === 0) && Number(obj?.equity_amount) !== Number(staticFormData?.equity_amount)) {
        arr.unshift({
          name: t('补充股权'),
          before: `$${numberStrFormat(Number(staticFormData?.equity_amount))}`,
          now: `$${numberStrFormat(Number(obj?.equity_amount))}`
        })
      }

      if (Number(obj?.build_amount) !== Number(staticFormData?.build_amount)) {
        arr.unshift({
          name: t('建筑贷款总额'),
          before: `$${numberStrFormat(Number(staticFormData?.build_amount))}`,
          now: `$${numberStrFormat(Number(obj?.build_amount))}`
        })
      }

      if (Number(obj?.land_amount) !== Number(staticFormData?.land_amount)) {
        arr.unshift({
          name: t('土地贷款总额'),
          before: `$${numberStrFormat(Number(staticFormData?.land_amount))}`,
          now: `$${numberStrFormat(Number(obj?.land_amount))}`
        })
      }

      if (Number(obj?.has_linefee) !== Number(staticFormData?.has_linefee)) {
        arr.unshift({
          name: t('是否有Linefee'),
          before: Number(staticFormData?.has_linefee) ? t('是') : t('否'),
          now: Number(obj?.has_linefee) ? t('是') : t('否')
        })
      }
    }

    saveDataTxtArr.value = arr
    return Boolean(arr.length)
  }

  const submitRquest = (params) => {
    params.do__mark = currentMark.value

    subLoading.value = true

    projectAuditSaveStep(params).then((res) => {
      subLoading.value = false
      footerRef.value.nextHandle({
        ...res,
        uuid: props.currentId
      })

      // 触发列表数据刷新
      emitter.emit('refreshRequestsList')
    }).catch(() => {
      subLoading.value = false
    })
  }

  const washTableRef = ref()

  const submitHandle = () => {
    if (subDisabled.value) {
      return false
    }

    if (needInsMark.includes(currentMark.value)) { // 通过审核填写批语
      resovleVisible.value = true;
    } else {
      const params = {
        uuid: props.currentId
      }

      if (changeBackItems.value.length && Object.keys(nowChangeData.value).length && dataInfo.value.base?.old) {
        if (compareHandle()) {
          saveTipsVisible.value = true
          return false
        }
      }

      if (currentMark.value === 'step_open') {
        const not_norm = props.currentStep.not_norm
        if (not_norm) {
          const normObj = JSON.parse(not_norm)
          if (normObj.open) {
            openConfig.value = normObj
            openVisible.value = true
          } else {
            submitRquest(params)
          }
        } else {
          submitRquest(params)
        }
      } else if (currentMark.value === 'fc_open') {
        openVisible.value = true
      } else if (currentMark.value === 'step_aml_audit') {
        const pass = washTableRef.value.tableData.filter(item => !item.condition_time).every(item => item.document && item.document.length)
        if (pass) {
          submitRquest(params)
        } else {
          message.error(t('请确保在提交之前提供所有反洗钱信息'))
        }
      } else {
        submitRquest(params)
      }
    }
  }

  const lendingDataInfo = ref()
  const openDataHandle = (data) => {
    lendingDataInfo.value = data
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
    emits('dataDone', data)
  }

  const returnLogData = ref([])

  const pageLoading = ref(false)
  const getDataInit = async () => {
    pageLoading.value = true
    let infoData = {}

    if (props.currentId) {
      await projectAuditStepDetail({
        uuid: props.currentId
      }).then(res => {
        returnLogData.value = res.base?.cancel_log || []
        infoData = res
      }).catch(() => {
        pageLoading.value = false
      })
    }

    emitter.emit('changeDataLetDis', false)
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

  const handleRefreshSecurityInfo = () => {
    getDataInit()
  }

  const targetChange = () => {
    openBlock.value = !openBlock.value
    emitter.emit('blockShowTarget', openBlock.value);
  }

  const changeBackItems = ref([])
  const nowChangeData = ref({})
  const creditTableInfo = ref([])
  const compareDoneHandle = (data) => {
    changeBackItems.value = data.changeBack || []
    nowChangeData.value = data.nowChangeData || {}
    creditTableInfo.value = data.creditTableInfo || []
  }

  // 退回操作
  const backStepHandle = () => {
    const backStepArr = ['step_lm_audit', 'step_fc_audit', 'step_director_audit', 'step_lm_check', 'step_aml_audit']
    const params = {
      uuid: props.currentId,
      cancel_reason: saveReturnRea.value,
      back_reason: saveReturnRea1.value,
      again_check: 0
    }

    const backArr = compareBackObj.value[props.currentStep.mark] || []
    if (backArr.length) {
      const back_step = backStepArr.find(val => backArr.includes(val));
      params.back_step = back_step || ''
    }

    projectAuditGoback(params).then(() => {
      changeFeeRef.value.changeLoading(false)
      navigationTo(`/requests/details?uuid=${props.currentId}`)
    }).catch(() => {
      changeFeeRef.value.changeLoading(false)
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
    // 模块初始化
    blockInit()

    if (!props.check) {
      getDataInit()
    }

    emitter.on('refreshSecurityInfo', handleRefreshSecurityInfo)

    emitter.on('changeDataLetDis', (flag) => {
      dataLetDisabled.value = flag
    })
  })

  onUnmounted(() => {
    emitter.off('refreshSecurityInfo', handleRefreshSecurityInfo)
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