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

    <!-- 项目open -->
    <open-dialog
      v-if="currentDataInfo"
      :uuid="currentId"
      :open-config="openConfig"
      :block-info="PageBlockObjRef"
      :info-data="currentDataInfo.loan"
      :lending-info="lendingDataInfo"
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
          ></temp-block>

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
  import ConditionsList from "./../../components/ConditionsList.vue";
  import WashTable from './components/WashTable.vue';
  import emitter from "@/event"
  import useProcessStore from "@/store/modules/process"
  import OpenDialog from "./components/OpenDialog.vue";
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

  const openBlock = ref(true)

  // 审核需要填写原因的流程
  const needInsMark = ['step_fc_audit', 'step_director_audit']

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