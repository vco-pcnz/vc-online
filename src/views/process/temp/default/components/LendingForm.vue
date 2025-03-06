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
          <a-col :span="7">
            <a-form-item :label="t('土地贷款总额')" name="land_amount">
              <a-input-number
                v-model:value="formState.land_amount"
                :max="99999999999"
                :disabled="amountDisabled || inputADis"
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
            <a-form-item :label="t('建筑贷款总额')" name="build_amount">
              <a-input-number
                v-model:value="formState.build_amount"
                :max="99999999999"
                :disabled="amountDisabled || inputADis"
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
          <a-col v-if="(refinancialData.length && blockInfo.showEdit) || isRefinancial" :span="24">
            <div v-if="!refinancialDisabled" class="flex gap-2 mb-5">
              <p>{{ t('是否需要再融资') }}</p>
              <a-switch v-model:checked="isRefinancial"></a-switch>
            </div>
            <a-form-item v-if="isRefinancial" :label="refinancialDisabled ? t('再融资项目') : ''" name="substitution_ids">
              <a-select
                v-model:value="formState.substitution_ids"
                mode="multiple"
                :options="formattedRefinancialData"
                :placeholder="t('请选择项目')"
                style="width: 65.5%;"
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
          <a-col :span="isRefinancial ? 5 : 7">
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
          <a-col :span="isRefinancial ? 5 : 7">
            <a-form-item
              :label="t('首次建筑贷款放款额')"
              name="initial_build_amount"
            >
              <a-input-number
                :max="99999999999"
                :disabled="amountDisabled"
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
          <a-col :span="isRefinancial ? 7 : 8" class="total-amount-info" :class="{'financial': isRefinancial}">
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
                  :disabled="inputDisabled(item.editMark)"
                  :suffix="item.credit_unit"
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
                  :disabled="inputDisabled(item.editMark)"
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
  import { useI18n } from 'vue-i18n';
  import { cloneDeep } from 'lodash';
  import { message } from 'ant-design-vue/es';
  import { QuestionCircleOutlined } from '@ant-design/icons-vue'
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
  import tool, { navigationTo } from '@/utils/tool';

  const processStore = useProcessStore();

  const emits = defineEmits(['done', 'refresh', 'openData']);

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

  const isRefinancial = ref(false)
  const refinancialAmount = ref(0)

  // 请求可以置换的项目
  const refinancialData = ref([])

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

      let landTxt,buildTxt = ''
      if (landDiff > 0) {
        landTxt = t('抵押物土地总额为{0}，土地贷款总额为{1}，差{2}', [land_amount, formState.value.land_amount, landDiff])
      }

      if (buildDiff > 0) {
        buildTxt = t('抵押物建筑总额为{0}，建筑贷款总额为{1}，差{2}', [build_amount, formState.value.build_amount, buildDiff])
      }

      const txt = landTxt && buildTxt ? `${landTxt}, ${buildTxt}` : landTxt || buildTxt

      if (txt) {
        res = `${txt}, ${t('确认通过审核吗？')}`
      }
      
      // const securityTotal = props.dataInfo.security.total_money || 0
      // const totalAmount = Number(formState.value.land_amount) + Number(formState.value.build_amount)
      // if (totalAmount > securityTotal) {
      //   const num = tool.minus(totalAmount, securityTotal)
      //   res = t('抵押物总价值为{0}，借款总金额为{1}，差{2}，确认通过审核吗？', [securityTotal, totalAmount, num])
      // }
    }
    return res
  })

  const amountDisabled = computed(() => {
    if (props.isDetails) {
      return true
    } else {
      const mark = props?.currentStep?.mark
      if (props?.blockInfo?.showEdit) {
        return ['step_lm_check'].includes(mark)
      } else {
        return true
      }
    }
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
    return ['step_open'].includes(mark)
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
    substitution_ids: []
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
  const creditId = ref(null);

  const totalAmountRef = computed(() => {
    const build_amount = formState.value.build_amount || 0;
    const land_amount = formState.value.land_amount || 0;
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

  const getFormItems = async () => {
    const creditCate = props.isDetails ? 0 : props.currentStep?.credit_cate;

    await ruleCredit({ type: creditCate }).then(async (res) => {
      const data = res || [];
      const writeData = data.filter((item) => item.is_write);

      staticWriteData.value = writeData

      const perData = writeData.filter((item) => item.is_ratio);
      const dolData = writeData.filter((item) => !item.is_ratio);
      const backData = writeData.filter((item) => item.backMark);

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
      percentItems.value = perData;
      dollarItems.value = dolData;
      changeBackItems.value = backData

      showNumItems.value = props.currentStep?.credit_cate ? data.filter((item) => !item.is_write && item.type === 1) : data.filter((item) => !item.is_write);
      await updateFormData(res);
    });
  };

  const updateFormData = async (tableData) => {
    await creditInfo({
      apply_uuid: props.currentId,
      type: props.currentStep?.credit_cate,
    }).then((res) => {
      if (res.length || Object.keys(res).length) {
        for (const key in formState.value) {
          formState.value[key] = res[key] || '0';
          if (key === 'substitution_ids') {
            formState.value[key] = props.lendingInfo?.substitution_ids || [];
          }
        }
        for (let i = 0; i < showNumItems.value.length; i++) {
          showNumItems.value[i].value = res[showNumItems.value[i].credit_table];
        }
        creditId.value = res.id || null;

        if (creditId.value) {
          emits('done');
          processStore.setForcastState(true);

          // 触发头部模块切换显示
          emitter.emit('showHeaderTab');
        }
      }
    });

    formState.value.land_amount = Number(props.lendingInfo.land_amount)
      ? props.lendingInfo.land_amount
      : props.lendingInfo.loan_money || 0;

    formState.value.build_amount = props.lendingInfo.build_amount;
    formState.value.initial_build_amount = props.lendingInfo.initial_build_amount;
    formState.value.initial_land_amount = props.lendingInfo.initial_land_amount;

    staticFormData.value = cloneDeep(formState.value)
    emits('openData', {
      table: tableData,
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
    const backArr = []
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
        if (Number(staticFormData.value[key]) !== Number(obj[key])) {
          arr.push({
            name: findCreditName(key),
            before: staticFormData.value[key],
            now: obj[key]
          })

          backArr.push()
        }
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

    await projectAuditSaveMode(saveParams.value)
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

        if (build_amount + land_amount < 0) {
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

        const params = {
          code: props.blockInfo.code,
          uuid: props.currentId,
          build_amount: formState.value.build_amount || 0,
          land_amount: formState.value.land_amount || 0,
          initial_build_amount: formState.value.initial_build_amount || 0,
          initial_land_amount: formState.value.initial_land_amount || 0,
          substitution_ids: formState.value.substitution_ids || [],
          substitution_amount: refinancialAmount.value || 0,
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

  watch(
    () => props.lendingInfo,
    (val) => {
      if (val) {
        formState.value.substitution_ids = val.substitution_ids || []
        isRefinancial.value = Boolean(val.substitution_ids && val?.substitution_ids?.length)

        if (Number(val.land_amount) !== Number(formState.value.land_amount) ||
          Number(val.build_amount) !== Number(formState.value.build_amount) ||
          Number(val.initial_land_amount) !== Number(formState.value.initial_land_amount) ||
          Number(val.initial_build_amount) !== Number(formState.value.initial_build_amount)
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
