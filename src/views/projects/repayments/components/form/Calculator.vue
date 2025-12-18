<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="drawdownRequestRef" class="drawdown-request">
    <a-modal
      :width="700"
      :open="visible"
      :title="t('还款计算器')"
      :getContainer="() => $refs.drawdownRequestRef"
      :maskClosable="false"
      :footer="false"
      @cancel="updateVisible(false)"
    >
      <div class="content sys-form-content">
        <a-form
          ref="formRef"
          layout="vertical"
          :model="formState"
        >
          <a-row :gutter="24">
            <a-col :span="24" class="mb-5">
              <a-alert type="info">
                <template #message>
                  <p class="text-sm">{{ t('选择还款时间可计算出全额还款所需金额') }}</p>
                </template>
              </a-alert>
            </a-col>
            <a-col :span="overdueDays ? 8 : 12">
              <a-form-item :label="t('还款日期')" name="date">
                <a-date-picker
                  v-model:value="formState.date"
                  :disabledDate="disabledDateFormat"
                  :format="selectDateFormat()"
                  placeholder=""
                  @change="dateChange"
                >
                  <template #suffixIcon>
                    <a-spin v-if="getLoading"></a-spin>
                    <CalendarOutlined v-else />
                  </template>
                </a-date-picker>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item :label="t('包含预计数据')">
                <a-switch v-model:checked="hasEstimated" :disabled="!Boolean(formState.date)" class="mt-4" @change="standardInputChange" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item :label="t('到期日期')">
                <div class="show-date">{{ tool.showDate(projectDetail?.date?.end_date) }}</div>
              </a-form-item>
            </a-col>
            <a-col v-if="overdueDays" :span="4">
              <a-form-item :label="t('逾期天数')">
                <div class="show-date">{{ overdueDays }}</div>
              </a-form-item>
            </a-col>
            <template v-if="hasSetStandard && maxReductionAmount && !isNormalUser">
              <a-col :span="10">
                <a-form-item class="data-col-item">
                  <template #label>
                    <div class="flex items-center gap-1">
                      <span>{{ t('建议标准税率') }}</span>
                      <span style="color: #31bd65;">{{ `(${t('最小值')}: ${standardRate}%)` }}</span>
                    </div>
                  </template>
                  <a-input-number
                    :max="99999999999"
                    :min="Number(standardRate)"
                    v-model:value="standardRateInput"
                    :formatter="
                      (value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    "
                    :controls="false"
                    addon-after="%"
                    :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                    @input="standardInputChange"
                    @blur="standardInputBlur"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="7">
                <a-form-item :label="t('罚息减免最大额度')">
                  <vco-number :bold="true" :value="standardAmount" :precision="2" size="fs_xl" :end="true"></vco-number>
                </a-form-item>
              </a-col>
              <a-col :span="7">
                <a-form-item :label="t('罚息减免额度')">
                  <vco-number :bold="true" :value="maxReductionAmount > 0 ? maxReductionAmount : 0" :precision="2" size="fs_xl" color="#31bd65" :end="true"></vco-number>
                </a-form-item>
              </a-col>
            </template>
            
            <a-col v-if="totalAmount" :span="maxReductionAmount && !isNormalUser ? 7 : 12">
              <a-form-item :label="t('还款总额')">
                <vco-number :bold="true" :value="totalAmount" :precision="2" size="fs_xl" :end="true"></vco-number>
              </a-form-item>
            </a-col>
            <template v-if="maxReductionAmount && !isNormalUser">
              <a-col :span="1" class="plus-txt"><i class="iconfont">&#xe711;</i></a-col>
              <a-col :span="7">
                  <a-form-item :label="t('减免额度')">
                    <a-input-number
                      :max="99999999999"
                      v-model:value="reductionAmount"
                      :formatter="
                        (value) =>
                          `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      "
                      :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                      @input="amountInput"
                      @blur="amountInput"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="1" class="plus-txt"><i class="iconfont">&#xe609;</i></a-col>
                <a-col :span="7">
                  <a-form-item :label="t('还款金额1')">
                    <vco-number :bold="true" :value="repaymentAmount" :precision="2" color="#31bd65" size="fs_xl" :end="true"></vco-number>
                  </a-form-item>
                </a-col>
            </template>
            <a-col v-if="totalAmount" :span="maxReductionAmount && !isNormalUser ? 8 : 12">
              <a-form-item class="w-full-label">
                <template #label>
                  <div class="flex justify-between items-center gap-3" style="height: 22px;">
                    <p>Loan IRR</p>
                    <a-button
                      v-if="maxReductionAmount && !isNormalUser"
                      type="link"
                      class="flex items-center text-sm"
                      :loading="irrLoading"
                      @click="refreshIrr"
                    >
                      {{ t('刷新') }}
                    </a-button>
                  </div>
                </template>
                <vco-number :bold="true" :value="irrPercent" prefix="" suffix="%" :precision="2" size="fs_xl" :end="true"></vco-number>
              </a-form-item>
            </a-col>
            <a-col v-if="formState.date && hasPermission('projects:repayments:adDownload') && projectDetail?.product?.code !== 'vsl'" :span="8">
              <a-form-item :label="t('对账单')">
                <a-button type="dark" class="uppercase shadow bold" :loading="downloadLoading" @click="downloadStatement">
                  {{ t('下载') }}
                </a-button>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import { CalendarOutlined } from '@ant-design/icons-vue';
import { projectLoanAllRepayment, projectLoanCalcIrr } from '@/api/project/loan';
import tool, { selectDateFormat } from "@/utils/tool"
import { useUserStore } from '@/store'
import { hasPermission } from '@/directives/permission/index';
import { debounce } from 'lodash';

const { t } = useI18n();
const emits = defineEmits(['change']);

const userStore = useUserStore();
const isNormalUser = computed(() => userStore.isNormalUser)

const props = defineProps({
  uuid: {
    type: String
  },
  projectDetail: {
    type: Object,
    default: () => {}
  }
});

const visible = ref(false);

const hasEstimated = ref(false)

const formRef = ref()
const formState = ref({
  date: ''
});

const disabledDateFormat = (current) => {
  // const startDate = dayjs()
  // if (current && current.isBefore(startDate, 'day')) {
  //   return true;
  // }

  // 2025-07-02 13:00:00 - 修改为变更之后的日期
  const var_start_date = dayjs(props?.projectDetail?.date?.var_start_date || props?.projectDetail?.date?.start_date).add(1, 'day')
  if (current.isBefore(var_start_date, 'day')) {
    return true;
  }

  return false;
}

const overdueDays = computed(() => {
  const selectDate = formState.value.date
  const endDate = props.projectDetail?.date?.end_date
  if (selectDate && endDate && dayjs(endDate).isBefore(dayjs(selectDate))) {
    return tool.diffDate(endDate, selectDate)
  }

  return 0
})

const hasSetStandard = ref(false)
const standardRate = ref(0)
const standardAmount = ref(0)
const standardRateInput = ref(0)

const totalAmount = ref(0)
const maxReductionAmount = ref(0)
const reductionAmount = ref(0)
const irrLoading = ref(false)
const irrPercent = ref(0)
const getLoading = ref(false)
const dateChange = (date, rate) => {
  if (!rate || isNaN(Number(rate))) {
    hasSetStandard.value = false
  }

  if (date) {
    const time = dayjs(date).format('YYYY-MM-DD')
    reductionAmount.value = 0
    getLoading.value = true
    irrLoading.value = false

    const params = {
      uuid: props.uuid,
      date: time,
      do__est: hasEstimated.value ? 1 : 0
    }

    if (rate && !isNaN(Number(rate))) {
      params.StandardRate = Number(rate)
    }

    projectLoanAllRepayment(params).then(res => {
      totalAmount.value = Number(res.last_money) ? Number(res.last_money) : 0
      maxReductionAmount.value = Number(res.reduction_money) ? Number(res.reduction_money) : 0

      irrPercent.value = Number(res.irr || 0)

      if (!hasSetStandard.value) {
        standardRate.value = res.StandardRate
        standardRateInput.value = res.StandardRate
        standardAmount.value = res.reduction_money

        hasSetStandard.value = true
      }
      getLoading.value = false
    }).catch(() => {
      getLoading.value = false
    })
  } else {
    totalAmount.value = 0
    maxReductionAmount.value = 0
  }
}

const refreshIrr = () => {
  irrLoading.value = true
  const params = {
    uuid: props.uuid,
    date: dayjs(formState.value.date).format('YYYY-MM-DD'),
    last_money: repaymentAmount.value,
    do__est: hasEstimated.value ? 1 : 0
  }
  projectLoanCalcIrr(params).then(res => {
    irrPercent.value = Number(res.irr || 0)
    irrLoading.value = false
  }).catch(() => {
    irrLoading.value = false
  })
}

const repaymentAmount = computed(() => {
  let reduceNum = 0
  if (reductionAmount.value < 0) {
    reduceNum = 0
  } else {
    const maxNum = maxReductionAmount.value > 0 ? maxReductionAmount.value : 0
    reduceNum = reductionAmount.value > maxNum ? maxNum : reductionAmount.value
  }

  const res = tool.minus(totalAmount.value, reduceNum)
  return res
})

const amountInput = () => {
  if (reductionAmount.value < 0) {
    reductionAmount.value = 0
  } else {
    reductionAmount.value = reductionAmount.value > maxReductionAmount.value ? maxReductionAmount.value : reductionAmount.value
  }
}

// 防抖处理
const standardInputChange = debounce(() => {
  const num = Number(standardRateInput.value) || 0
  if (num > Number(standardRate.value) || num === Number(standardRate.value)) {
    dateChange(dayjs(formState.value.date), num)
  }
}, 300)

const standardInputBlur = () => {
  const num = Number(standardRateInput.value) || 0
  if (num < Number(standardRate.value) || num === Number(standardRate.value)) {
    standardRateInput.value = Number(standardRate.value)
    setTimeout(() => {
      dateChange(dayjs(formState.value.date), standardRateInput.value)
    }, 200)
  }
}

const updateVisible = (value) => {
  visible.value = value;

  if (!value) {
    formRef.value.clearValidate();
    formRef.value.resetFields();
    Object.keys(formState.value).forEach((key) => {
      formState.value[key] = ''; // 清空每个字段
    });

    totalAmount.value = 0
    reductionAmount.value = 0
    maxReductionAmount.value = 0
  }
};

const downloadLoading = ref(false)
const downloadStatement = () => {
  downloadLoading.value = true
  projectLoanAllRepayment({
    uuid: props.uuid,
    date: dayjs(formState.value.date).format('YYYY-MM-DD'),
    pdf: 1,
    less: reductionAmount.value,
    do__est: hasEstimated.value ? 1 : 0,
    watermark: 0
  }).then(res => {
    downloadLoading.value = false
    window.open(res);
  }).catch(() => {
    downloadLoading.value = false
  })
}

const init = () => {
  visible.value = true;
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.drawdown-request {
  :deep(.ant-modal-content) {
    .ant-modal-header {
      padding: 40px 40px 0;
      border-radius: 24px;
      .ant-modal-title {
        font-size: 20px;
        font-weight: 500;
      }
    }
    padding: 0px !important;

    .content {
      line-height: 1.33;
      padding: 24px 40px 40px;
      .save {
        margin-top: 24px;
      }
    }
  }
}

.sys-form-content {
  :deep(.ant-input-number) {
    height: 36px !important;
    .ant-input-number-input {
      height: 34px !important;
    }
    
  }
}

.plus-txt {
  position: relative;
  .iconfont {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #282828;
    font-weight: bold;
    font-size: 18px;
  }
}

.reduction-content {
  padding: 0 15px;
  position: relative;
  top: -10px;
  > .info-content {
    padding: 15px 0;
    border-radius: 10px;
    display: flex;
    background-color: #f0f0f0;
    .ant-form-item {
      margin-bottom: 0 !important;
    }
  }
}

.show-date {
  color: #282828;
  line-height: 50px;
  font-size: 16px;
}
</style>
