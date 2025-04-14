<template>
  <div
    class="block-item mb"
    :class="{ checked: bonusInfo.is_check && blockInfo.showCheck }"
  >
    <vco-process-title :title="t('奖金信息')">
      <div class="flex gap-5 items-center">
        <a-button
          v-if="blockInfo.showEdit"
          type="primary"
          shape="round"
          :loading="subLoading"
          class="uppercase"
          @click="saveHandle(false)"
        >
          {{ t('保存') }}
        </a-button>
        <a-popconfirm
          v-if="blockInfo.showCheck && !bonusInfo.is_check && bonusInfo.set_bonus"
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
        <div class="target-content" @click="bonusTarget = !bonusTarget">
          <div class="icon" :title="bonusTarget ? t('收起') : t('展开')">
            <i v-if="bonusTarget" class="iconfont">&#xe711;</i>
            <i v-else class="iconfont">&#xe712;</i>
          </div>
        </div>
      </div>
    </vco-process-title>
    <div v-show="bonusTarget" class="sys-form-content mt-5">
      <a-form
        ref="formRef"
        layout="vertical"
        :model="formState"
        :rules="formRules"
      >
        <a-row :gutter="24">
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
                  :disabled="!blockInfo.showEdit"
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
                  :disabled="!blockInfo.showEdit"
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
  import { ref, onMounted, onUnmounted } from 'vue';
  import { QuestionCircleOutlined } from '@ant-design/icons-vue'
  import { useI18n } from 'vue-i18n';
  import { cloneDeep } from 'lodash';
  import {
    ruleCredit,
    creditInfo,
    projectAuditSaveMode,
    projectAuditCheckMode
  } from '@/api/process';
  import emitter from '@/event';
  
  const emits = defineEmits(['done', 'refresh']);

  const { t } = useI18n();

  const props = defineProps({
    bonusInfo: {
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
  const formState = ref({});
  const formRules = ref({});

  const percentItems = ref([]);
  const dollarItems = ref([]);
  const showNumItems = ref([]);
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

  const getFormItems = async () => {
    await ruleCredit({ type: 2, uuid: props.currentId }).then(async (res) => {
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

      showNumItems.value = data.filter((item) => !item.is_write)
      await updateFormData();
    });
  };

  const updateFormData = async () => {
    await creditInfo({
      apply_uuid: props.currentId,
      type: 2,
    }).then((res) => {
      if (res.length || Object.keys(res).length) {
        for (const key in formState.value) {
          if (key === 'credit_BonusRate') {
            if (props.bonusInfo.set_bonus) {
              formState.value[key] = res[key] || '0';
            }
          } else {
            formState.value[key] = res[key] || '0';
          }
        }
        for (let i = 0; i < showNumItems.value.length; i++) {
          showNumItems.value[i].value = res[showNumItems.value[i].credit_table];
        }
        creditId.value = res.id || null;
      }
    });
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
  const saveHandle = async (flag = false) => {
    formRef.value
      .validate()
      .then(async () => {
        subLoading.value = true;
        const credit__data = cloneDeep(formState.value);

        const params = {
          code: props.blockInfo.code,
          uuid: props.currentId,
          credit__data
        };

        if (creditId.value) {
          params.credit__data.id = creditId.value;
        }
        
        await projectAuditSaveMode(params)
          .then(async () => {
            subLoading.value = false;

            if (!flag) {
              emits('refresh');
            }
            
            // 操作记录
            emitter.emit('refreshAuditHisList');
            await updateFormData();
          })
          .catch(() => {
            subLoading.value = false;
          });
      })
      .catch((error) => {
        console.log('error', error);
      });
  };

  const handleRefreshIRR1 = () => {
    saveHandle(true);
  }

  const handleRefreshBouns = () => {
    getFormItems();
  }

  const bonusTarget = ref(true)

  const blockShowTargetHandle = (flag) => {
    bonusTarget.value = flag
  }

  onMounted(() => {
    getFormItems();
    emitter.on('refreshIRR1', handleRefreshIRR1);
    emitter.on('refreshBouns', handleRefreshBouns);
    emitter.on('blockShowTarget', blockShowTargetHandle)
  });

  onUnmounted(() => {
    emitter.off('refreshIRR1', handleRefreshIRR1);
    emitter.off('refreshBouns', handleRefreshBouns);
    emitter.off('blockShowTarget', blockShowTargetHandle)
  })
</script>

<style lang="less" scoped>
@import '@/views/process/temp/default/styles/common.less';
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
