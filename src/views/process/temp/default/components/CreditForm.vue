<template>
  <div>
    <div
      class="block-item mb"
      :class="{ checked: offerAmount.is_check && showCheck }"
    >
      <vco-process-title :title="t('放款信息')">
        <div v-if="showCheck" class="flex gap-5">
          <a-popconfirm
            :title="t('确定通过审核吗？')"
            :ok-text="t('确定')"
            :cancel-text="t('取消')"
            @confirm="checkHandle()"
          >
            <a-button
              type="dark"
              shape="round"
              class="uppercase"
              v-if="!offerAmount.is_check && creditId"
            >
              {{ t('审核') }}
            </a-button>
          </a-popconfirm>
          <a-button
            v-if="showCheckEdit"
            type="primary"
            shape="round"
            :loading="subLoading"
            class="uppercase"
            @click="saveHandle()"
          >
            {{ t('保存') }}
          </a-button>
        </div>
      </vco-process-title>
      <div class="sys-form-content mt-5">
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
                  :disabled="inputDisabled"
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
                  :disabled="inputDisabled"
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
            <a-col :span="7">
              <a-form-item
                :label="t('首次土地贷款放款额')"
                name="initial_land_amount"
              >
                <a-input-number
                  :max="99999999999"
                  :disabled="inputDisabled"
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
            <a-col :span="7">
              <a-form-item
                :label="t('首次建筑贷款放款额')"
                name="initial_build_amount"
              >
                <a-input-number
                  :max="99999999999"
                  :disabled="inputDisabled"
                  v-model:value="formState.initial_build_amount"
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
                  :label="item.credit_name"
                  :name="item.credit_table"
                >
                  <a-input
                    v-model:value="formState[item.credit_table]"
                    :disabled="inputDisabled"
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
                  :label="item.credit_name"
                  :name="item.credit_table"
                >
                  <a-input-number
                    v-model:value="formState[item.credit_table]"
                    :disabled="inputDisabled"
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
                <a-form-item :label="item.credit_name">
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
      <div v-if="showCheck" class="check-content">
        <i class="iconfont">&#xe647;</i>
      </div>
    </div>

    <div
      v-if="stepType === 2 && bonusItems.length"
      class="block-item mb"
      :class="{ checked: bonusInfo.is_check && showCheck }"
    >
      <vco-process-title :title="t('奖金信息')">
        <div v-if="showCheck" class="flex gap-5">
          <a-popconfirm
            :title="t('确定通过审核吗？')"
            :ok-text="t('确定')"
            :cancel-text="t('取消')"
            @confirm="bonusCheckHandle()"
          >
            <a-button
              type="dark"
              shape="round"
              class="uppercase"
              v-if="!bonusInfo.is_check && showBonusCheck"
            >
              {{ t('审核') }}
            </a-button>
          </a-popconfirm>
          <a-button
            type="primary"
            shape="round"
            :loading="bonusSubLoading"
            class="uppercase"
            @click="bonusSaveHandle"
          >
            {{ t('保存') }}
          </a-button>
        </div>
      </vco-process-title>
      <div class="sys-form-content mt-5">
        <a-form
          ref="bFormRef"
          layout="vertical"
          :model="bFormState"
          :rules="bFormRules"
        >
          <a-row :gutter="24">
            <template v-if="bonusItems.length">
              <a-col
                v-for="item in bonusItems"
                :key="item.credit_table"
                class="data-col-item"
                :class="colClassName(bonusItems.length)"
              >
                <a-form-item
                  :label="item.credit_name"
                  :name="item.credit_table"
                >
                  <a-input
                    v-model:value="bFormState[item.credit_table]"
                    :disabled="inputDisabled"
                    :suffix="item.credit_unit"
                  />
                </a-form-item>
              </a-col>
            </template>
          </a-row>
        </a-form>
      </div>
      <div v-if="showCheck" class="check-content">
        <i class="iconfont">&#xe647;</i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { cloneDeep } from 'lodash';
import { message } from 'ant-design-vue/es';
import {
  ruleCredit,
  creditInitial,
  creditInfo,
  lmAuditStatus,
  fcAuditStatus,
  auditLmCheckStatus,
  projectAuditSaveLoanAmount,
  projectCreditFcSave,
} from '@/api/process';
import emitter from '@/event';
import useProcessStore from '@/store/modules/process';
import tool from '@/utils/tool';

const processStore = useProcessStore();

const emits = defineEmits(['done', 'refresh']);
const props = defineProps({
  currentId: {
    type: [Number, String],
    required: true,
  },
  stepType: {
    type: Number,
    default: 1,
  },
  loanMoney: {
    type: [Number, String],
    default: 0,
  },
  creditCate: {
    type: [Number, String],
    default: 0,
  },
  offerAmount: {
    type: Object,
    default: () => {
      return {
        build_amount: '',
        land_amount: '',
        is_check: false,
        check_status: 405,
      };
    },
  },
  bonusInfo: {
    type: Object,
    default: () => {
      return {
        is_check: false,
        check_status: 500,
      };
    },
  },
  initialAmount: {
    type: Object,
    default: () => {
      return {
        initial_build_amount: '',
        initial_land_amount: '',
      };
    },
  },
});

const validateNum = (rule, value) => {
  if (value && Number(value)) {
    const numRegex = /^(?!0(\.0+)?$)(\d+(\.\d+)?|\.\d+)$/;
    if (!numRegex.test(value)) {
      return Promise.reject(t('请输入大于0的数字'));
    }
  }

  return Promise.resolve();
};

const validateNum1 = (rule, value) => {
  if (value) {
    const numRegex = /^(?!0(\.0+)?$)(\d+(\.\d+)?|\.\d+)$/;
    if (!numRegex.test(value)) {
      return Promise.reject(t('请输入大于0的数字'));
    }
  }

  return Promise.resolve();
};

const { t } = useI18n();

const showCheck = computed(() => {
  return [1, 2, 4].includes(props.stepType);
});

const inputDisabled = computed(() => {
  return ![1, 2].includes(props.stepType);
});

const showCheckEdit = computed(() => {
  return [1, 2].includes(props.stepType);
});

const formRef = ref();
const formState = ref({
  build_amount: '',
  land_amount: '',
  initial_build_amount: '',
  initial_land_amount: '',
});
const formRules = ref({
  build_amount: { validator: validateNum, trigger: 'blur' },
  land_amount: { validator: validateNum, trigger: 'blur' },
  initial_build_amount: { validator: validateNum, trigger: 'blur' },
  initial_land_amount: { validator: validateNum, trigger: 'blur' },
});

const bFormRef = ref();
const bFormState = ref({});
const bFormRules = ref({});

const bonusItems = ref([]);
const percentItems = ref([]);
const dollarItems = ref([]);
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
  return tool.plus(initial_build_amount, initial_land_amount);
});

const getFormItems = async () => {
  const creditCate = props.stepType === 2 ? 0 : props.creditCate;

  await ruleCredit({ type: creditCate }).then(async (res) => {
    const data = res || [];
    let writeData = [];
    let bonusData = [];
    if (props.creditCate > 0) {
      writeData = data.filter((item) => item.is_write && item.type === 1);
      bonusData = data.filter((item) => item.is_write && item.type === 2);
    } else {
      writeData = data.filter((item) => item.is_write);  
    }
    const perData = writeData.filter((item) => item.is_ratio);
    const dolData = writeData.filter((item) => !item.is_ratio);

    if (props.stepType === 2) {
      // FC 审核，将奖金抽离
      const bRulesData = {};

      for (let i = 0; i < bonusData.length; i++) {
        bFormState.value[bonusData[i].credit_table] = bonusData[i].value;

        bRulesData[bonusData[i].credit_table] = [
          { validator: validateNum, trigger: 'blur' },
        ];
        if (bonusData[i].is_req) {
          bRulesData[bonusData[i].credit_table].push(
            {
              required: true,
              message: t('请输入') + bonusData[i].credit_name,
              trigger: 'blur',
            },
            { validator: validateNum1, trigger: 'blur' }
          );
        }
      }

      bFormRules.value = { ...bFormRules.value, ...bRulesData };
      bonusItems.value = bonusData;
    }

    const rulesData = {};
    for (let i = 0; i < writeData.length; i++) {
      formState.value[writeData[i].credit_table] = writeData[i].value;
      rulesData[writeData[i].credit_table] = [
        { validator: validateNum, trigger: 'blur' },
      ];
      if (writeData[i].is_req) {
        rulesData[writeData[i].credit_table].push(
          {
            required: true,
            message: t('请输入') + writeData[i].credit_name,
            trigger: 'blur',
          },
          { validator: validateNum1, trigger: 'blur' }
        );
      }
    }

    formRules.value = { ...formRules.value, ...rulesData };
    percentItems.value = perData;
    dollarItems.value = dolData;
    showNumItems.value = data.filter((item) => !item.is_write);

    await updateFormData();
  });
};

const showBonusCheck = ref(false)
const updateFormData = async () => {
  await creditInfo({
    apply_uuid: props.currentId,
    type: props.creditCate,
  }).then((res) => {
    if (res.length || Object.keys(res).length) {
      for (const key in formState.value) {
        formState.value[key] = res[key] || '0';
      }
      for (let i = 0; i < showNumItems.value.length; i++) {
        showNumItems.value[i].value = res[showNumItems.value[i].credit_table];
      }
      creditId.value = res.id || null;

      for (const key in bFormState.value) {
        bFormState.value[key] = res[key] || '0';
      }

      if (creditId.value) {
        emits('done');

        let num = 0
        for (const key in bFormState.value) {
          if (Number(bFormState.value[key])) {
            num += 1
          }
        }
        showBonusCheck.value = Boolean(num)

        processStore.setForcastState(true);

        // 触发头部模块切换显示
        emitter.emit('showHeaderTab');
      }
    }
  });

  formState.value.land_amount = Number(props.offerAmount.land_amount)
    ? props.offerAmount.land_amount
    : props.loanMoney || 0;
  formState.value.build_amount = props.offerAmount.build_amount;

  formState.value.initial_build_amount =
    props.initialAmount.initial_build_amount;
  formState.value.initial_land_amount = props.initialAmount.initial_land_amount;
};

const subLoading = ref(false);
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

      if (build_amount + land_amount < 0 || build_amount + land_amount === 0) {
        message.error(t('借款总额不正确'));
        return false;
      }

      if (
        initial_build_amount + initial_land_amount < 0 ||
        initial_build_amount + initial_land_amount === 0
      ) {
        message.error(t('首次放款总金额不正确'));
        return false;
      }

      subLoading.value = true;
      const amountParams = {
        uuid: props.currentId,
        build_amount: formState.value.build_amount || 0,
        land_amount: formState.value.land_amount || 0,
        offer_amount_status: props.offerAmount.check_status,
        initial_build_amount: formState.value.initial_build_amount || 0,
        initial_land_amount: formState.value.initial_land_amount || 0,
      };

      const amountChanged =
        Number(amountParams.land_amount) !==
          Number(props.offerAmount.land_amount) ||
        Number(amountParams.build_amount) !==
          Number(props.offerAmount.build_amount) ||
        Number(amountParams.initial_land_amount) !==
          Number(props.initialAmount.initial_land_amount) ||
        Number(amountParams.initial_build_amount) !==
          Number(props.initialAmount.initial_build_amount);

      await projectAuditSaveLoanAmount(amountParams)
        .then(() => {
          emits('refresh');
        })
        .catch(() => {
          subLoading.value = false;
        });

      // lm 审核
      if (props.stepType === 1) {
        const params = cloneDeep(formState.value);
        params.apply_uuid = props.currentId;
        if (creditId.value) {
          params.id = creditId.value;
        }

        creditInitial(params)
          .then(async () => {
            subLoading.value = false;

            // 触发预测数据刷新
            emitter.emit('refreshForecastList');

            await updateFormData();
          })
          .catch(() => {
            subLoading.value = false;
          });
      } else if (props.stepType === 2) {
        // fc 审核
        const params = cloneDeep(formState.value);
        params.apply_uuid = props.currentId;
        if (creditId.value) {
          params.id = creditId.value;
        }
        projectCreditFcSave(params)
          .then(async () => {
            if (amountChanged) {
              creditInitial(params)
                .then(async () => {
                  subLoading.value = false;

                  // 触发预测数据刷新
                  emitter.emit('refreshForecastList');
                })
                .catch(() => {
                  subLoading.value = false;
                });
            } else {
              subLoading.value = false;
            }

            await updateFormData();
          })
          .catch(() => {
            subLoading.value = false;
          });
      }
    })
    .catch((error) => {
      console.log('error', error);
    });
};

const colClassName = (num) => {
  if (num === 1) {
    return 'one';
  } else if (num === 2) {
    return 'two';
  } else if (num === 3) {
    return 'three';
  } else if (num === 4) {
    return 'four';
  } else {
    return 'five';
  }
};

const colClassName1 = (num) => {
  if (num === 1) {
    return 'one';
  } else if (num === 2) {
    return 'two sta-num';
  } else if (num === 3) {
    return 'three sta-num';
  } else if (num === 4) {
    return 'four sta-num';
  } else {
    return 'five sta-num';
  }
};

const checkHandle = async () => {
  if (creditId.value) {
    const totalAmount =
      Number(formState.value.build_amount) +
      Number(formState.value.land_amount);
    if (totalAmount <= 0) {
      message.error(t('借款总额不正确'));
      return false;
    }

    let ajaxFn = null;
    let params = {};
    if (props.stepType === 1) {
      ajaxFn = lmAuditStatus;
      params = {
        lm_audit_status: props.offerAmount.check_status,
        uuid: props.currentId,
      };
    } else if (props.stepType === 2) {
      ajaxFn = fcAuditStatus;
      params = {
        fc_audit_status: props.offerAmount.check_status,
        uuid: props.currentId,
      };
    } else if (props.stepType === 4) {
      ajaxFn = auditLmCheckStatus;
      params = {
        lm_check_status: props.offerAmount.check_status,
        uuid: props.currentId,
      };
    }

    if (ajaxFn) {
      await ajaxFn(params)
        .then(() => {
          emits('refresh');
          return true;
        })
        .catch(() => {
          return false;
        });
    }
  } else {
    message.error(t('请先设置下列费用并生成预测单'));
  }
};

const bonusCheckHandle = async () => {
  const params = {
    fc_audit_status: props.bonusInfo.check_status,
    uuid: props.currentId,
  };
  await fcAuditStatus(params)
    .then(() => {
      emits('refresh');
      return true;
    })
    .catch(() => {
      return false;
    });
};

const bonusSubLoading = ref(false);

const bonusSaveHandle = () => {
  bFormRef.value.validate().then(async () => {
    const params = cloneDeep(bFormState.value);
    params.apply_uuid = props.currentId;
    if (creditId.value) {
      params.id = creditId.value;
    }

    bonusSubLoading.value = true;
    projectCreditFcSave(params)
      .then(async () => {
        bonusSubLoading.value = false;

        emits('refresh');
        await updateFormData();
      })
      .catch(() => {
        bonusSubLoading.value = false;
      });
  });
};

onMounted(() => {
  getFormItems();
  emitter.on('refreshIRR', () => {
    getFormItems();
  });

  // 重新生成forecast
  emitter.on('resetForecast', async (data) => {
    const build_amount = Number(formState.value.build_amount);
    const land_amount = Number(formState.value.land_amount);
    const initial_build_amount = Number(formState.value.initial_build_amount);
    const initial_land_amount = Number(formState.value.initial_land_amount);

    const totalA = build_amount + land_amount;
    const new_build_amount = Math.floor(data.amount * (build_amount / totalA));
    const new_land_amount = data.amount - new_build_amount;

    const totalB = initial_build_amount + initial_land_amount;
    const newTotalB = Math.floor((totalB / totalA) * data.amount);

    const new_initial_build_amount = Math.floor(
      newTotalB * (initial_build_amount / totalB)
    );
    const new_initial_land_amount = newTotalB - new_initial_build_amount;

    formState.value.build_amount = new_build_amount;
    formState.value.land_amount = new_land_amount;

    formState.value.initial_build_amount = new_initial_build_amount;
    formState.value.initial_land_amount = new_initial_land_amount;

    await saveHandle();
  });
});
</script>

<style lang="less" scoped>
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
    color: #282828 !important;
  }
}
</style>
