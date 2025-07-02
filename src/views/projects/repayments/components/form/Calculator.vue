<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="drawdownRequestRef" class="drawdown-request">
    <a-modal
      :width="600"
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
            <a-col :span="12">
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
            <a-col :span="12">
              <a-form-item :label="t('到期日期')">
                <div class="show-date">{{ tool.showDate(projectDetail?.date?.end_date) }}</div>
              </a-form-item>
            </a-col>
            <a-col v-if="totalAmount" :span="maxReductionAmount && !isNormalUser ? 7 : 12">
              <a-form-item :label="t('还款总额')">
                <vco-number :bold="true" :value="totalAmount" :precision="2" size="fs_xl" :end="true"></vco-number>
              </a-form-item>
            </a-col>
            <template v-if="maxReductionAmount && !isNormalUser">
              <a-col :span="1" class="plus-txt"><i class="iconfont">&#xe711;</i></a-col>
              <a-col :span="7">
                  <a-form-item :label="t('罚息减免')">
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
            <a-col v-if="maxReductionAmount && !isNormalUser" :span="8">
              <a-form-item :label="t('罚息减免最大额度')">
                <vco-number :bold="true" :value="maxReductionAmount" :precision="2" size="fs_xl" :end="true"></vco-number>
              </a-form-item>
            </a-col>
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

const totalAmount = ref(0)
const maxReductionAmount = ref(0)
const reductionAmount = ref(0)
const irrLoading = ref(false)
const irrPercent = ref(0)
const getLoading = ref(false)
const dateChange = (date) => {
  if (date) {
    const time = dayjs(date).format('YYYY-MM-DD')
    reductionAmount.value = 0
    getLoading.value = true
    irrLoading.value = false

    projectLoanAllRepayment({
      uuid: props.uuid,
      date: time
    }).then(res => {
      totalAmount.value = Number(res.last_money) ? Number(res.last_money) : 0
      maxReductionAmount.value = Number(res.reduction_money) ? Number(res.reduction_money) : 0

      irrPercent.value = Number(res.irr || 0)
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
    last_money: repaymentAmount.value
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
    reduceNum = reductionAmount.value > maxReductionAmount.value ? maxReductionAmount.value : reductionAmount.value
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
