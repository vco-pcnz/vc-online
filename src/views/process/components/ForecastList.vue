<template>
  <div class="mt-6">
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
        <p>{{ t('{0}以后已手动修改的放款是否保留已设置的值', [tool.showDate(currentParams.date)]) }}</p>
        <div class="mt-5 flex justify-between gap-5">
          <a-button
            type="dark" class="big shadow bold uppercase w-full mb-5 mt-5"
            :loading="sub1Loading"
            @click="sureHandle(0)"
          >{{ t('不，谢谢') }}</a-button>

          <a-button
            type="dark" class="big shadow bold uppercase w-full mb-5 mt-5"
            :loading="sub2Loading"
            @click="sureHandle(1)"
          >{{ t('是的，保留') }}</a-button>
        </div>
      </div>
    </a-modal>

    <!-- 编辑弹窗 -->
    <a-modal
      :open="visible"
      :title="dialogTitle"
      :width="500"
      :footer="null"
      :keyboard="false"
      :maskClosable="false"
      @cancel="visible = false"
    >
      <div class="sys-form-content mt-5">
        <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
          <a-form-item :label="t('类型')" name="type">
            <a-select v-model:value="formState.type">
              <a-select-option :value="2">{{ t('放款') }}</a-select-option>
              <a-select-option :value="4">{{ t('还款') }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item :label="t('日期')" name="date">
            <a-date-picker
              v-model:value="formState.date"
              :disabled="disabledDateSelcet"
              :disabledDate="disabledDateFormat"
              placeholder=""
            />
          </a-form-item>
          <a-form-item :label="t('金额')" name="amount">
            <a-input-number
              v-model:value="formState.amount"
              :formatter="value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="value => value.replace(/\$\s?|(,*)/g, '')"
            />
          </a-form-item>
          <a-form-item :label="t('备注')" name="note">
            <a-textarea v-model:value="formState.note" />
          </a-form-item>
        </a-form>

        <a-button
          type="dark" class="big shadow bold uppercase w-full mb-5 mt-5"
          @click="submitHandle"
        >{{ t('保存') }}</a-button>
      </div>
    </a-modal>


    <div class="block-item sec">
      <vco-process-title :title="t('预测列表')">
        <div class="flex gap-3">
          <a-button
            v-if="tabData.length"
            type="dark" shape="round"
            size="small"
            class="uppercase"
            @click="navigationTo(`/requests/schedule?uuid_info=${currentId}`)"
          >{{ t('放款计划') }}</a-button>
          <a-button
            type="primary" shape="round"
            size="small"
            class="uppercase"
            @click="addEditHandle(null)"
          >{{ t('添加') }}</a-button>
        </div>
        
      </vco-process-title>

      <a-spin :spinning="tabLoading" size="large">
        <div class="table-content">
          <div class="col-item th">
            <div class="item uppercase">{{ t('日期') }}</div>
            <div class="item uppercase">{{ t('类型') }}</div>
            <div class="item uppercase">{{ t('金额') }}</div>
            <div class="item uppercase">{{ t('操作1') }}</div>
          </div>

          <div class="col-content">
            <div v-for="(item, index) in tabData" :key="index" class="col-block">
              <div v-for="(_item, _index) in item" :key="_item.date" class="col-item">
                <div class="item">{{ tool.showDate(_item.date) }}</div>
                <div class="item">{{ _item.name }}</div>
                <div class="item">
                  <vco-number :value="_item.amount" :precision="2" :end="true"></vco-number>
                </div>
                <div class="item ops">
                  <i class="iconfont" @click="addEditHandle(_item, index, _index)">&#xe8cf;</i>
                  <i class="iconfont" @click="removeHandle(_item)">&#xe8c1;</i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="tabData.length" class="forecast-total mt-5">
          <p>{{ cTimes }}<span class="pl-1">{{ t('笔放款') }}</span></p>
          <div :class="{'error': errorColor}">
            <vco-number :value="cMoney" :precision="2" :end="true"></vco-number>
            <p v-if="showTips">{{ showTips }}</p>
          </div>
        </div>
        <div v-if="Number(pTimes)" class="forecast-total mt-1">
          <p><i class="iconfont">&#xe757;</i>{{ pTimes }}<span class="pl-1">{{ t('笔还款') }}</span></p>
          <vco-number :value="pMoney" :precision="2" :end="true"></vco-number>
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed, reactive } from "vue";
  import { useI18n } from "vue-i18n";
  import dayjs from "dayjs";
  import { cloneDeep } from "lodash";
  import { projectForecastDarwDownList, projectForecastAdd, projectForecastDelete } from "@/api/process"
  import tool, { numberStrFormat, navigationTo } from "@/utils/tool"
  import emitter from "@/event"

  const props = defineProps({
    infoData: {
      type: Object,
      default: () => {}
    },
    currentId: {
      type: [Number, String],
      required: true
    }
  })

  const { t } = useI18n();
  const tabData = ref([]);
  const tabLoading = ref(false)
  const cTimes = ref(0)
  const cMoney = ref(0)
  const pTimes = ref(0)
  const pMoney = ref(0)
  const sMoney = ref(0)
  const loanMoney = ref(0)
  const errorColor = ref(false)

  const visible = ref(false)
  const dialogTitle = ref('')
  const disabledDateSelcet = ref(false)

  const showTips = computed(() => {
    let txt = ''
    const diff = tool.minus(cMoney.value, loanMoney.value)
    const diffNum = Number(diff)
    if (diffNum > 0) {
      txt = t('估价高于借款金额{0}', [numberStrFormat(diffNum)])
    }
    if (diffNum < 0) {
      txt = t('估价低于借款金额{0}', [numberStrFormat(diffNum)])
    }
    errorColor.value = diffNum !== 0
    return txt
  })

  const disabledDates = computed(() => {
    const data = cloneDeep(tabData.value).flat(Infinity)
    const timeArr = data.map(item => item.date)
    return timeArr
  })

  const disabledDateFormat = (current) => {
    const startDate = props.infoData.loan_info.start_date
    const endDate = props.infoData.loan_info.end_date

    if (current && current.isBefore(startDate, 'day')) {
      return true;
    }

    if (current && current.isAfter(endDate, 'day')) {
      return true;
    }

    const dateString = current.format('YYYY-MM-DD');
    if (disabledDates.value.includes(dateString)) {
      return true;
    }

    return false;
  }

  const formRef = ref()
  const formState = reactive({
    id: 0,
    type: undefined,
    date: "",
    amount: "",
    note: "",
    first: ""
  })

  const formRules = {
    type: [
      { required: true, message: t('请选择') + t('类型'), trigger: 'change' }
    ],
    date: [
      { required: true, message: t('请选择') + t('日期'), trigger: 'change' }
    ],
    amount: [
      { required: true, message: t('请输入') + t('金额'), trigger: 'blur' }
    ]
  }

  const getTableData = () => {
    tabLoading.value = true
    projectForecastDarwDownList({
      page: 1,
      limit: 5000,
      uuid: props.currentId
    }).then(res => {
      const dataArr = []
      const data = res.data.list || {}

      if (Object.keys(data).length) {
        for (const key in data) {
          dataArr.push(data[key])
        }
      }

      cTimes.value = res.data.drawDownCount
      cMoney.value = Number(res.data.drawDownMoney)
      pTimes.value = res.data.repaymentsCount
      pMoney.value = Math.abs(res.data.repaymentsMoney)
      sMoney.value = Number(res.data.settlementMoney)

      loanMoney.value = Number(res.data.loanMoney)

      tabData.value = dataArr
      tabLoading.value = false
    }).catch(() => {
      tabLoading.value = false
    })
  }

  const addEditHandle = (data, index, _index) => {
    const nameStr = t('预测项')
    dialogTitle.value = data ? t('编辑{0}', [nameStr]) : t('新增{0}', [nameStr])
    disabledDateSelcet.value = index === 0 && _index === 0

    if (data) {
      formState.id = data.id
      formState.type = data.type
      formState.date = dayjs(data.date)
      formState.amount = data.amount
      formState.note = data.note
      formState.first = data.first
    } else {
      formState.id = 0
      formState.type = 2
      formState.date = ""
      formState.amount = ""
      formState.note = ""
    }
    visible.value = true
  }

  const tipsVisible = ref(false)
  const handleType = ref(0)
  const currentParams = ref()

  const removeHandle = (data) => {
    const {id, date} = data
    const params = {
      apply_uuid: props.currentId,
      id: [id],
      date
    }

    currentParams.value = params
    tipsVisible.value = true
    handleType.value = 1
  }

  const submitHandle = () => {
    formRef.value
    .validate()
    .then(() => {
      const {id, type, date, amount, note, first} = formState
      const params = {
        id,
        type,
        date: date.format('YYYY-MM-DD'),
        amount,
        note,
        apply_uuid: props.currentId
      }

      if (id) {
        params.first = first
      }
      currentParams.value = params
      tipsVisible.value = true
      handleType.value = 0
    })
    .catch(error => {
      console.log('error', error);
    });
  }

  const sub1Loading = ref(false)
  const sub2Loading = ref(false)
  const sureHandle = (type) => {
    const loading = type ? sub2Loading : sub1Loading
    loading.value = true

    const ajaxFn = handleType.value ? projectForecastDelete : projectForecastAdd

    ajaxFn({
      ...currentParams.value,
      change: type
    }).then(() => {
      getTableData()
      tipsVisible.value = false
      visible.value = false
      loading.value = false
    }).catch(() => {
      loading.value = false
    })
  }

  onMounted(() => {
    getTableData()

    emitter.on('refreshForecastList', () => {
      getTableData()
    })
  })
</script>

<style lang="less" scoped>
  @import '@/styles/variables.less';

  .table-content {
    .col-item {
      width: 100%;
      font-size: 13px;
      overflow: hidden;
      position: relative;
      &.th {
        font-weight: 500;
        margin-top: 10px;
        padding: 0 10px;
      }
      > .item {
        word-break: break-all;
        float: left;
        &:nth-child(1) {
          width: 85px;
        }
        &:nth-child(2) {
          text-align: center;
          width: 95px;
        }
        &:nth-child(3) {
          text-align: center;
          width: 130px;
        }
        &:last-child {
          position: absolute;
          right: 10px;
        }
        &.ops {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 5px;
          > i {
            cursor: pointer;
            color: @colorPrimary;
            &:hover {
              opacity: 0.8;
            }
          }
        }
      }
    }
    .col-content {
      min-height: 80px;
      max-height: 500px;
      overflow-y: scroll;
      overflow-x: hidden;
      margin-top: 5px;
      padding: 0 5px;
      .col-block {
        border-bottom: 1px solid #e2e5e2;
        margin-top: 5px;
      }
      .col-item {
        padding: 7px 5px;
        :deep(.ant-statistic-content) {
          font-weight: 500 !important;
          font-size: 14px !important;
        }
        > .item {
          &:nth-child(1) {
            color: #999;
          }
          &:last-child {
            right: 0;
          }
        }
      }
    }
  }

  .forecast-total {
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    > p {
      width: 40%;
      line-height: 38px;
      > i {
        font-size: 13px;
        margin-right: 7px;
      }
    }
    > div {
      width: 60%;
      text-align: right;
    }
    .error {
      :deep(.ant-statistic-content) {
        color: @color_red-error !important;
      }
      color: @color_red-error !important;
    }
  }

  .sys-form-content {
    :deep(.ant-form-item-label) {
      label {
        text-transform: uppercase;
      }
    }
    :deep(.ant-input-number-input) {
      font-size: 18px !important;
    }
  }

  .tips-content {
    padding: 30px;
    padding-bottom: 0;
    p {
      font-size: 14px;
      text-align: center;
    }
  }
</style>