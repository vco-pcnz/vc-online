<template>
  <a-modal :open="visible" :title="t('项目Open')" :width="500" :footer="null" :keyboard="false" :maskClosable="false" @cancel="updateVisible(false)">

    <!-- 再融资项目改动后弹窗 -->
    <vco-confirm-alert
      ref="changeRefinancialRef"
      :confirm-txt="saveDataTxt"
      v-model:visible="backStepVisible"
      @submit="backStepHandle"
    ></vco-confirm-alert>

    <div class="sys-form-content mt-5">
      <a-row :gutter="24">
        <a-col :span="24">
          <div class="info-content">
            <p class="name mb-2 required">{{ t('开放日期') }}</p>
            <a-date-picker v-model:value="openDate" :format="selectDateFormat()" :disabledDate="disabledDate" placeholder="" @change="openDateChange" />
          </div>
          <div class="error-tips">{{ backReasonTxt }}</div>
        </a-col>
        <a-col :span="10" class="mt-2">
          <div class="info-content">
            <p class="name">{{ t('确认贷款日期') }}</p>
            <p class="txt">{{ tool.showDate(startDate) + ' - ' + tool.showDate(endDate) }}</p>
          </div>
        </a-col>
        <a-col :span="8" class="mt-2">
          <div class="info-content">
            <p class="name">{{ t('借款周期') }}</p>
            <p class="txt">{{ showTerm }}</p>
          </div>
        </a-col>
        <a-col :span="6" class="mt-2">
          <div class="info-content">
            <p class="name">{{ t('总天数') }}</p>
            <p class="txt">{{ showTotalDay }}</p>
          </div>
        </a-col>
        <a-col v-if="fonfirmTable.length" :span="24" class="mt-4">
          <p style="font-size: 12px; color: #666" class="mb-2 required">{{ t('请确认以下信息') }}</p>
          <div class="confirm-content">
            <div v-for="item in fonfirmTable" :key="item.credit_table" class="item">
              <div>
                <p>{{ item.credit_name }}</p>
                <vco-number
                  :prefix="item.is_ratio ? '' : item.credit_unit"
                  :suffix="item.is_ratio ? item.credit_unit : ''"
                  :value="item.showVal"
                  :precision="2"
                  :end="true"
                  size="fs_md"
                ></vco-number>
              </div>
              <a-checkbox v-model:checked="confirmForm[item.credit_table]">{{ t('正确') }}</a-checkbox>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <div class="mt-5 flex justify-between gap-5">
      <a-button type="grey" class="big shadow bold uppercase w-full mb-5 mt-5" @click="updateVisible(false)">{{ t('取消') }}</a-button>

      <a-button type="dark" class="big shadow bold uppercase w-full mb-5 mt-5" :loading="subLoading" :disabled="subDisabled" @click="submitHandle">{{ t('确定') }}</a-button>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import tool, { selectDateFormat, navigationTo } from '@/utils/tool';
import dayjs from 'dayjs';
import { message } from 'ant-design-vue';
import { projectAuditSaveMode, projectAuditSaveStep, projectAuditSubstitution, projectAuditGoback } from '@/api/process';

const emits = defineEmits(['update:visible', 'done']);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  uuid: {
    type: String,
    default: ''
  },
  infoData: {
    type: Object,
    default: () => {}
  },
  lendingInfo: {
    type: Object,
    default: () => {}
  },
  openConfig: {
    type: Object,
    default: () => {}
  },
  blockInfo: {
    type: Object,
    default: () => {}
  },
  compareBackObj: {
    type: Object,
  },
  type: {
    type: String,
    default: ''
  }
});

const { t } = useI18n();

const changeLoading = (flag) => {
  subLoading.value = flag;
};

const subDisabled = computed(() => {
  if (fonfirmTable.value.length) {
    return !Boolean(Object.values(confirmForm.value).every((item) => item)) || !openDate.value;
  } else {
    return !openDate.value;
  }
});

/* 更新visible */
const updateVisible = (value) => {
  emits('update:visible', value);
};

const openDate = ref('');
const startDate = ref('');
const endDate = ref('');

const subLoading = ref(false);
const submitRquest = () => {
  const params = {
    uuid: props.uuid,
    do__mark: props.type
  };

  projectAuditSaveStep(params)
    .then((res) => {
      changeLoading(false);

      emits('done');
    })
    .catch(() => {
      changeLoading(false);
    });
};

const currentBackSetp = ref('')

const changeRefinancialRef = ref()
const backStepVisible = ref(false)

const backStepHandle = async () => {
  try {
    const loadParams = {
      start_date: startDate.value,
      end_date: endDate.value,
      substitution_ids: [],
      substitution_amount: 0,
      substitution_data: {},
      uuid: props.uuid,
      code: props.blockInfo.loan.code
    };

    await projectAuditSaveMode(loadParams)

    const params = {
      uuid: props.uuid,
      cancel_reason: cancelReasonTxt.value,
      back_reason: backReasonTxt.value,
      again_check: 0,
      back_step: 'step_lm_audit' // 固定返回到LM提交
      // back_step: currentBackSetp.value
    }

    projectAuditGoback(params).then(() => {
      changeRefinancialRef.value.changeLoading(false)
      navigationTo(`/requests/details?uuid=${props.uuid}`)
    }).catch(() => {
      changeRefinancialRef.value.changeLoading(false)
    })
  } catch {
    changeRefinancialRef.value.changeLoading(false)
  }
};

const cancelReasonArr = ref([])
const backReasonArr = ref([])

const cancelReasonTxt = computed(() => {
  return cancelReasonArr.value.join(', ')
})
const backReasonTxt = computed(() => {
  return backReasonArr.value.join(', ')
})
const saveDataTxt = computed(() => {
  let txt = '需要退回并重新设置审核后，才能进行下一步操作'
  return `${cancelReasonTxt.value}，${t(txt)}`
})

const getRefinancialInfo = async () => {
  const isRefinancial = props.lendingInfo?.data?.substitution_ids && props.lendingInfo?.data?.substitution_ids.length;

  if (props.infoData.lending.start_date !== startDate.value && Boolean(isRefinancial)) {
    const subList =  await projectAuditSubstitution({
      start_date: startDate.value,
      uuid: props.uuid
    })

    const setData = props.lendingInfo.data.substitution_data || {}
    for (const key in setData) {
      const obj = setData[key]
      const item = subList.find(item => item.uuid === key)
      const cancelTips = []
      const backTips = []

      if (item) {
        const repaymentObj = item.allRepayment
        if (Number(obj.reduction_money_input) && Number(obj.reduction_money_input) === Number(obj.reduction_money)) {
          cancelTips.push(t(`设置的再融资项目：{0}， 为罚息全额减免：{1}，{2}的全额减免额度为：{3}`, [item.project_name, obj.reduction_money_input, startDate.value, repaymentObj.reduction_money]))
          backTips.push(t(`设置的再融资项目：{0}， 为罚息全额减免：{1}，{2}的全额减免额度为：{3}1`, [item.project_name, obj.reduction_money_input, startDate.value, repaymentObj.reduction_money]))
        } else {
          if (Number(obj.reduction_money_input) > Number(repaymentObj.reduction_money)) {
            cancelTips.push(t(`设置的再融资项目：{0}， 罚息减免为：{1}，已超出{2}下的最大减免额度：{3}`, [item.project_name, obj.reduction_money_input, startDate.value, repaymentObj.reduction_money]))
            backTips.push(t(`设置的再融资项目：{0}， 罚息减免为：{1}，已超出{2}下的最大减免额度：{3}1`, [item.project_name, obj.reduction_money_input, startDate.value, repaymentObj.reduction_money]))
          }

          if (Number(obj.reduction_money_input) && Number(obj.reduction_money_input) === Number(repaymentObj.reduction_money)) {
            cancelTips.push(t(`设置的再融资项目：{0}， 罚息减免为：{1}，已达到了{2}下的全额减免额度：{3}`, [item.project_name, obj.reduction_money_input, startDate.value, repaymentObj.reduction_money]))
            backTips.push(t(`设置的再融资项目：{0}， 罚息减免为：{1}，已达到了{2}下的全额减免额度：{3}1`, [item.project_name, obj.reduction_money_input, startDate.value, repaymentObj.reduction_money]))
          }
        }
      } else {
        cancelTips.push(t(`设置的再融资项目：{0}， 在{1}下不存在`, [item.project_name, startDate.value]))
        backTips.push(t(`设置的再融资项目：{0}， 在{1}下不存在1`, [item.project_name, startDate.value]))
      }
      cancelReasonArr.value = cancelTips
      backReasonArr.value = backTips
    }
  }
}

const submitHandle = async () => {
  if (!openDate.value) {
    message.error(t('请选择') + t('开放日期'));
  } else {

    const loadParams = {
      start_date: startDate.value,
      end_date: endDate.value,
      uuid: props.uuid,
      code: props.blockInfo.loan.code,
      do__open: 1
    };

    const isRefinancial = props.lendingInfo?.data?.substitution_ids && props.lendingInfo?.data?.substitution_ids.length;

    if (props.infoData.lending.start_date !== startDate.value) {
      if (Boolean(isRefinancial) && backReasonArr.value.length) {
        const backObj = props.compareBackObj || {}
        const backArr = backObj[props.type] || []
        if (backArr.length) {
          const back_step = backArr[0]
          currentBackSetp.value = back_step
          backStepVisible.value = true
        }
      } else {
        changeLoading(true);
        await projectAuditSaveMode(loadParams)
        .then(() => {
          submitRquest();
        })
        .catch(() => {
          changeLoading(false);
        });
      }
    } else {
      changeLoading(true);
      submitRquest();
    }
  }
};

const disabledDate = (currentDate) => {
  return currentDate && currentDate.valueOf() > Date.now();
};

const openDateChange = (date) => {
  if (date) {
    const { start_date, end_date } = props.infoData.lending;
    const calcDay = tool.calculateDurationPrecise(start_date, end_date);
    const months = calcDay.months;
    const days = calcDay.days;
    const gapDay = calcDay.gapDay;

    if (gapDay) {
      let statrDate = dayjs(date);
      // const endDateStr = tool.calculateEndDateByDays(statrDate, gapDay);
      const endDateStr = tool.calculateEndDate(statrDate, months, days);

      startDate.value = dayjs(date).format('YYYY-MM-DD');
      endDate.value = endDateStr;
    }

    getRefinancialInfo()
  }
};

const showTerm = computed(() => {
  const data = tool.calculateDurationPrecise(startDate.value, endDate.value);
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
  const data = tool.calculateDurationPrecise(startDate.value, endDate.value);
  return data.gapDay || 0;
});

const confirmForm = ref({});
const fonfirmTable = ref([]);

const configInit = () => {
  const fees = props.openConfig.fee || [];
  const { data, table } = props.lendingInfo;
  if (fees && fees.length) {
    for (let i = 0; i < fees.length; i++) {
      confirmForm.value[fees[i]] = false;

      const obj = table.find((item) => item.credit_table === fees[i]);
      if (obj) {
        obj.showVal = data[fees[i]];
      }
      fonfirmTable.value.push(obj);
    }
  }

  // 第一项增加首次放款
  const drawdown = tool.plus(Number(data.initial_land_amount), Number(data.initial_build_amount))

  confirmForm.value['initial_drawdown'] = false
  fonfirmTable.value.unshift({
    credit_name: 'Initial drawdown',
    credit_table: 'initial_drawdown',
    credit_unit: '$',
    showVal: drawdown
  })

  const loanAmount = tool.plus(Number(data.land_amount), Number(data.build_amount))

  confirmForm.value['loan_amount'] = false
  fonfirmTable.value.unshift({
    credit_name: 'Loan amount',
    credit_table: 'loan_amount',
    credit_unit: '$',
    showVal: loanAmount
  })
};

watch(
  () => props.visible,
  (val) => {
    if (!val) {
      subLoading.value = false;
      openDate.value = '';
      confirmForm.value = {};
      fonfirmTable.value = [];
    } else {
      // openDate.value = dayjs(props.infoData.start_date)

      startDate.value = props.infoData.lending.start_date;
      endDate.value = props.infoData.lending.end_date;

      configInit();
    }
  }
);
</script>

<style lang="less" scoped>
.info-content {
  margin-top: 10px;
  .name {
    font-size: 12px;
    color: #666;
  }
  .txt {
    font-size: 13px;
    font-weight: 500;
    :deep(.ant-statistic-content) {
      font-size: 16px !important;
    }
  }
}

.confirm-content {
  border: 1px solid #272727 !important;
  border-radius: 10px !important;
  background-color: #f7f9f8;
  padding: 10px 15px;
  > .item {
    border-bottom: 1px dashed #ddd;
    padding: 5px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    &:last-child {
      border-bottom: none;
    }
    > div {
      > p {
        color: #666;
        font-size: 12px;
        &:last-child {
          font-size: 13px;
          font-weight: 500;
          color: #272727;
        }
      }
    }
  }
}
.required::before {
  display: inline-block;
  margin-inline-end: 4px;
  color: #ff4d4f;
  font-size: 14px;
  font-family: SimSun, sans-serif;
  line-height: 1;
  content: '*';
}

.error-tips {
  font-size: 12px;
  color: #ff4d4f;
  margin-top: 5px;
}
</style>
