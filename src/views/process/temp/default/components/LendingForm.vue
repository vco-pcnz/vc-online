<template>
  <div
    class="block-item mb"
    :class="{ checked: lendingInfo.is_check && blockInfo?.showCheck, 'details': isDetails }"
  >
    <!-- 首次放款选择弹窗 -->
    <a-modal
      :open="selectVisible"
      :title="t('进度付款阶段')"
      :width="1400"
      :footer="null"
      :keyboard="false"
      :maskClosable="false"
      @cancel="selectVisible = false"
    >
      <view-content
        v-if="selectVisible"
        :is-select="true"
        :show-process="true"
        :selected-data="selectedData"
        @selectDone="selectDoneHandle"
      ></view-content>
    </a-modal>
    
    <!-- 确认弹窗 -->
    <vco-confirm-alert
      ref="changeAlertRef"
      :confirm-txt="confirmTxt"
      v-model:visible="changeVisible"
      @submit="submitRquest"
    ></vco-confirm-alert>

    <!-- 费改动后弹窗 -->
    <vco-confirm-alert
      ref="changeFeeRef"
      :confirm-txt="saveDataTxt"
      v-model:visible="saveTipsVisible"
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
            @click="changeVisible = true"
          >
            {{ t('审核') }}
          </a-button>
          <a-popconfirm
            v-else
            :title="t('确定通过审核吗？')"
            :ok-text="t('确定')"
            :cancel-text="t('取消')"
            @confirm="checkHandle"
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
          <template v-if="!isDetails">
            <a-col :span="8">
              <a-form-item :label="t('是否有Linefee')" name="has_linefee">
                <a-switch :disabled="amountDisabled || inputADis" v-model:checked="formState.has_linefee" :checkedValue="1" :unCheckedValue="0" @change="linefeeFilter" />
              </a-form-item>
            </a-col>
            <template v-if="showCompare">
              <a-col :span="8">
                <a-form-item :label="t('是否预算')" name="do__est">
                  <a-switch :disabled="amountDisabled || inputADis" v-model:checked="formState.do__est" :checkedValue="1" :unCheckedValue="0" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label=" ">
                  <a-button
                    type="brown"
                    shape="round"
                    size="small"
                    class="flex items-center"
                    @click="goHandle('budget')"
                  >
                    {{ t('查看预算信息') }}
                    <RightOutlined :style="{ fontSize: '11px', 'margin-inline-start': '4px'  }" />
                  </a-button>
                </a-form-item>
              </a-col>
            </template>
            <a-col v-else :span="16"></a-col>
            
            <a-col :span="24"><div class="form-line"></div></a-col>
          </template>

          <a-col :span="24">
            <a-form-item :label="t('开发成本')">
              <DevCostDetail
                :disabled="amountDisabled || inputADis"
                v-model:value="formState.devCost"
                v-model:dataJson="formState.devCostDetail"
                @change="devCostChange"
              >
                <div class="inline overflow-hidden">
                  <vco-number class="float-left" v-model:value="formState.devCost" :precision="2" :end="true"></vco-number>
                  <a-button class="float-left ml-3" v-if="!amountDisabled && !inputADis" type="link">
                    <i class="iconfont">&#xe753;</i>
                  </a-button>
                </div>
              </DevCostDetail>
            </a-form-item>
          </a-col>
          
          <a-col :span="7">
            <a-form-item :label="t('土地贷款总额')" name="land_amount">
              <a-input-number
                v-model:value="formState.land_amount"
                :max="99999999999"
                :disabled="true"
                :formatter="
                  (value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                "
                :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="1" class="plus-txt">
            <i class="iconfont">&#xe889;</i>
          </a-col>
          <a-col :span="7">
            <a-form-item name="build_amount" class="w-full-label">
              <template #label>
                <div class="w-full flex justify-between items-center" style="height: 22px;">
                  <p>{{ t('建筑贷款总额') }}</p>
                  <a-button
                    v-if="showProgressPayment"
                    type="link"
                    style="font-size: 12px; height: auto !important;"
                    class="flex items-center"
                    @click="goProgressPage"
                  >
                    <p>{{ t('进度付款') }}</p>
                    <i class="iconfont">&#xe602;</i>
                  </a-button>
                </div>
              </template>
              <a-input-number
                v-model:value="formState.build_amount"
                :max="99999999999"
                :disabled="true"
                :formatter="
                  (value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                "
                :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
              />
            </a-form-item>
          </a-col>

          <a-col :span="1" class="plus-txt"><i class="iconfont">=</i></a-col>
          <a-col :span="8" class="total-amount-info">
            <a-form-item :label="t('借款总金额')">
              <vco-number
                :value="totalAmountRef"
                :precision="2"
                :end="true"
              ></vco-number>
            </a-form-item>
          </a-col>
          <a-col :span="24"><div class="form-line"></div></a-col>
          <a-col v-if="((refinancialData.length && blockInfo.showEdit) || isRefinancial) && refinancialShow" :span="24">
            <div v-if="!refinancialDisabled" class="flex gap-2 mb-5">
              <p>{{ t('是否需要再融资') }}</p>
              <a-switch v-model:checked="isRefinancial"></a-switch>
            </div>
            <a-form-item v-if="isRefinancial" :label="refinancialDisabled ? t('再融资项目') : ''" name="substitution_ids">
              <a-select
                v-model:value="formState.substitution_ids"
                mode="multiple"
                :options="formattedRefinancialData"
                :filter-option="filterOption"
                :placeholder="t('请选择项目')"
                style="width: 52.58%;"
                :disabled="refinancialDisabled"
                @change="(value, option) => refinancialChange(option)"
              >
                <template #option="{ label, value, item }">
                  <p>{{ label }}</p>
                  <vco-number
                    :value="Number(item.amount)"
                    :precision="2"
                    size="fs_xs"
                    :end="true"
                    color="#666666"
                  ></vco-number>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="isRefinancial ? 6 : 7">
            <a-form-item
              :label="t('首次土地贷款放款额')"
              name="initial_land_amount"
            >
              <a-input-number
                :max="99999999999"
                :disabled="amountDisabled"
                v-model:value="formState.initial_land_amount"
                :formatter="
                  (value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                "
                :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="1" class="plus-txt">
            <i class="iconfont">&#xe889;</i>
          </a-col>
          <a-col :span="isRefinancial ? 6 : 7">
            <a-form-item name="initial_build_amount" class="w-full-label">
              <template #label>
                <div class="w-full flex justify-between items-center" style="height: 22px;">
                  <p>{{ t('首次建筑贷款放款额') }}</p>
                  <a-button
                    v-if="!amountDisabled"
                    type="link"
                    style="font-size: 12px; height: auto !important;"
                    class="flex items-center"
                    @click="selectVisible = true"
                  >
                    <p>{{ t('选择') }}</p>
                    <i class="iconfont">&#xe602;</i>
                  </a-button>
                </div>
              </template>
              <a-input-number
                :max="99999999999"
                :disabled="true"
                v-model:value="formState.initial_build_amount"
                :formatter="
                  (value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                "
                :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
              />
            </a-form-item>
          </a-col>
          <template v-if="isRefinancial">
            <a-col :span="1" class="plus-txt">
              <i class="iconfont">&#xe889;</i>
            </a-col>
            <a-col :span="4" class="financial-amount">
              <a-form-item :label="t('再融资金额')">
                <vco-number
                  :value="refinancialAmount"
                  :precision="2"
                  :end="true"
                ></vco-number>
              </a-form-item>
            </a-col>
          </template>
          <a-col :span="1" class="plus-txt"><i class="iconfont">=</i></a-col>
          <a-col :span="isRefinancial ? 5 : 8" class="total-amount-info" :class="{'financial': isRefinancial}">
            <a-form-item :label="t('首次放款总金额')">
              <vco-number
                :value="totalInitialAmountRef"
                :precision="2"
                :end="true"
              ></vco-number>
            </a-form-item>
          </a-col>
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
  import { RightOutlined } from '@ant-design/icons-vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute } from 'vue-router';
  import { cloneDeep } from 'lodash';
  import { message } from 'ant-design-vue/es';
  import { QuestionCircleOutlined } from '@ant-design/icons-vue'
  import { useUserStore } from '@/store';
  import {
    ruleCredit,
    creditInfo,
    projectAuditSaveMode,
    projectAuditCheckMode,
    projectAuditGoback,
    projectAuditSubstitution,
    projectDetailSubstitution
  } from '@/api/process';
  import emitter from '@/event';
  import useProcessStore from '@/store/modules/process';
  import tool, { navigationTo, numberStrFormat } from '@/utils/tool';
  import DevCostDetail from './DevCostDetail.vue';
  import ViewContent from '@/views/requests/progress-payment/components/ViewContent.vue';

  const processStore = useProcessStore();

  const emits = defineEmits(['done', 'refresh', 'openData']);

  const { t } = useI18n();
  const route = useRoute();

  const userStore = useUserStore();

  const isNormalUser = computed(() => userStore.isNormalUser);

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

  const isRefinancial = ref(false)
  const refinancialAmount = ref(0)

  // 请求可以置换的项目
  const refinancialData = ref([])

  // 是否显示进度付款
  const showProgressPayment = computed(() => {
    return Number(props.dataInfo.security.count) && Number(props.dataInfo.lending.build_amount) && !isNormalUser.value
  })

  const goProgressPage = () => {
    const path = route.path
    let href = ''
    if (path === '/requests/details/about') {
      href = '/requests/details/progress-payment'
    } else if (path.indexOf('process') > -1) {
      href = '/requests/progress-payment'
    }

    if (href) {
      navigationTo(`${href}?uuid=${props.currentId}`)
    }
  }

  const getRefinancialList = (flag = false) => {
    if (flag) {
      refinancialAmount.value = 0
      formState.value.substitution_ids = []
      emits('refresh');
    }

    const ajaxFn = props.isDetails ? projectDetailSubstitution : projectAuditSubstitution
    ajaxFn({
      uuid: props.currentId
    }).then(res => {
      refinancialData.value = res || []
    })
  }

  const formattedRefinancialData = computed(() => {
    const data = refinancialData.value || []
    return data.map(item => ({
      label: item.project_name,
      value: item.uuid,
      item: item
    }))
  })

  const filterOption = (input, option) => {
    return option.label.toLowerCase().includes(input.toLowerCase());
  };

  const refinancialChange = (data) => {
    if (data.length) {
      const dataArr = data.map(item => Number(item.item.amount))
      const sum = dataArr.reduce((acc, cur) => acc + cur, 0)
      refinancialAmount.value = sum
    } else {
      refinancialAmount.value = 0
    }
  }

  const staticFormData = ref()
  const staticWriteData = ref()

  const confirmTxt = computed(() => {
    let res = ''
    if (!props.isDetails) {
      const {land_amount, build_amount} = props.dataInfo.security
      const landDiff = tool.minus(Number(formState.value.land_amount), land_amount)
      const buildDiff = tool.minus(Number(formState.value.build_amount), build_amount)

      // let landTxt,buildTxt = ''
      // if (landDiff > 0) {
      //   landTxt = t('抵押物土地总额为{0}，土地贷款总额为{1}，差{2}', [land_amount, formState.value.land_amount, landDiff])
      // }

      // if (buildDiff > 0) {
      //   buildTxt = t('抵押物建筑总额为{0}，建筑贷款总额为{1}，差{2}', [build_amount, formState.value.build_amount, buildDiff])
      // }

      // const txt = landTxt && buildTxt ? `${landTxt}, ${buildTxt}` : landTxt || buildTxt

      // if (txt) {
      //   res = `${txt}, ${t('确认通过审核吗？')}`
      // }
      
      const securityTotal = props.dataInfo.security.total_money || 0
      const totalAmount = tool.plus(Number(formState.value.land_amount), Number(formState.value.build_amount))

      if (totalAmount > securityTotal) {
        const num = tool.minus(totalAmount, securityTotal)
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

  const refinancialShow = computed(() => {
    if (props.isDetails) {
      return true
    } else {
      const mark = props?.currentStep?.mark
      if (props?.blockInfo?.showEdit) {
        if (['step_lm_audit'].includes(mark)) {
          return true
        } else {
          return isRefinancial.value
        }
      } else {
        return isRefinancial.value
      }
    }
  })

  const showCompare = computed(() => {
    const mark = props?.currentStep?.mark
    return ['step_lm_audit'].includes(mark)
  })

  const refinancialDisabled = computed(() => {
    return amountDisabled.value
    // const mark = props?.currentStep?.mark

    // if (props?.blockInfo?.showEdit) {
    //   return amountDisabled.value || !['step_lm_audit', 'step_fc_audit'].includes(mark)
    // } else {
    //   return amountDisabled.value
    // }
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

  const formRef = ref();
  const formState = ref({
    build_amount: '',
    land_amount: '',
    initial_build_amount: '',
    initial_land_amount: '',
    substitution_ids: [],
    has_linefee: 1,
    do__est: 0,
    devCost: '',
    devCostDetail:''
  });

  const formRules = ref({
    build_amount: { validator: validateNum, trigger: 'blur' },
    land_amount: { validator: validateNum, trigger: 'blur' },
    initial_build_amount: { validator: validateNum, trigger: 'blur' },
    initial_land_amount: { validator: validateNum, trigger: 'blur' },
  });

  const percentItems = ref([]);
  const dollarItems = ref([]);
  const changeBackItems = ref([])
  const showNumItems = ref([]);

  const percentItemsStore = ref([]);
  const dollarItemsStore = ref([]);
  const changeBackItemsStore = ref([])
  const showNumItemsStore = ref([]);

  const creditId = ref(null);

  const totalAmountRef = computed(() => {
    const build_amount = formState.value.build_amount || 0;
    const land_amount = formState.value.land_amount || 0;
    calcBrokerFee()
    return tool.plus(build_amount, land_amount);
  });

  const totalInitialAmountRef = computed(() => {
    const initial_build_amount = formState.value.initial_build_amount || 0;
    const initial_land_amount = formState.value.initial_land_amount || 0;
    return tool.plus(tool.plus(initial_build_amount, initial_land_amount), refinancialAmount.value);
  });

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

    if (formState.value.has_linefee === 0) {
      percentData = percentData.filter(item => !item.is_linefee)
      dollarData = dollarData.filter(item => !item.is_linefee)
      changeBack = changeBack.filter(item => !item.is_linefee)
      showNum = showNum.filter(item => !item.is_linefee)
    }

    percentItems.value = percentData
    dollarItems.value = dollarData;
    changeBackItems.value = changeBack
    showNumItems.value = showNum
  }

  // 计算中介费
  const calcBrokerFee = () => {
    if ('credit_brokerFeeRate' in formState.value && 'credit_brokerFee' in formState.value) {
      const build_amount = formState.value.build_amount || 0;
      const land_amount = formState.value.land_amount || 0;
      const brokeFeeRate = formState.value.credit_brokerFeeRate || 0
      

      if (isNaN(Number(brokeFeeRate))) {
        formState.value.credit_brokerFee = 0
      } else {
        const amount = tool.plus(build_amount, land_amount);
        const per = tool.div(Number(brokeFeeRate), 100)
        const num = tool.times(amount, per)

        formState.value.credit_brokerFee = num
      }
    }
  }

  const percentInput = (key) => {
    // 中介费率修改
    if (key === 'credit_brokerFeeRate') {
      calcBrokerFee()
    }
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
          brokerFee.disabled = true
        }
      }

      const rulesData = {};
      for (let i = 0; i < writeData.length; i++) {
        formState.value[writeData[i].credit_table] = writeData[i].value;
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
      
      await updateFormData(res);
    });
  };

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
          formState.value[key] = res[key] || '0';
        }
        for (let i = 0; i < showNumItemsStore.value.length; i++) {
          showNumItemsStore.value[i].value = res[showNumItemsStore.value[i].credit_table];
        }
        creditId.value = res.id || null;

        if (creditId.value) {
          emits('done');
          processStore.setForcastState(true);

          // 触发头部模块切换显示
          emitter.emit('showHeaderTab');
        }
      }

      formState.value.substitution_ids = props.lendingInfo?.substitution_ids || [];
      formState.value.has_linefee = props.lendingInfo?.has_linefee;
      linefeeFilter()
    });

    formState.value.build_amount = Number(props.lendingInfo.land_amount) ? props.lendingInfo.build_amount : Number(props.lendingInfo.build_amount)
      ? props.lendingInfo.build_amount
      : props.lendingInfo.loan_money || 0;

    formState.value.land_amount = props.lendingInfo.land_amount;
    
    formState.value.initial_build_amount = props.lendingInfo.initial_build_amount;
    formState.value.initial_land_amount = props.lendingInfo.initial_land_amount;

    formState.value.devCost = props.lendingInfo.devCost
    formState.value.devCostDetail = props.lendingInfo.devCostDetail

    // 首次放款建筑费用
    if (props.lendingInfo.buildlog && props.lendingInfo.buildlog.length) {
      selectedData.value = props.lendingInfo.buildlog
    }

    staticFormData.value = cloneDeep(formState.value)
    emits('openData', {
      table: tableDataRefData.value,
      data: formState.value
    })
  };

  const submitRquest = async () => {
    await checkHandle()
    changeAlertRef.value.changeLoading(false)
    changeVisible.value = false
  }

  const checkHandle = async () => {
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
  }

  const saveDataTxtArr = ref([])

  const saveReturnRea = computed(() => {
    const txtArr = []
    for (let i = 0; i < saveDataTxtArr.value.length; i++) {
      txtArr.push(t('{0}由{1}修改为了{2}', [saveDataTxtArr.value[i].name, saveDataTxtArr.value[i].before, saveDataTxtArr.value[i].now]))
    }
    return txtArr.join(', ')
  })

  const saveDataTxt = computed(() => {
    let txt = '保存后将退回审核'
    if (props.currentStep?.mark === 'step_lm_check') {
      txt = '保存后将退回到上一步审核'
    }

    return `${saveReturnRea.value}，${t(txt)}`
  })

  const findCreditName = (key) => {
    const obj = staticWriteData.value.find(item => item.credit_table === key)
    return obj ? obj.credit_name : ''
  }

  const compareBackObj = ref({})

  const compareHandle = (obj) => {
    compareBackObj.value = {}

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
        
        return markInfo[0]
      })

      compareBackObj.value = {
        ...compareBackObj.value,
        ...backObj
      }

      if (backMark.includes(props.currentStep.mark)) {
        const key = backItems[i].credit_table

        const beforeN = numberStrFormat(staticFormData.value[key])
        const nowN = numberStrFormat(obj[key])

        const beforeNum = backItems[i].is_ratio ? `${beforeN}${backItems[i].credit_unit}` : `${backItems[i].credit_unit}${beforeN}`
        const nowNum = backItems[i].is_ratio ? `${nowN}${backItems[i].credit_unit}` : `${backItems[i].credit_unit}${nowN}`

        if (Number(staticFormData.value[key]) !== Number(obj[key])) {
          if (['credit_brokerFeeRate'].includes(key)) {
            if (Number(obj[key]) > Number(staticFormData.value[key])) {
              arr.push({
                name: findCreditName(key),
                before: beforeNum,
                now: nowNum
              })
            }
          } else if (key === 'credit_frontFee') {
            if (Number(obj[key]) < Number(staticFormData.value[key])) {
              arr.push({
                name: findCreditName(key),
                before: beforeNum,
                now: nowNum
              })
            }
          } else {
            // 有中介费率
            if ('credit_brokerFeeRate' in formState.value && 'credit_brokerFee' in formState.value) {
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

    if (Object.keys(compareBackObj.value).includes(props.currentStep.mark)) {
      if (Number(obj?.initial_build_amount) !== Number(staticFormData.value?.initial_build_amount)) {
        arr.unshift({
          name: t('首次建筑贷款放款额'),
          before: `$${numberStrFormat(Number(staticFormData.value?.initial_build_amount))}`,
          now: `$${numberStrFormat(Number(obj?.initial_build_amount))}`
        })
      }

      if (Number(obj?.initial_land_amount) !== Number(staticFormData.value?.initial_land_amount)) {
        arr.unshift({
          name: t('首次土地贷款放款额'),
          before: `$${numberStrFormat(Number(staticFormData.value?.initial_land_amount))}`,
          now: `$${numberStrFormat(Number(obj?.initial_land_amount))}`
        })
      }

      if (Number(obj?.build_amount) !== Number(staticFormData.value?.build_amount)) {
        arr.unshift({
          name: t('建筑贷款总额'),
          before: `$${numberStrFormat(Number(staticFormData.value?.build_amount))}`,
          now: `$${numberStrFormat(Number(obj?.build_amount))}`
        })
      }

      if (Number(obj?.land_amount) !== Number(staticFormData.value?.land_amount)) {
        arr.unshift({
          name: t('土地贷款总额'),
          before: `$${numberStrFormat(Number(staticFormData.value?.land_amount))}`,
          now: `$${numberStrFormat(Number(obj?.land_amount))}`
        })
      }

      if (Number(obj?.has_linefee) !== Number(staticFormData.value?.has_linefee)) {
        arr.unshift({
          name: t('是否有Linefee'),
          before: Number(staticFormData.value?.has_linefee) ? t('是') : t('否'),
          now: Number(obj?.has_linefee) ? t('是') : t('否')
        })
      }
    }

    saveDataTxtArr.value = arr
    return Boolean(arr.length)
  }

  const changeFeeRef = ref()
  const saveParams = ref()
  const saveDataChange = ref(false)
  const saveTipsVisible = ref(false)
  const subLoading = ref(false);

  const saveRequeset = async () => {
    subLoading.value = true;

    const formParams = cloneDeep(saveParams.value)
    if (selectedData.value) {
      formParams.build__data = selectedData.value
    }

    await projectAuditSaveMode(formParams)
      .then(async () => {
        if (saveDataChange.value) {
          const params = {
            uuid: props.currentId,
            cancel_reason: saveReturnRea.value,
            again_check: 0
          }

          if (compareBackObj.value[props.currentStep.mark]) {
            params.back_step = compareBackObj.value[props.currentStep.mark]
          }

          projectAuditGoback(params).then(() => {
            subLoading.value = false
            changeFeeRef.value.changeLoading(false)

            navigationTo(`/requests/details?uuid=${props.currentId}`)
          }).catch(() => {
            changeFeeRef.value.changeLoading(false)
          })
        } else {
          subLoading.value = false;

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
        }
      })
      .catch(() => {
        subLoading.value = false;
      });
  }

  const saveHandle = async () => {
    formRef.value
      .validate()
      .then(async () => {
        const build_amount = Number(formState.value.build_amount);
        const initial_build_amount = Number(formState.value.initial_build_amount);
        const land_amount = Number(formState.value.land_amount);
        const initial_land_amount = Number(formState.value.initial_land_amount);

        if (initial_build_amount > build_amount) {
          message.error(
            t('{0}不能大于{1}', [t('首次建筑贷款放款额', t('建筑贷款总额'))])
          );
          return false;
        }

        if (initial_land_amount > land_amount) {
          message.error(
            t('{0}不能大于{1}', [t('首次土地贷款放款额', t('土地贷款总额'))])
          );
          return false;
        }

        const totalAmount = build_amount + land_amount
        if (totalAmount < 0 || totalAmount === 0) {
          message.error(t('借款总额不正确'));
          return false;
        }

        // 首次放款金额可以为0
        if (
          initial_build_amount + initial_land_amount < 0
        ) {
          message.error(t('首次放款总金额不正确'));
          return false;
        }

        const credit__data = cloneDeep(formState.value);
        delete credit__data.initial_build_amount
        delete credit__data.initial_land_amount
        delete credit__data.land_amount
        delete credit__data.substitution_ids
        delete credit__data.has_linefee
        delete credit__data.do__est
        delete credit__data.devCost
        delete credit__data.devCostDetail

        const params = {
          code: props.blockInfo.code,
          uuid: props.currentId,
          build_amount: formState.value.build_amount || 0,
          land_amount: formState.value.land_amount || 0,
          initial_build_amount: formState.value.initial_build_amount || 0,
          initial_land_amount: formState.value.initial_land_amount || 0,
          substitution_ids: formState.value.substitution_ids || [],
          devCost: formState.value.devCost,
          devCostDetail: formState.value.devCostDetail,
          substitution_amount: refinancialAmount.value || 0,
          has_linefee: Number(formState.value.has_linefee),
          do__est: Number(formState.value.do__est),
          credit__data
        };

        if (creditId.value) {
          params.credit__data.id = creditId.value;
        }

        saveParams.value = params

        const compareData = {
          ...cloneDeep(params),
          ...cloneDeep(params.credit__data)
        }

        // 费改变需退回判断
        if (compareHandle(compareData)) {
          saveDataChange.value = true
          saveTipsVisible.value = true
        } else {
          saveDataChange.value = false
          await saveRequeset()
        }
      })
      .catch((error) => {
        console.log('error', error);
      });
  };

  const devCostChange = (data) => {
    const list = data.devCostDetail[0].data[0].list
    const landObj = list.find(item => item.type === 'Land')
    formState.value.land_amount = landObj ? landObj.loan : 0

    const filterType = ['Land', 'Refinance']
    const buildArr = list.filter(item => !filterType.includes(item.type)).map(item => item.loan)
    const total = buildArr.reduce((total, num) => {
      return Number(tool.plus(total, num))
    }, 0);
    formState.value.build_amount = total || 0
  }

  watch(
    () => props.lendingInfo,
    (val) => {
      if (val) {
        formState.value.substitution_ids = val.substitution_ids || []
        isRefinancial.value = Boolean(val.substitution_ids && val?.substitution_ids?.length)

        if (Number(val.land_amount) !== Number(formState.value.land_amount) ||
          Number(val.build_amount) !== Number(formState.value.build_amount) ||
          Number(val.initial_land_amount) !== Number(formState.value.initial_land_amount) ||
          Number(val.initial_build_amount) !== Number(formState.value.initial_build_amount) ||
          Number(val.has_linefee) !== Number(formState.value.has_linefee)
        ) {
          updateFormData()
        }
      } else {
        isRefinancial.value = false
      }
    }
  )

  watch(
    () => isRefinancial.value,
    (val) => {
      if (val) {
        formRules.value['substitution_ids'] = [{ required: true, message: t('请选择项目') }]
      } else {
        delete formRules.value['substitution_ids']
        formState.value.substitution_ids = []
        refinancialAmount.value = 0
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

  // 首次建筑放款数据
  const selectedData = ref([])

  const selectVisible = ref(false)
  const selectDoneHandle = (data) => {
    selectedData.value = cloneDeep(data.build__data)
    formState.value.initial_build_amount = data.total
    selectVisible.value = false
  }

  const goHandle = (page) => {
    const pathname = window.location.pathname
    const step = pathname.slice(pathname.lastIndexOf('/') + 1)
    const href = `/requests/${page}?uuid=${props.currentId}&step=${step}&sn=${props.dataInfo.base.project_apply_sn}`

    navigationTo(href)
  }

  onMounted(() => {
    isRefinancial.value = Boolean(props.lendingInfo.substitution_ids && props.lendingInfo?.substitution_ids?.length)
    refinancialAmount.value = props.lendingInfo?.substitution_amount || 0

    getRefinancialList()
    getFormItems();
    emitter.on('refreshIRR', handleRefreshIRR);
    emitter.on('blockShowTarget', blockShowTargetHandle)
    emitter.on('refreshRefinancial', getRefinancialList)
  });

  onUnmounted(() => {
    emitter.off('refreshIRR', handleRefreshIRR);
    emitter.off('blockShowTarget', blockShowTargetHandle)
    emitter.off('refreshRefinancial', getRefinancialList)
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
  :deep(.ant-input-number-disabled) {
    color: #999 !important;
  }
}
</style>
