<template>
  <div class="block-container">
    <!-- 借款人信息编辑弹窗 -->
    <check-edit-dialog
      v-model:visible="showCheckDialog"
      :info-data="currentInfoData"
      :type="currentType"
      @done="dataRefresh"
    ></check-edit-dialog>

    <div class="left-content">
      <div class="block-item mb">
        <vco-process-title :title="t('借款人信息')">
          <div class="flex gap-5">
            <a-popconfirm
              v-if="!borrowerInfoData.isCheck"
              :title="t('确定通过审核吗？')"
              :ok-text="t('确定')"
              :cancel-text="t('取消')"
            >
              <a-button
                type="dark" shape="round"
              >{{ t('审核') }}</a-button>
            </a-popconfirm>
            <a-button
              type="primary" shape="round"
              @click="showEdit(1)"
            >{{ t('编辑') }}</a-button>
          </div>
        </vco-process-title>
        <borrower-info :data="borrowerInfoData"></borrower-info>
      </div>
      <div class="block-item mb">
        <vco-process-title :title="t('项目信息')">
          <div class="flex gap-5">
            <a-popconfirm
              v-if="!projectInfoData.isCheck"
              :title="t('确定通过审核吗？')"
              :ok-text="t('确定')"
              :cancel-text="t('取消')"
            >
              <a-button
                type="dark" shape="round"
              >{{ t('审核') }}</a-button>
            </a-popconfirm>
            <a-button
              type="primary" shape="round"
              @click="showEdit(2)"
            >{{ t('编辑') }}</a-button>
          </div>
        </vco-process-title>
        <project-info :data="projectInfoData"></project-info>
      </div>
      <div class="block-item mb">
        <vco-process-title :title="t('证件资料')">
          <div class="flex gap-5">
            <a-popconfirm
              v-if="!documentInfoData.isCheck"
              :title="t('确定通过审核吗？')"
              :ok-text="t('确定')"
              :cancel-text="t('取消')"
            >
              <a-button
                type="dark" shape="round"
              >{{ t('审核') }}</a-button>
            </a-popconfirm>
            <a-button
              type="primary" shape="round"
              @click="showEdit(3)"
            >{{ t('编辑') }}</a-button>
          </div>
        </vco-process-title>
        <document-info :data="documentInfoData"></document-info>
      </div>
      <div class="block-item mb">
        <vco-process-title :title="t('借款信息')">
          <div class="flex gap-5">
            <a-popconfirm
              v-if="!loanInfoData.isCheck"
              :title="t('确定通过审核吗？')"
              :ok-text="t('确定')"
              :cancel-text="t('取消')"
            >
              <a-button
                type="dark" shape="round"
              >{{ t('审核') }}</a-button>
            </a-popconfirm>
            <a-button
              type="primary" shape="round"
              @click="showEdit(4)"
            >{{ t('编辑') }}</a-button>
          </div>
        </vco-process-title>
        <loan-info :data="loanInfoData"></loan-info>
      </div>

      <div class="sys-form-content">
        <div class="flex mt-10 items-end gap-20 justify-between">
          <div>
            <a-button
              type="grey"
              shape="round"
              class="weight uppercase"
              :loading="draftLoading"
              @click="draftHandle"
            >{{ t('保存草稿') }}</a-button>
            <p v-if="hasDrafData" class="mt-2 text-sm pl-1 form-tips-color">{{ t('* 存在草稿数据，请点击{0}保存', [`"${t('提交审核1')}"`]) }}</p>
          </div>
          <div class="flex gap-5">
            <a-button
              type="primary" shape="round" class="big shadow bold uppercase"
            >{{ t('撤回') }}</a-button>
            <a-button
              type="dark" shape="round" class="big shadow bold uppercase"
              @click="submitHandle"
              :loading="subLoading"
            >{{ t('提交审核1') }}</a-button>
          </div>
        </div>
      </div>
    </div>

    <div class="right-content">
      2
    </div>
  </div>
</template>

<script setup>
  import { reactive, ref, watch } from "vue";
  import dayjs from "dayjs";
  import { useI18n } from "vue-i18n";
  import { cloneDeep } from "lodash";
  import { projectApplySaveLoanInfo, projectSaveSaveDraft, projectLmAuditDetail } from "@/api/process";
  import tool, { navigationTo } from "@/utils/tool";
  import { message } from "ant-design-vue/es";
  import BorrowerInfo from "./components/BorrowerInfo.vue";
  import ProjectInfo from "./components/ProjectInfo.vue";
  import DocumentInfo from "./components/DocumentInfo.vue";
  import LoanInfo from "./components/LoanInfo.vue";
  import CheckEditDialog from "./components/CheckEditDialog.vue";

  const props = defineProps({
    infoData: {
      type: Object,
      default: () => {}
    },
    draftData: {
      type: Object,
      default: () => {}
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

  const borrowerInfoData = ref()
  const projectInfoData = ref()
  const documentInfoData = ref()
  const loanInfoData = ref()

  const showCheckDialog = ref(false)
  const currentInfoData = ref(null)
  const currentType = ref('')

  const showEdit = (type) => {
    let data = null
    if (type === 1) {
      data = borrowerInfoData.value
      currentType.value = 'one'
    } else if (type === 2) {
      data = projectInfoData.value
      currentType.value = 'two'
    } else if (type === 3) {
      data = documentInfoData.value
      currentType.value = 'three'
    } else if (type === 4) {
      data = loanInfoData.value
      currentType.value = 'four'
    }

    if (data) {
      currentInfoData.value = cloneDeep(data)
      showCheckDialog.value = true
    }
  }

  const fullBaseInfo = (data) => {
    console.log('fdsafdsa', data)
    // 基础信息
    borrowerInfoData.value = data.borrower_info
    projectInfoData.value = data.project_info
    documentInfoData.value = data.project_cert
    loanInfoData.value = data.loan_info
  }

  const dataInit = () => {
    const data = cloneDeep(props.infoData)
    
    fullBaseInfo(data)
    console.log('data', data)

    // if (data && data.start_date && data.end_date) {
    //   data.time_date = [data.start_date, data.end_date]
    //   timeChange(data.time_date)
    // }
    // const draftData = cloneDeep(props.draftData)

    // let useData = data
    // if (draftData && Object.keys(draftData).length) {
    //   useData = draftData
    //   hasDrafData.value = true
    // }

    // for (const key in formState) {
    //   if (key === 'time_date' && useData[key]) {
    //     formState.time_date = [dayjs(useData[key][0]), dayjs(useData[key][1])]
    //   } else {
    //     formState[key] = useData[key] || formState[key] || ''
    //   }
    // }
  }

  const dataRefresh = () => {
    projectLmAuditDetail({
      uuid: props.infoData.uuid
    }).then(res => {
      fullBaseInfo(res)
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
</script>

<style lang="less" scoped>
  @import '././styles/common.less';
  .sys-form-content {
    :deep(.ant-input-number-input) {
      font-size: 18px !important;
    }
  }
</style>