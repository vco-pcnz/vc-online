<template>
  <div
    class="block-item mb"
    :class="{ checked: lendingInfo.is_check && blockInfo?.showCheck, 'details': isDetails }"
  >
    <!-- 确认弹窗 -->
    <vco-confirm-alert
      ref="changeAlertRef"
      :confirm-txt="confirmTxt"
      v-model:visible="changeVisible"
      @submit="submitRquest"
    ></vco-confirm-alert>

    <!-- 质押提示弹窗 -->
    <vco-confirm-alert
      ref="substitutionAlertRef"
      :confirm-txt="substitutionTxt"
      v-model:visible="substitutionVisible"
      @submit="saveRequeset"
    ></vco-confirm-alert>

    <vco-process-title :title="t('放款信息')">
      <div v-if="!isDetails" class="flex gap-5 items-center">
        <a-button
          v-if="blockInfo.showEdit"
          type="primary"
          shape="round"
          :loading="subLoading"
          class="uppercase"
          @click="saveHandle"
        >
          {{ t('保存') }}
        </a-button>
        <template v-if="blockInfo?.showCheck && !lendingInfo.is_check && creditId">
          <a-button
            v-if="confirmTxt"
            type="dark"
            shape="round"
            class="uppercase"
            @click="checkHandle(false)"
          >
            {{ t('审核') }}
          </a-button>
          <a-popconfirm
            v-else
            :title="t('确定通过审核吗？')"
            :ok-text="t('确定')"
            :cancel-text="t('取消')"
            @confirm="checkHandle(true)"
          >
            <a-button
              type="dark"
              shape="round"
              class="uppercase"
            >
              {{ t('审核') }}
            </a-button>
          </a-popconfirm>
        </template>
        <div class="target-content" @click="lendingTarget = !lendingTarget">
          <div class="icon" :title="lendingTarget ? t('收起') : t('展开')">
            <i v-if="lendingTarget" class="iconfont">&#xe711;</i>
            <i v-else class="iconfont">&#xe712;</i>
          </div>
        </div>
      </div>
    </vco-process-title>
    <div v-show="lendingTarget" class="sys-form-content mt-5">
      <a-form
        ref="formRef"
        layout="vertical"
        :model="formState"
        :rules="formRules"
      >
        <a-row :gutter="24">
          <a-col :span="8">
            <a-form-item :label="t('项目借款周期')" name="time_date">
              <a-range-picker
                v-model:value="formState.time_date"
                :format="selectDateFormat()"
                :disabled="amountDisabled || inputADis"
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
                :disabled="amountDisabled || inputADis"
                @input="termInput"
              />
            </a-form-item>
          </a-col>
          <a-col :span="4">
            <a-form-item label=" " name="days">
              <a-input
                v-model:value="formState.days"
                :suffix="t('天')"
                :disabled="amountDisabled || inputADis"
                @input="termInput"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('总天数')" name="totalDay">
              <div class="show-days">
                {{ formState.totalDay }}
                <span>{{ t('天') }}</span>
              </div>
            </a-form-item>
          </a-col>

          <a-col :span="8">
            <a-form-item :label="t('借款总金额')" name="loan_money">
              <a-input-number
                v-model:value="formState.loan_money"
                :max="99999999999"
                :disabled="amountDisabled || inputADis"
                :formatter="
                  (value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                "
                :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                @input="() => percentInput('loan_money')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('首次放款总金额')" name="initial_amount">
              <a-input-number
                v-model:value="formState.initial_amount"
                :max="99999999999"
                :disabled="amountDisabled || inputADis"
                :formatter="
                  (value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                "
                :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                @input="() => percentInput('initial_amount')"
              />
            </a-form-item>
          </a-col>

          <a-col v-if="percentItems.length" :span="24">
            <div class="form-line"></div>
          </a-col>

          <a-col :span="8">
            <a-form-item :label="t('还款方式')" name="repay_type">
              <a-select
                v-model:value="formState.repay_type"
                style="width: 100%"
                :disabled="isDetails || !blockInfo.showEdit"
                :options="repayTypeData"
                @change="debouncedEstablishCalculate"
              ></a-select>
            </a-form-item>
          </a-col>

          <template v-if="[2, 3].includes(Number(formState.repay_type))">
            <a-col :span="8">
              <a-form-item :label="t('还款日')" name="repay_day_type">
                <a-select
                  v-model:value="formState.repay_day_type"
                  style="width: 100%"
                  :disabled="isDetails || !blockInfo.showEdit"
                  :options="repayDayTypeData"
                  @change="debouncedEstablishCalculate"
                ></a-select>
              </a-form-item>
            </a-col>

            <a-col v-if="Number(formState.repay_day_type) === 2" :span="8">
              <a-form-item :label="t('几号')" name="repay_day">
                <a-select
                  v-model:value="formState.repay_day"
                  style="width: 100%"
                  :disabled="isDetails || !blockInfo.showEdit"
                  :options="repayDayData"
                  @change="debouncedEstablishCalculate"
                ></a-select>
              </a-form-item>
            </a-col>
          </template>
          

          <a-col v-if="percentItems.length" :span="24">
            <div class="form-line"></div>
          </a-col>
          <template v-if="percentItems.length">
            <a-col
              v-for="item in percentItems"
              :key="item.credit_table"
              class="data-col-item"
              :class="colClassName(percentItems.length)"
            >
              <a-form-item
                :name="item.credit_table"
              >
                <template #label>
                  {{ item.credit_name }}
                  <a-tooltip v-if="item.tips" placement="topLeft">
                    <template #title>
                      <span>{{ item.tips }}</span>
                    </template>
                    <QuestionCircleOutlined class="ml-2" />
                  </a-tooltip>
                </template>
                <a-input
                  v-model:value="formState[item.credit_table]"
                  :disabled="inputDisabled(item.editMark) || item.disabled"
                  :suffix="item.credit_unit"
                  @input="() => percentInput(item.credit_table)"
                />
              </a-form-item>
            </a-col>
          </template>
          <a-col v-if="estabItems.length" :span="24">
            <div class="form-line"></div>
          </a-col>
          <template v-if="estabItems.length">
            <a-col :span="6">
              <a-form-item :label="t('建立费计算标准')" name="estab_type">
                <a-select
                  v-model:value="formState.estab_type"
                  style="width: 100%"
                  :disabled="isDetails || !blockInfo.showEdit"
                  :options="estabTypeData"
                  @change="interestChange"
                ></a-select>
              </a-form-item>
            </a-col>
            
            <a-col :span="6">
              <a-form-item :label="t('包含利息')">
                <a-select
                  v-model:value="formState.estab_inc_interest"
                  style="width: 100%"
                  :disabled="isDetails || !blockInfo.showEdit"
                  :options="estab_inc_interestData"
                  @change="interestChange"
                ></a-select>
              </a-form-item>
            </a-col>

            <a-col
              v-for="item in estabItems"
              :key="item.credit_table"
              :span="6"
            >
              <a-form-item
                :name="item.credit_table"
              >
                <template #label>
                  {{ item.credit_name }}
                  <a-tooltip v-if="item.tips" placement="topLeft">
                    <template #title>
                      <span>{{ item.tips }}</span>
                    </template>
                    <QuestionCircleOutlined class="ml-2" />
                  </a-tooltip>
                </template>

                <a-input
                  v-if="item.is_ratio"
                  v-model:value="formState[item.credit_table]"
                  :disabled="inputDisabled(item.editMark) || item.disabled || formState.estab_type === 2"
                  :suffix="item.credit_unit"
                  @input="() => percentInput(item.credit_table)"
                />
                <a-input-number
                  v-else
                  v-model:value="formState[item.credit_table]"
                  :disabled="inputDisabled(item.editMark) || item.disabled || formState.estab_type === 1"
                  :formatter="
                    (value) =>
                      `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  "
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                  @input="() => dollarInput(item.credit_table)"
                />
              </a-form-item>
            </a-col>
          </template>

          <a-col v-if="dollarItems.length" :span="24">
            <div class="form-line"></div>
          </a-col>
          <template v-if="dollarItems.length">
            <a-col
              v-for="item in dollarItems"
              :key="item.credit_table"
              class="data-col-item"
              :class="colClassName(dollarItems.length)"
            >
              <a-form-item
                :name="item.credit_table"
              >
                <template #label>
                  {{ item.credit_name }}
                  <a-tooltip v-if="item.tips" placement="topLeft">
                    <template #title>
                      <span>{{ item.tips }}</span>
                    </template>
                    <QuestionCircleOutlined class="ml-2" />
                  </a-tooltip>
                </template>
                <a-input-number
                  v-model:value="formState[item.credit_table]"
                  :disabled="inputDisabled(item.editMark) || item.disabled"
                  :formatter="
                    (value) =>
                      `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  "
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                  @input="() => dollarInput(item.credit_table)"
                />
              </a-form-item>
            </a-col>
          </template>
          <a-col v-if="showNumItems.length" :span="24">
            <div class="form-line"></div>
          </a-col>
          <template v-if="showNumItems.length">
            <a-col
              v-for="item in showNumItems"
              :key="item.credit_table"
              class="data-col-item"
              :class="colClassName1(showNumItems.length)"
            >
              <a-form-item>
                <template #label>
                  {{ item.credit_name }}
                  <a-tooltip v-if="item.tips" placement="topLeft">
                    <template #title>
                      <span>{{ item.tips }}</span>
                    </template>
                    <QuestionCircleOutlined class="ml-2" />
                  </a-tooltip>
                </template>
                <vco-number
                  :prefix="item.is_ratio ? '' : '$'"
                  :suffix="item.is_ratio ? '%' : ''"
                  :value="item.value"
                  :precision="2"
                  :end="true"
                ></vco-number>
              </a-form-item>
            </a-col>
          </template>
        </a-row>
      </a-form>
    </div>
    <div v-if="blockInfo?.showCheck" class="check-content">
      <i class="iconfont">&#xe647;</i>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { cloneDeep, debounce } from 'lodash';
  import { message } from 'ant-design-vue/es';
  import { QuestionCircleOutlined } from '@ant-design/icons-vue'
  import {
    ruleCredit,
    creditInfo,
    projectAuditSaveMode,
    projectAuditCheckMode,
    lendrEstabCalc
  } from '@/api/process';
  import emitter from '@/event';
  import useProcessStore from '@/store/modules/process';
  import tool, { numberStrFormat, selectDateFormat } from '@/utils/tool';
  import dayjs from 'dayjs';

  const processStore = useProcessStore();

  const emits = defineEmits(['done', 'refresh', 'openData', 'compareDone']);

  const { t } = useI18n();

  const props = defineProps({
    lendingInfo: {
      type: Object,
      default: () => {}
    },
    dataInfo: {
      type: Object,
      default: () => {}
    },
    blockInfo: {
      type: Object,
      default: () => {}
    },
    currentStep: {
      type: Object
    },
    currentId: {
      type: [Number, String],
      default: ''
    },
    isDetails: {
      type: Boolean,
      default: false
    }
  })

  const staticFormData = ref()
  const staticWriteData = ref()

  const confirmTxt = computed(() => {
    let res = ''
    if (!props.isDetails) {
      const securityTotal = props.dataInfo.security.total_money || 0
      const totalAmount = Number(formState.value.loan_money)

      if (Number(totalAmount) > Number(securityTotal)) {
        const num = tool.minus(securityTotal, totalAmount)
        const showSecurity = numberStrFormat(securityTotal)
        const showAmount = numberStrFormat(totalAmount)
        const showNum = numberStrFormat(num)
        res = t('抵押物总价值为{0}，借款总金额为{1}，差{2}，确认通过审核吗？', [`$${showSecurity}`, `$${showAmount}`, `$${showNum}`])
      }
    }
    return res
  })

  const amountDisabled = computed(() => {
    if (props.isDetails) {
      return true
    } else {
      const mark = props?.currentStep?.mark
      if (props?.blockInfo?.showEdit) {
        return [''].includes(mark)
      } else {
        return true
      }
    }
  })

  const changeAlertRef = ref()
  const changeVisible = ref(false)

  const inputADis = computed(() => {
    const mark = props.currentStep.mark
    return [].includes(mark)
  })

  const inputDisabled = (str = '') => {
    if (props.blockInfo.showEdit) {
      const mark = props.currentStep.mark
      if (str) {
        const arr = str.split(',') || []
        return !arr.includes(mark)
      } else {
        return true
      }
    } else {
      return true
    }
  }

  const validateNum = (rule, value) => {
    if (value && Number(value)) {
      const numRegex = /^(?!0(\.0+)?$)(\d+(\.\d+)?|\.\d+)$/;
      if (!numRegex.test(value)) {
        return Promise.reject(t('请输入大于0的数字'));
      }
    }

    return Promise.resolve();
  };

  const validateAmount = (name) => (rule, value) => {
    if (value && Number(value)) {
      const numRegex = /^(?!0(\.0+)?$)(\d+(\.\d+)?|\.\d+)$/;
      if (!numRegex.test(value)) {
        return Promise.reject(t('请输入大于0的数字'));
      }
    } else {
      return Promise.reject(t('请输入') + name);
    }
    return Promise.resolve();
  };

  const validateAmount1 = (name) => (rule, value) => {
    if (value && Number(value)) {
      const numRegex = /^(?!0(\.0+)?$)(\d+(\.\d+)?|\.\d+)$/;
      if (!numRegex.test(value)) {
        return Promise.reject(t('请输入大于0的数字'));
      } else {
        if (Number(value) > Number(formState.value.loan_money)) {
          return Promise.reject(t('首次放款总金额不能大于借款总金额'));
        }
      }
    } else {
      return Promise.reject(t('请输入') + name);
    }
    return Promise.resolve();
  };
  
  const getValidateInfo = (data) => {
    return (rule, value) => {
      const min = data.min ? Number(data.min) : 0
      const max = data.max ? Number(data.max) : 0

      const num = Number(value)
      if (isNaN(num)) {
        return Promise.reject(t('请输入数字'));
      } else {
        if (num < min) {
          return Promise.reject(t('请输入大于或等于{0}的数字', [min]));
        }
        if (num > max) {
          return Promise.reject(t('请输入小于或等于{0}的数字', [max]));
        }

        return Promise.resolve();
      }
    }
  }

  const estabTypeData = ref([
    {
      label: t('建立费率为准'),
      value: 1
    },
    {
      label: t('建立费为准'),
      value: 2
    }
  ])

  const estab_inc_interestData = ref([
    {
      label: t('包含'),
      value: 1
    },
    {
      label: t('不包含'),
      value: 2
    }
  ])

  const repayTypeData = computed(() => {
    const hasDays = Number(formState.value.days) > 0
    return [
      {
        label: t('到期一次性还本付息'),
        value: '1'
      },
      {
        label: t('按月付息，到期还本'),
        value: '2'
      },
      {
        label: t('等额本息'),
        value: '3',
        disabled: false
      }
    ]
  })

  const repayDayTypeData = ref([
    {
      label: t('放款日对应日'),
      value: '1'
    },
    {
      label: t('每月固定日'),
      value: '2'
    },
    {
      label: t('每月最后一天'),
      value: '3'
    }
  ])

  const repayDayData = ref([]);

  for (let i = 1; i <= 31; i++) {
    repayDayData.value.push({
      label: t('{0}号', [i]),
      value: String(i)
    })
  }

  const formRef = ref();
  const formState = ref({
    estab_type: 1,
    estab_inc_interest: 1,
    loan_money: '',
    initial_amount: '',
    term: '',
    days: '',
    totalDay: 0,
    repay_type: '',
    repay_day_type: '',
    repay_day: ''
  });

  const formRules = ref({
    loan_money: [
      { validator: validateAmount(t('借款总金额')), trigger: 'blur' }
    ],
    initial_amount: [
      { validator: validateAmount1(t('首次放款总金额')), trigger: 'blur' }
    ],
    time_date: [
      { required: true, message: t('请选择') + t('项目周期'), trigger: 'change' }
    ],
    repay_type: [
      { required: true, message: t('请选择') + t('还款方式'), trigger: 'change' }
    ],
    repay_day_type: [
      { required: true, message: t('请选择') + t('还款日'), trigger: 'change' }
    ],
    repay_day: [
      { required: true, message: t('请选择') + t('几号'), trigger: 'change' }
    ]
  });

  const percentItems = ref([]);
  const dollarItems = ref([]);
  const changeBackItems = ref([])
  const showNumItems = ref([]);
  const estabItems = ref([]); // 建立费

  const percentItemsStore = ref([]);
  const dollarItemsStore = ref([]);
  const changeBackItemsStore = ref([])
  const showNumItemsStore = ref([]);

  const creditId = ref(null);

  const colClassName = (num) => {
    if (num === 1) {
      return 'one';
    } else if (num === 2) {
      return 'two';
    } else if (num === 3) {
      return 'three';
    } else if (num === 4 || num === 7) {
      return 'four';
    } else {
      if (num % 4 === 0) {
        return 'four';
      } else if (num % 3 === 0) {
        return 'three';
      } else {
        return 'five';
      }
    }
  };

  const colClassName1 = (num) => {
    if (num === 1) {
      return 'one';
    } else if (num === 2) {
      return 'two sta-num';
    } else if (num === 3) {
      return 'three sta-num';
    } else if (num === 4 || num === 7) {
      return 'four sta-num';
    } else {
      if (num % 4 === 0) {
        return 'four sta-num';
      } else if (num % 3 === 0) {
        return 'three sta-num';
      } else {
        return 'five sta-num';
      }
    }
  };

  const linefeeFilter = () => {
    let percentData = cloneDeep(percentItemsStore.value)
    let dollarData = cloneDeep(dollarItemsStore.value)
    let changeBack = cloneDeep(changeBackItemsStore.value)
    let showNum = cloneDeep(showNumItemsStore.value)

    // 建立费、建立费率
    const estabData = []
    const estabFeeRateIndex = percentData.findIndex(item => item.credit_table === 'credit_estabFeeRate')
    if (estabFeeRateIndex > -1) {
      estabData.push(percentData[estabFeeRateIndex])
    }
    const estabFeeIndex = dollarData.findIndex(item => item.credit_table === 'credit_estabFee')
    if (estabFeeIndex > -1) {
      const estabItem = cloneDeep(dollarData[estabFeeIndex])
      estabItem.editMark = percentData[estabFeeRateIndex].editMark
      estabData.push(estabItem)
    }
    estabItems.value = estabData

    // 建立费输入
    percentData = percentData.filter(item => item.credit_table !== 'credit_estabFeeRate')
    dollarData = dollarData.filter(item => item.credit_table !== 'credit_estabFee')

    percentItems.value = percentData
    dollarItems.value = dollarData;
    changeBackItems.value = changeBack
    showNumItems.value = showNum
  }

  // 计算中介费
  const calcBrokerFee = () => {
    if ('credit_brokerFeeRate' in formState.value && 'credit_brokerFee' in formState.value) {
      const brokeFeeRate = formState.value.credit_brokerFeeRate || 0
      
      if (isNaN(Number(brokeFeeRate))) {
        formState.value.credit_brokerFee = 0
      } else {
        const total_amount = formState.value.loan_money || 0;
        const per = tool.div(Number(brokeFeeRate), 100)
        const num = tool.times(total_amount, per)

        formState.value.credit_brokerFee = num
      }
    }
  }

  // 计算中介费率
  const calcBrokerFeeRate = () => {
    if ('credit_brokerFeeRate' in formState.value && 'credit_brokerFee' in formState.value) {
      const total_amount = formState.value.loan_money || 0;
      const brokeFee = formState.value.credit_brokerFee || 0

      if (isNaN(Number(brokeFee))) {
        formState.value.credit_brokerFeeRate = 0
      } else {
        if (Number(total_amount)) {
          const per = tool.div(brokeFee, total_amount)
          const num = tool.times(per, 100)

          formState.value.credit_brokerFeeRate = Number(Number(num).toFixed(6))
        }
      }
    }
  }

  const establishCalculateHandle = () => {
    if (props.isDetails || !props.blockInfo.showEdit) {
      return false
    }

    const {
      time_date,
      estab_type,
      estab_inc_interest,
      loan_money,
      initial_amount,
      credit_loanInterest,
      credit_legalFee,
      credit_brokerFee,
      credit_brokerFeeRate,
      credit_otherFee,
      credit_frontFee,
      credit_estabFee,
      credit_estabFeeRate,
      repay_type,
      repay_day_type,
      repay_day
    } = formState.value
    
    const params = {
      uuid: props.currentId,
      project: {
        estab_type,
        estab_inc_interest,
        has_linefee: 0,
        start_date: dayjs(time_date[0]).format('YYYY-MM-DD'),
        end_date: dayjs(time_date[1]).format('YYYY-MM-DD'),
        loan_money: Number(loan_money || 0),
        initial_amount: Number(initial_amount || 0),
        repay_type: Number(repay_type || 0),
        repay_day_type: '',
        repay_day: ''
      },
      credit: {
        credit_brokerFee: Number(credit_brokerFee || 0),
        credit_brokerFeeRate: Number(credit_brokerFeeRate || 0),
        credit_estabFee: Number(credit_estabFee || 0),
        credit_estabFeeRate: Number(credit_estabFeeRate || 0),
        credit_loanInterest: Number(credit_loanInterest || 0),
        credit_legalFee: Number(credit_legalFee || 0),
        credit_otherFee: Number(credit_otherFee || 0),
        credit_frontFee: Number(credit_frontFee || 0)
      }
    }

    if (Number(repay_type) !== 1) {
      params.project.repay_day_type = Number(repay_day_type)

      if (Number(repay_day_type) === 2) {
        params.project.repay_day = Number(repay_day)
      } else {
        params.project.repay_day = ''
      }
    } else {
      params.project.repay_day_type = ''
      params.project.repay_day = ''
    }

    lendrEstabCalc(params).then(res => {
      if (estab_type === 1) {
        formState.value['credit_estabFee'] = res
      } else {
        formState.value['credit_estabFeeRate'] = res
      }
    })
  }

   // 防抖版本的计算方法
  const debouncedEstablishCalculate = debounce(establishCalculateHandle, 300)

  const percentInput = (key) => {
    // 中介费率修改
    if (key === 'credit_brokerFeeRate') {
      calcBrokerFee()
    }

    // 建立费、建立费率计算
    debouncedEstablishCalculate()
  }

  const dollarInput = (key) => {
    // 中介费修改
    if (key === 'credit_brokerFee') {
      calcBrokerFeeRate()
    }

    // 建立费、建立费率计算
    debouncedEstablishCalculate()
}

const interestChange = () => {
  estabItems.value.map(item => {
    if (item.is_ratio && formState.value.estab_type === 1) {
      percentInput(item.credit_table)
    } else if (formState.value.estab_type === 2) {
      dollarInput(item.credit_table)
    }
  })
}

  const getFormItems = async () => {
    const creditCate = props.isDetails ? 0 : props.currentStep?.credit_cate;

    await ruleCredit({ type: creditCate, uuid: props.currentId }).then(async (res) => {
      const data = res || [];
      const writeData = data.filter((item) => item.is_write);

      staticWriteData.value = writeData

      const perData = writeData.filter((item) => item.is_ratio);
      const dolData = writeData.filter((item) => !item.is_ratio);
      const backData = writeData.filter((item) => item.backMark);

      // 如果存在中介费率，则中介费不可输入只是做展示
      const brokerFeeRate = perData.find(item => item.credit_table === 'credit_brokerFeeRate')
      if (brokerFeeRate) {
        const brokerFee = dolData.find(item => item.credit_table === 'credit_brokerFee')
        if (brokerFee) {
          // brokerFee.disabled = true
        }
      }

      const rulesData = {};
      for (let i = 0; i < writeData.length; i++) {
        formState.value[writeData[i].credit_table] = writeData[i].value || '';
        rulesData[writeData[i].credit_table] = [
          { validator: getValidateInfo(writeData[i]), trigger: 'blur' },
        ];
        if (writeData[i].is_req) {
          rulesData[writeData[i].credit_table].push(
            {
              required: true,
              message: t('请输入') + writeData[i].credit_name,
              trigger: 'blur',
            }
          );
        }
      }

      formRules.value = { ...formRules.value, ...rulesData };

      const showNumItemsData = props.currentStep?.credit_cate ? data.filter((item) => !item.is_write && item.type === 1) : data.filter((item) => !item.is_write);

      percentItemsStore.value = cloneDeep(perData);
      dollarItemsStore.value = cloneDeep(dolData);
      changeBackItemsStore.value = cloneDeep(backData);
      showNumItemsStore.value = cloneDeep(showNumItemsData);
      
      await updateFormData(data);
    });
  };

  const clearTypeHandle = () => {
    // if (Number(formState.value.repay_type) === 3) {
    //   formState.value.repay_type = ''
    //   formState.value.repay_day_type = ''
    //   formState.value.repay_day = ''
    // }
  }

  const timeChange = (date) => {
    if (date) {
      const startDate = typeof date[0] === 'string' ? date[0] : date[0].format('YYYY-MM-DD')
      const endDate = typeof date[1] === 'string' ? date[1] : date[1].format('YYYY-MM-DD')
      const calcDay = tool.calculateDurationPrecise(startDate, endDate)
      formState.value.term = calcDay.months
      formState.value.days = calcDay.days
      formState.value.totalDay = calcDay.gapDay

      if (calcDay.days) {
        clearTypeHandle()
      }
    } else {
      formState.value.term = ''
      formState.value.days = ''
      formState.value.totalDay = 0
    }

    debouncedEstablishCalculate()
  }

  const termInput = () => {
    const months = Number(formState.value.term)
    const days = Number(formState.value.days)
    if (!isNaN(months) && !isNaN(days)) {
      if (months || days) {
        let startDate = dayjs(new Date())
        if (formState.value.time_date) {
          startDate = formState.value.time_date[0]
        }
        const endDate = tool.calculateEndDate(startDate, months, days)
        formState.value.time_date = [dayjs(startDate), dayjs(endDate)]
        const calcDay = tool.calculateDurationPrecise(dayjs(startDate).format('YYYY-MM-DD'), dayjs(endDate).format('YYYY-MM-DD'))
        formState.value.totalDay = calcDay.gapDay
      } else {
        formState.value.time_date = []
        formState.value.totalDay = 0
      }
    }

    if (days) {
      clearTypeHandle()
    }

    debouncedEstablishCalculate()
  }

  const initLandDefault = ref(true)
  const tableDataRefData = ref()

  const updateFormData = async (tableData) => {
    if (tableData) {
      tableDataRefData.value = tableData
    }

    await creditInfo({
      apply_uuid: props.currentId,
      type: props.currentStep?.credit_cate,
    }).then((res) => {
      if (res.length || Object.keys(res).length) {
        for (const key in formState.value) {
          if (key !== 'time_date') {
            formState.value[key] = res[key] || '0';
          }
        }

        for (let i = 0; i < showNumItemsStore.value.length; i++) {
          showNumItemsStore.value[i].value = res[showNumItemsStore.value[i].credit_table];
        }
        creditId.value = res.id || null;

        if (creditId.value) {
          emits('done');
          initLandDefault.value = false
          processStore.setForcastState(true);

          // 触发头部模块切换显示
          emitter.emit('showHeaderTab');
        }
      }
      linefeeFilter()
    });

    const {repay_money, loan_money, repay_type, repay_day_type, repay_day} = props.lendingInfo
    formState.value.loan_money = repay_money ? Number(repay_money) : ''
    formState.value.initial_amount = loan_money ? Number(loan_money) : ''
    formState.value.repay_type = Number(repay_type) ? String(repay_type) : ''
    formState.value.repay_day_type = Number(repay_day_type) ? String(repay_day_type) : ''
    formState.value.repay_day = Number(repay_day) ? String(repay_day) : ''

    // 项目周期
    formState.value.time_date = [dayjs(props.lendingInfo.start_date), dayjs(props.lendingInfo.end_date)]
    timeChange(formState.value.time_date)

    formState.value.estab_type = props.lendingInfo.estab_type || 1;
    formState.value.estab_inc_interest = props.lendingInfo.estab_inc_interest || 1;

    staticFormData.value = cloneDeep({
      ...formState.value,
      start_date: props.lendingInfo.start_date,
      end_date: props.lendingInfo.end_date
    })

    // 需要退回的对比数据
    const nowChangeData = {
      ...cloneDeep(formState.value)
    }
    const changeBack = cloneDeep(changeBackItems.value)
    const creditTableInfo = cloneDeep(staticWriteData.value)

    if (nowChangeData.time_date && nowChangeData.time_date.length) {
      nowChangeData.start_date = dayjs(nowChangeData.time_date[0]).format('YYYY-MM-DD')
      nowChangeData.end_date = dayjs(nowChangeData.time_date[1]).format('YYYY-MM-DD')
    }

    emits('openData', {
      table: tableDataRefData.value,
      data: formState.value
    })
    
    emits('compareDone', {
      changeBack,
      nowChangeData,
      creditTableInfo
    })
  };

  const submitRquest = async () => {
    await checkHandle(true)
    changeAlertRef.value.changeLoading(false)
    changeVisible.value = false
  }

  const checkHandle = async (flag = false) => {
    const loan_money = Number(formState.value.loan_money);
    const initial_amount = Number(formState.value.initial_amount);

    if (loan_money < 0 || loan_money === 0) {
      message.error(t('借款总额不正确'));
      return false;
    }

    if (initial_amount < 0 || initial_amount === 0 || initial_amount > loan_money) {
      message.error(t('首次放款总金额不正确'));
      return false;
    }

    if (flag) {
      const params = {
        uuid: props.currentId,
        code: props.blockInfo.code
      }
      await projectAuditCheckMode(params)
        .then(() => {
          emits('refresh');
          emitter.emit('refreshAuditHisList');
          return true;
        })
        .catch(() => {
          return false;
        });
    } else {
      changeVisible.value = true
    }
  }

  const saveParams = ref()
  const subLoading = ref(false);

  const saveRequeset = async () => {
    subLoading.value = true;

    const formParams = cloneDeep(saveParams.value)
    await projectAuditSaveMode(formParams)
      .then(() => {
        subLoading.value = false;
        substitutionAlertRef.value.changeLoading(false)
        substitutionVisible.value = false

        emits('refresh');
        // 操作记录
        emitter.emit('refreshAuditHisList');
        // 触发预测数据刷新
        emitter.emit('refreshForecastList');
        // 触发奖金刷新
        emitter.emit('refreshBouns')
        // 出发抵押物刷新
        emitter.emit('refreshSecurityList')

        updateFormData()
      })
      .catch(() => {
        subLoading.value = false;
        substitutionAlertRef.value.changeLoading(false)
        substitutionVisible.value = false
      });
  }

  const substitutionAlertRef = ref()
  const substitutionVisible = ref(false)
  const substitutionTxt = ref('')

  const saveHandle = async () => {
    formRef.value
      .validate()
      .then(async () => {
        const credit__data = cloneDeep(formState.value);
        delete credit__data.time_date
        delete credit__data.term
        delete credit__data.days
        delete credit__data.totalDay
        delete credit__data.estab_type
        delete credit__data.estab_inc_interest

        const params = {
          code: props.blockInfo.code,
          uuid: props.currentId,
          estab_type: Number(formState.value.estab_type),
          estab_inc_interest: Number(formState.value.estab_inc_interest),
          repay_money: formState.value.loan_money || 0,
          loan_money: formState.value.initial_amount || 0,
          // initial_amount: formState.value.initial_amount || 0,
          start_date: dayjs(formState.value.time_date[0]).format('YYYY-MM-DD'),
          end_date: dayjs(formState.value.time_date[1]).format('YYYY-MM-DD'),
          credit__data
        };

        const { repay_type, repay_day_type, repay_day } = formState.value
        params.repay_type = Number(repay_type)

        if (params.repay_type !== 1) {
          params.repay_day_type = Number(repay_day_type)

          if (Number(repay_day_type) === 2) {
            params.repay_day = Number(repay_day)
          } else {
            params.repay_day = ''
          }
        } else {
          params.repay_day_type = ''
          params.repay_day = ''
        }

        if (creditId.value) {
          params.credit__data.id = creditId.value;
        }
        saveParams.value = params

        if (processStore.hasForcast) {
          substitutionTxt.value = t('点击“保存”按钮后，预测结果将重新生成。您确定吗？')
          substitutionVisible.value = true
        } else {
          await saveRequeset()
        }
      })
      .catch((error) => {
        console.log('error', error);
      });
  };

  watch(
    () => props.lendingInfo,
    (val) => {
      if (val) {
        if (Number(val.loan_money) !== Number(formState.value.loan_money) ||
          Number(val.initial_amount) !== Number(formState.value.initial_amount) ||
          val.start_date !== staticFormData.value.start_date ||
          val.end_date !== staticFormData.value.end_date ||
          Number(val.estab_type) !== Number(formState.value.estab_type) ||  
          Number(val.estab_inc_interest) !== Number(formState.value.estab_inc_interest) ||
          val.repay_type !== formState.value.repay_type ||
          val.repay_day_type !== formState.value.repay_day_type ||
          val.repay_day !== formState.value.repay_day
        ) {
          updateFormData()
        }
      }
    }
  )

  const handleRefreshIRR = () => {
    emits('refresh');
    getFormItems();
  }

  const lendingTarget = ref(true)

  const blockShowTargetHandle = (flag) => {
    lendingTarget.value = flag
  }

  onMounted(() => {
    getFormItems();
    emitter.on('refreshIRR', handleRefreshIRR);
    emitter.on('blockShowTarget', blockShowTargetHandle)
  });

  onUnmounted(() => {
    emitter.off('refreshIRR', handleRefreshIRR);
    emitter.off('blockShowTarget', blockShowTargetHandle)
  })
</script>

<style lang="less" scoped>
@import './../styles/common.less';
.form-line {
  width: 100%;
  border-top: 1px dashed #808080;
  margin-bottom: 24px;
}

.sys-form-content {
  :deep(.ant-statistic-content) {
    font-size: 21px !important;
  }
  :deep(.ant-picker-range-separator) {
    padding: 0 !important;
  }
}

.total-amount-info {
  :deep(.ant-statistic-content) {
    font-size: 24px !important;
    line-height: 48px !important;
  }
  &.financial {
    :deep(.ant-statistic-content) {
      font-size: 20px !important;
    }
  }
}

.financial-amount {
  :deep(.ant-statistic-content) {
    font-size: 16px !important;
    line-height: 48px !important;
  }
}

.plus-txt {
  position: relative;
  flex: 0 0 3.1666666666666666%;
  max-width: 3.1666666666666666%;
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

.data-col-item {
  :deep(.ant-statistic-content) {
    font-size: 24px !important;
  }
  &.one {
    flex: 0 0 100%;
    max-width: 100%;
  }
  &.two {
    flex: 0 0 50%;
    max-width: 50%;
    :deep(.ant-statistic-content) {
      font-size: 22px !important;
    }
  }
  &.three {
    flex: 0 0 33.333333%;
    max-width: 33.333333%;
    :deep(.ant-statistic-content) {
      font-size: 20px !important;
    }
  }
  &.four {
    flex: 0 0 25%;
    max-width: 25%;
    &.sta-num {
      :deep(.ant-statistic-content) {
        font-size: 18px !important;
      }
    }
  }
  &.five {
    flex: 0 0 20%;
    max-width: 20%;
    &.sta-num {
      :deep(.ant-statistic-content) {
        font-size: 15px !important;
      }
    }
  }
}

.block-item {
  :deep(.ant-input[disabled]),
  :deep(.ant-input-number-disabled input) {
    color: #999 !important;
  }
}

.show-days {
  line-height: 50px;
  font-size: 16px;
  > span {
    opacity: 0.7;
  }
}
</style>
