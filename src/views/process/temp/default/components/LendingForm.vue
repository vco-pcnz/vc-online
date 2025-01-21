<template>
  <div
    class="block-item mb"
    :class="{ checked: lendingInfo.is_check && blockInfo.showCheck }"
  >
    <vco-process-title :title="t('放款信息')">
      <div class="flex gap-5">
        <a-popconfirm
          v-if="blockInfo.showCheck && !lendingInfo.is_check && creditId"
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
          <a-col :span="7">
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
          <a-col :span="7">
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
    <div v-if="blockInfo.showCheck" class="check-content">
      <i class="iconfont">&#xe647;</i>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { cloneDeep } from 'lodash';
  import { message } from 'ant-design-vue/es';
  import { QuestionCircleOutlined } from '@ant-design/icons-vue'
  import {
    ruleCredit,
    creditInfo,
    projectAuditSaveMode,
    projectAuditCheckMode
  } from '@/api/process';
  import emitter from '@/event';
  import useProcessStore from '@/store/modules/process';
  import tool from '@/utils/tool';

  const processStore = useProcessStore();

  const emits = defineEmits(['done', 'refresh', 'openData']);

  const { t } = useI18n();

  const props = defineProps({
    lendingInfo: {
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
    }
  })

  const amountDisabled = computed(() => {
    const mark = props.currentStep.mark
    if (props.blockInfo.showEdit) {
      return ['step_lm_check'].includes(mark)
    } else {
      return true
    }
  })

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
  });
  const formRules = ref({
    build_amount: { validator: validateNum, trigger: 'blur' },
    land_amount: { validator: validateNum, trigger: 'blur' },
    initial_build_amount: { validator: validateNum, trigger: 'blur' },
    initial_land_amount: { validator: validateNum, trigger: 'blur' },
  });

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
      if (num % 3 === 0) {
        return 'three';
      } else if (num % 4 === 0) {
        return 'four';
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
    } else if (num === 4) {
      return 'four sta-num';
    } else {
      if (num % 3 === 0) {
        return 'three sta-num';
      } else if (num % 4 === 0) {
        return 'four sta-num';
      } else {
        return 'five sta-num';
      }
    }
  };

  const getFormItems = async () => {
    const creditCate = props.currentStep.credit_cate;

    await ruleCredit({ type: creditCate }).then(async (res) => {
      const data = res || [];
      const writeData = data.filter((item) => item.is_write);

      const perData = writeData.filter((item) => item.is_ratio);
      const dolData = writeData.filter((item) => !item.is_ratio);

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

      showNumItems.value = props.currentStep.credit_cate ? data.filter((item) => !item.is_write && item.type === 1) : data.filter((item) => !item.is_write);
      await updateFormData(res);
    });
  };

  const updateFormData = async (tableData) => {
    await creditInfo({
      apply_uuid: props.currentId,
      type: props.currentStep.credit_cate,
    }).then((res) => {
      if (res.length || Object.keys(res).length) {
        for (const key in formState.value) {
          formState.value[key] = res[key] || '0';
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

    emits('openData', {
      table: tableData,
      data: formState.value
    })
  };

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

        subLoading.value = true;

        const credit__data = cloneDeep(formState.value);
        delete credit__data.initial_build_amount
        delete credit__data.initial_land_amount
        delete credit__data.land_amount

        const params = {
          code: props.blockInfo.code,
          uuid: props.currentId,
          build_amount: formState.value.build_amount || 0,
          land_amount: formState.value.land_amount || 0,
          initial_build_amount: formState.value.initial_build_amount || 0,
          initial_land_amount: formState.value.initial_land_amount || 0,
          credit__data
        };

        if (creditId.value) {
          params.credit__data.id = creditId.value;
        }
        
        await projectAuditSaveMode(params)
          .then(async () => {
            subLoading.value = false;
            emits('refresh');
            
            // 操作记录
            emitter.emit('refreshAuditHisList');

            // 触发预测数据刷新
            emitter.emit('refreshForecastList');

            // 触发奖金刷新
            emitter.emit('refreshBouns')

            updateFormData()
          })
          .catch(() => {
            subLoading.value = false;
          });
      })
      .catch((error) => {
        console.log('error', error);
      });
  };

  watch(
    () => props.lendingInfo,
    (val) => {
      if (val) {
        if (Number(val.land_amount) !== Number(formState.value.land_amount) ||
          Number(val.build_amount) !== Number(formState.value.build_amount) ||
          Number(val.initial_land_amount) !== Number(formState.value.initial_land_amount) ||
          Number(val.initial_build_amount) !== Number(formState.value.initial_build_amount)
        ) {
          updateFormData()
        }
      }
    }
  )

  onMounted(() => {
    getFormItems();
    emitter.on('refreshIRR', () => {
      getFormItems();
    });

    // 重新生成forecast
    emitter.on('resetForecast', () => {
      // 触发预测数据刷新
      emitter.emit('refreshForecastList');
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
    color: #999 !important;
  }
}
</style>
