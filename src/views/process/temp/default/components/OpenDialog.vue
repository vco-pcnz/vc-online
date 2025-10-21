<template>
  <a-modal :open="visible" :title="t('项目Open')" :width="hasRefinancialInfo ? 960 : 500" :footer="null" :keyboard="false" :maskClosable="false" @cancel="updateVisible(false)">

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
        <a-col v-if="selectedStaticDatas.length" :span="24">
          <div class="info-content">
            <div class="name mb-2 flex justify-between items-center">
              <p>{{ t('再融资项目') }}</p>
              <a-popover :title="t('最初设定值')" trigger="click">
                <template #content>
                  <div class="refinancial-table">
                    <div class="th col-item">
                      <div>{{ t('建议标准税率') }}(%)</div>
                      <div>{{ t('罚息减免最大额度') }}</div>
                      <div>{{ t('还款总额') }}</div>
                      <div>{{ t('减免额度') }}</div>
                      <div>{{ t('还款金额1') }}</div>
                      <div>Loan IRR</div>
                    </div>
                    <div v-for="col in selectedStaticDatas" :key="col.value" class="col-item tr">
                      <div>
                        <a-input-number
                          :max="99999999999"
                          :min="col.item.allRepayment.min_StandardRate"
                          v-model:value="col.item.allRepayment.StandardRate"
                          :formatter="
                            (value) =>
                              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                          "
                          :controls="false"
                          :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                          :disabled="true"
                        >
                          <template #addonAfter>
                            <a-tooltip placement="top">
                              <template #title>
                                <p>{{ col.label }}</p>
                                <p>{{ `${t('最小值')}: ${col.item.allRepayment.min_StandardRate}%` }}</p>
                              </template>
                              <i class="iconfont limit-icon">&#xe6b3;</i>
                            </a-tooltip>
                          </template>
                        </a-input-number>
                      </div>
                      <div>{{ `$${numberStrFormat(col.item.allRepayment.reduction_money)}` }}</div>
                      <div class="row">
                        <div>{{ `$${numberStrFormat(col.item.allRepayment.last_money)}` }}</div>
                        <i class="iconfont">&#xe711;</i>
                      </div>
                      <div class="input">
                        <a-input-number
                          :max="Number(col.item.allRepayment.reduction_money)"
                          v-model:value="col.item.allRepayment.reduction_money_input"
                          :formatter="
                            (value) =>
                              `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                          "
                          :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                          :controls="false"
                          :disabled="true"
                        >
                        </a-input-number>
                      </div>
                      <div>{{ repaymentAmount(col) }}</div>
                      <div class="row gap-2">
                        {{ col.item.allRepayment.new_irr }}
                        <p>({{ col.item.allRepayment.irr }})</p>
                      </div>
                    </div>
                  </div>
                </template>
                <a-button class="ant-btn-link">{{ t('最初设定值') }}</a-button>
              </a-popover>
            </div>
            
            <div class="refinancial-content">
              <a-select
                v-model:value="refinancialIds"
                mode="multiple"
                :options="refinancialData"
                :filter-option="filterOption"
                :placeholder="t('请选择项目')"
                :loading="refinancialLoading"
                :disabled="!openDate"
                @change="(value, option) => refinancialChange(option)"
              >
                <template #option="{ label, value, item }">
                  <p>{{ label }}</p>
                  <p style="color: #666; font-size: 12px;">{{ item.project_apply_sn }}</p>
                </template>
              </a-select>

              <div v-if="selectedDatas.length" class="refinancial-table">
                <div class="th col-item">
                  <div>{{ t('建议标准税率') }}(%)</div>
                  <div>{{ t('罚息减免最大额度') }}</div>
                  <div>{{ t('还款总额') }}</div>
                  <div>{{ t('减免额度') }}</div>
                  <div>{{ t('还款金额1') }}</div>
                  <div>Loan IRR</div>
                </div>
                <div v-for="col in selectedDatas" :key="col.value" class="col-item tr">
                  <div>
                    <a-input-number
                      :max="99999999999"
                      :min="col.item.allRepayment.min_StandardRate"
                      v-model:value="col.item.allRepayment.StandardRate"
                      :formatter="
                        (value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      "
                      :controls="false"
                      :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                      :disabled="!openDate"
                      @input="() => refinancialInputChange(col)"
                      @blur="() => refinancialInputBlur(col)"
                    >
                      <template #addonAfter>
                        <a-tooltip placement="top">
                          <template #title>
                            <p>{{ col.label }}</p>
                            <p>{{ `${t('最小值')}: ${col.item.allRepayment.min_StandardRate}%` }}</p>
                          </template>
                          <i class="iconfont limit-icon">&#xe6b3;</i>
                        </a-tooltip>
                      </template>
                    </a-input-number>
                  </div>
                  <div>{{ `$${numberStrFormat(col.item.allRepayment.reduction_money)}` }}</div>
                  <div class="row">
                    <div>{{ `$${numberStrFormat(col.item.allRepayment.last_money)}` }}</div>
                    <i class="iconfont">&#xe711;</i>
                  </div>
                  <div class="input">
                    <a-input-number
                      :max="Number(col.item.allRepayment.reduction_money)"
                      v-model:value="col.item.allRepayment.reduction_money_input"
                      :formatter="
                        (value) =>
                          `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      "
                      :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                      :controls="false"
                      :disabled="!openDate"
                      @input="() => refinancialCaclIrr(col)"
                    >
                    </a-input-number>
                  </div>
                  <div>{{ repaymentAmount(col) }}</div>
                  <div class="row gap-2">
                    {{ col.item.allRepayment.new_irr }}
                    <p>({{ col.item.allRepayment.irr }})</p>
                  </div>
                </div>
              </div>
            </div>
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
import tool, { selectDateFormat, navigationTo, isArrayEqual, numberStrFormat } from '@/utils/tool';
import dayjs from 'dayjs';
import { message } from 'ant-design-vue';
import { cloneDeep, debounce } from 'lodash';
import { projectAuditSaveMode, projectAuditSaveStep, projectAuditSubstitution, projectAuditGoback } from '@/api/process';
import { projectLoanAllRepayment, projectLoanCalcIrr } from '@/api/project/loan';

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

const refinancialAmount = computed(() => {
  if (selectedDatas.value.length) {
    const dataArr = selectedDatas.value.map(item => Number(item.item.allRepayment.repayment_money))
    const sum = dataArr.reduce((acc, cur) => acc + cur, 0)
    return sum
  }
  return 0
})

const backStepHandle = async () => {
  try {
    const loadParams = {
      start_date: startDate.value,
      end_date: endDate.value,
      uuid: props.uuid,
      code: props.blockInfo.loan.code
    };

    // 如果为置换项目
    if (refinancialIds.value.length) {
      loadParams.substitution_ids = refinancialIds.value
      loadParams.substitution_amount = refinancialAmount.value

      const scData = cloneDeep(selectedDatas.value)
      const obj = {}
      for (let i = 0; i < scData.length; i++) {
        const item = scData[i]
        obj[item.value] = item.item.allRepayment
      }
      loadParams.substitution_data = obj

      loadParams.code = 'lending'
      loadParams.set__devCost = 1
    }

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

const compareRefinancial = () => {
  const nData = cloneDeep(selectedDatas.value)
  const bData = cloneDeep(selectedStaticDatas.value)

  const nIdsArr = nData.map(item => item.value)
  const bIdsArr = bData.map(item => item.value)

  const cancelTips = []
  const backTips = []
  for (let i = 0; i < bData.length; i++) {
    const bItem = bData[i]
    if (!nIdsArr.includes(bItem.value)) {
      cancelTips.push(t(`再融资项目：{0}， 被移除`, [bItem.label]))
      backTips.push(t(`再融资项目：{0}， 被移除1`, [bItem.label]))
    }
  }

  for (let i = 0; i < nData.length; i++) {
    const nItem = nData[i]
    if (bIdsArr.includes(nItem.value)) {
      const bItem = bData.find(item => item.value === nItem.value)
      if (bItem) {
        const nItemObj = nItem.item.allRepayment
        const bItemObj = bItem.item.allRepayment

        if (Number(nItemObj.StandardRate) !== Number(bItemObj.StandardRate)) {
          cancelTips.push(t(`再融资项目：{0}， 罚息减免比例由{1}修改为{2}`, [nItem.label, bItemObj.StandardRate, nItemObj.StandardRate]))
          backTips.push(t(`再融资项目：{0}， 罚息减免比例由{1}修改为{2}1`, [nItem.label, bItemObj.StandardRate, nItemObj.StandardRate]))
        }
        
        if (Number(nItemObj.reduction_money_input) !== Number(bItemObj.reduction_money_input)) {
          cancelTips.push(t(`再融资项目：{0}， 罚息减免额度由{1}修改为{2}`, [nItem.label, bItemObj.reduction_money_input, nItemObj.reduction_money_input]))
          backTips.push(t(`再融资项目：{0}， 罚息减免额度由{1}修改为{2}1`, [nItem.label, bItemObj.reduction_money_input, nItemObj.reduction_money_input]))
        }

        if (Number(nItemObj.repayment_money) !== Number(bItemObj.repayment_money)) {
          cancelTips.push(t(`再融资项目：{0}， 还款金额由{1}修改为{2}`, [nItem.label, bItemObj.repayment_money, nItemObj.repayment_money]))
          backTips.push(t(`再融资项目：{0}， 还款金额由{1}修改为{2}1`, [nItem.label, bItemObj.repayment_money, nItemObj.repayment_money]))
        }
      }
    } else {
      cancelTips.push(t(`再融资项目：{0}， 为新设置`, [nItem.label]))
      backTips.push(t(`再融资项目：{0}， 为新设置1`, [nItem.label]))
    }
  }

  cancelReasonArr.value = cancelTips
  backReasonArr.value = backTips
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
    if (isRefinancial) {
      compareRefinancial()
    }

    if (Boolean(isRefinancial)) { // 有置换
      if (backReasonArr.value.length) { // 置换数据有变化
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
      const s_end_date = endDate.value
      const endBeforeToday = dayjs(s_end_date).isBefore(dayjs()) && !dayjs(s_end_date).isSame(dayjs(), 'day')
      if (props.infoData.lending.start_date !== startDate.value || endBeforeToday) {
        changeLoading(true);
        await projectAuditSaveMode(loadParams)
        .then(() => {
          submitRquest();
        })
        .catch(() => {
          changeLoading(false);
        });
      } else {
        changeLoading(true);
        submitRquest();
      }
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

    getRefinancialList(startDate.value)
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

const hasRefinancialInfo = computed(() => {
  return props.lendingInfo?.data?.substitution_ids && props.lendingInfo?.data?.substitution_ids.length;
})
const refinancialIds = ref([])
const refinancialData = ref([])
const selectedDatas = ref([])
const selectedStaticDatas = ref([])
const filterOption = (input, option) => {
  return option.label.toLowerCase().includes(input.toLowerCase());
};
const refinancialLoading = ref(false)
const repaymentAmount = computed(() => {
  return (data) => {
    const last_money = Number(data.item.allRepayment.last_money)
    const money = Number(data.item.allRepayment.reduction_money_input)
    const num = Number(tool.minus(last_money, money))
    data.item.allRepayment.repayment_money = num
    return num
  }
})

const refinancialChange = async (data) => {
  if (data.length) {
    const selectUuids = selectedDatas.value.map(item => item.value)
    const dataUuids = data.map(item => item.value)

    const delUuids = selectUuids.filter(item => !dataUuids.includes(item))

    // 移除已删除选项
    for (let i = 0; i < delUuids.length; i++) {
      const itemUuid = delUuids[i]
      const index = selectedDatas.value.findIndex(item => item.value === itemUuid)
      if (index > -1) {
        selectedDatas.value.splice(index, 1)
      }
    }

    // 添加新选项
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      const itemUuid = item.value
      // 新选项
      if (!selectUuids.includes(itemUuid)) {

        refinancialLoading.value = true
        await projectAuditSubstitution({
          start_date: startDate.value,
          uuid: props.uuid,
          substitution_uuids: [itemUuid]
        }).then(res => {
          const resData = res.length ? res[0] : null
          if (resData) {
            const itemIndex = selectUuids.findIndex(item => item === itemUuid)
            if (itemIndex === -1) {
              const obj = cloneDeep(item)
              
              obj.item.allRepayment = obj.item.allRepayment || cloneDeep(resData.allRepayment)
              obj.item.allRepayment.reduction_money = Number(resData.allRepayment.reduction_money || 0)
              obj.item.allRepayment.reduction_money_input = 0
              obj.item.allRepayment.new_irr = resData.allRepayment.irr
              selectedDatas.value.push(obj)
            }
          }
          refinancialLoading.value = false
        }).catch(() => {
          // 如果不满足条件将本项移除
          const itemIndex = refinancialIds.value.findIndex(item => item === itemUuid)
          if (itemIndex > -1) {
            refinancialIds.value.splice(itemIndex, 1)
          }
          refinancialLoading.value = false
        })
        
      }
    }
  } else {
    selectedDatas.value = []
  }
}

const setSelectedDatas = () => {
  const idsArr = cloneDeep(props.lendingInfo.data.substitution_ids)
  const resArr = cloneDeep(refinancialData.value)
  const substitution_data = cloneDeep(props.lendingInfo.data.substitution_data)
  if (idsArr && idsArr.length && resArr && resArr.length) {
    const objArr = resArr.filter(item => idsArr.includes(item.value))
    objArr.forEach(item => {
      item.item.allRepayment = substitution_data[item.value]
    })
    selectedDatas.value = objArr
    selectedStaticDatas.value = cloneDeep(objArr)
  }
}

const resetSelectedDatas = () => {
  const idsArr = refinancialData.value.map(item => item.value)
  // 使用filter重新构建数组，避免在循环中splice的问题
  refinancialIds.value = refinancialIds.value.filter(item => {
    if (idsArr.includes(item)) {
      const itemObj = refinancialData.value.find(_item => _item.value === item)
      if (itemObj) {
        if (itemObj.item.allRepayment) {
          const selectedItem = selectedDatas.value.find(item => item.value === itemObj.value)
          if (selectedItem) {
            selectedItem.item.allRepayment.StandardRate = Number(selectedItem.item.allRepayment.StandardRate) < Number(itemObj.item.allRepayment.StandardRate) ?  Number(itemObj.item.allRepayment.StandardRate) : Number(selectedItem.item.allRepayment.StandardRate)
            selectedItem.item.allRepayment.reduction_money = Number(itemObj.item.allRepayment.reduction_money)
            selectedItem.item.allRepayment.repayment_money = Number(itemObj.item.allRepayment.repayment_money)
            selectedItem.item.allRepayment.last_money = Number(itemObj.item.allRepayment.last_money)
            selectedItem.item.allRepayment.min_StandardRate = Number(itemObj.item.allRepayment.min_StandardRate)
            selectedItem.item.allRepayment.reduction_money_input = Number(selectedItem.item.allRepayment.reduction_money_input) > Number(itemObj.item.allRepayment.reduction_money) ? Number(itemObj.item.allRepayment.reduction_money) : Number(selectedItem.item.allRepayment.reduction_money_input)
            selectedItem.item.allRepayment.irr = itemObj.item.allRepayment.irr

            refinancialCaclIrr(selectedItem)
          }
          return true // 保留该项
        } else {
          return false // 删除该项
        }
      }
      return false // 如果找不到itemObj，删除该项
    } else {
      return false // 如果不在idsArr中，删除该项
    }
  })

  // 同时更新selectedDatas，只保留在refinancialIds中的项
  selectedDatas.value = selectedDatas.value.filter(selectedItem => 
    refinancialIds.value.includes(selectedItem.value)
  )
}

const refinancialInputChange = debounce((data) => {
  const StandardRate = data.item.allRepayment.StandardRate
  const min_StandardRate = data.item.allRepayment.min_StandardRate
  if (StandardRate < min_StandardRate) {
    return;
  } else {
    if (openDate.value) {
      const start_date = openDate.value
      const start_date_time = dayjs(start_date).format('YYYY-MM-DD')

      const params = {
        uuid: data.value,
        date: start_date_time,
        StandardRate
      }
      projectLoanAllRepayment(params).then(res => {
        data.item.allRepayment.reduction_money = Number(res.reduction_money) < 0 ? 0 : Number(res.reduction_money)
        data.item.allRepayment.reduction_money_input = 0
        data.item.allRepayment.new_irr = data.item.allRepayment.irr
      })
    }
  }
}, 300)

const refinancialInputBlur = (data) => {
  const StandardRate = data.item.allRepayment.StandardRate
  const min_StandardRate = data.item.allRepayment.min_StandardRate
  if (StandardRate > min_StandardRate) {
    return;
  } else {
    data.item.allRepayment.StandardRate = min_StandardRate
    data.item.allRepayment.reduction_money_input = 0

    const start_date_time = dayjs(openDate.value).format('YYYY-MM-DD')

    const params = {
      uuid: data.value,
      date: start_date_time,
      StandardRate: min_StandardRate
    }
    projectLoanAllRepayment(params).then(res => {
      data.item.allRepayment.reduction_money = Number(res.reduction_money) < 0 ? 0 : Number(res.reduction_money)
    })
  }
}

const refinancialCaclIrr = debounce((data) => {
  const start_date_time = dayjs(openDate.value).format('YYYY-MM-DD')

  const params = {
    uuid: data.value,
    date: start_date_time,
    last_money: data.item.allRepayment.repayment_money
  }
  projectLoanCalcIrr(params).then(res => {
    data.item.allRepayment.new_irr = res.irr || 0
  })
}, 300)

const getRefinancialList = (start_date = '') => {
  const params = {
    uuid: props.uuid
  }
  if (start_date) {
    params.start_date = start_date
  }
  projectAuditSubstitution(params).then(async (res) => {
    const data = res || []
    const dataArr = data.map(item => {
      return {
        label: item.project_name,
        value: item.uuid,
        item: item
      }
    })
    // 查询已设置的项目
    if (start_date) {
      const sParams = {
        ...params,
        sta: 1
      }

      try {
        const data = await projectAuditSubstitution(sParams)
        if (data && data.length) {
          data.forEach(item => {
            const itemData = dataArr.find(itemData => itemData.value === item.uuid)
            if (itemData) {
              itemData.item.allRepayment = item.allRepayment
            }
          })
        }
      } catch {
        console.log('查询已设置的项目失败');
      }
    }
    
    refinancialData.value = dataArr
    if (start_date) {
      resetSelectedDatas()
    } else {
      setSelectedDatas()
    }
  })
}

watch(
  () => props.visible,
  (val) => {
    if (!val) {
      subLoading.value = false;
      openDate.value = '';
      confirmForm.value = {};
      fonfirmTable.value = [];

      refinancialIds.value = []
      selectedDatas.value = []
    } else {
      startDate.value = props.infoData.lending.start_date;
      endDate.value = props.infoData.lending.end_date;

      if (hasRefinancialInfo.value) {
        refinancialIds.value = cloneDeep(props.lendingInfo.data.substitution_ids)
        getRefinancialList()
      }

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

.refinancial-content {
  :deep(.ant-select) {
    width: 100%;
  }
}

.refinancial-table {
  margin-top: 15px;
  border: 1px solid #272727;
  background-color: #f7f9f8;
  border-radius: 10px !important;
  padding: 0 5px;
  > .col-item {
    display: flex;
    align-items: center;
    &.th {
      border-bottom: 1px solid #e2e5e2;
      > div {
        font-size: 12px;
        font-weight: 600;
        color: #888;
        &:nth-child(6) {
          align-items: flex-start;
        }
      }
    }
    &.tr {
      > div {
        height: 48px;
      }
    }
    > div {
      height: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0 5px;
      &:nth-child(1) {
        width: 162px;
        :deep(.ant-input-number) {
          border-radius: 6px !important;
          height: 32px !important;
          line-height: 32px !important;
          border-top-right-radius: 0 !important;
          border-bottom-right-radius: 0 !important;
        }
        :deep(.ant-input-number-input) {
          height: 32px !important;
          line-height: 32px !important;
        }
      }
      &:nth-child(2) {
        width: 145px;
      }
      &:nth-child(3) {
        width: 160px;
      }
      &:nth-child(4) {
        width: 145px;
        :deep(.ant-input-number) {
          border-radius: 6px !important;
          height: 32px !important;
          line-height: 32px !important;
        }
        :deep(.ant-input-number-input) {
          height: 32px !important;
          line-height: 32px !important;
        }
      }
      &:nth-child(5) {
        width: 130px;
        align-items: flex-start;
      }
      &:nth-child(6) {
        flex: 1;
        > p {
          font-size: 12px;
          color: #888;
        }
      }
      &.row {
        flex-direction: row;
        justify-content: flex-start;
        > div {
          text-align: center;
          flex: 1;
        }
      }
    }
  }
}
.limit-icon {
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
}
</style>
