<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal
      :width="900"
      :open="visible"
      :title="dialogTitle"
      :getContainer="() => $refs.JournalRef"
      :maskClosable="false"
      :footer="false"
      getContainer="body"
      @cancel="updateVisible(false)"
    >
      <div class="content sys-form-content">
        <a-form
          ref="formRef"
          layout="vertical"
          :model="formState"
          :rules="formRules"
        >
          <a-row :gutter="24">
            <a-col v-if="detailData?.id && detailData?.cancel_reason" :span="24" class="mt-5">
              <a-alert
                :message="t('退回原因')"
                :description="detailData?.cancel_reason"
                type="error"
                class="cancel-reason"
              />
            </a-col>

            <a-col :span="16">
              <a-form-item :label="t('变更类型')" name="type">
                <a-select
                  v-model:value="formState.type"
                  :options="typeData"
                  @change="createFormItems"
                ></a-select>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item :label="t('变更开始日期')" name="start_date">
                <a-date-picker
                  inputReadOnly
                  v-model:value="formState.start_date"
                  :format="selectDateFormat()"
                  valueFormat="YYYY-MM-DD"
                  :disabledDate="disabledDate"
                  :showToday="false"
                  @change="dateChange('start_date')"
                />
              </a-form-item>
            </a-col>

            <template v-if="[1,2,4,5].includes(Number(formState.type))">
              <a-col :span="7">
                <a-form-item :label="t('借款总金额')">
                  <a-input-number
                    :value="projectDetail?.base?.loan_money"
                    :disabled="true"
                    :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                    :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="2" class="icon-txt">
                <i class="iconfont" v-if="[1,4].includes(Number(formState.type))">&#xe712;</i>
                <i class="iconfont" v-else>&#xe711;</i>
              </a-col>
              <a-col :span="7">
                <a-form-item :label="t('变更金额')" name="amount">
                  <a-input-number
                    v-model:value="formState.amount"
                    :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                    :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="1" class="icon-txt">
                <i class="iconfont">=</i>
              </a-col>
              <a-col :span="7">
                <a-form-item :label="t('变更后借款总金额')">
                  <div class="total-number">
                    <vco-number :value="newTotalAmount" :precision="2" :end="true"></vco-number>
                  </div>
                </a-form-item>
              </a-col>
            </template>
            <a-col v-if="[3].includes(Number(formState.type))" :span="8">
              <a-form-item :label="t('借款总金额')">
                <a-input-number
                  :value="projectDetail?.base?.loan_money"
                  :disabled="true"
                  :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                />
              </a-form-item>
            </a-col>
            <a-col v-if="[1,2,3].includes(Number(formState.type))" :span="8">
              <a-form-item :label="t('变更后结束日期')" name="end_date">
                <a-date-picker
                  inputReadOnly
                  v-model:value="formState.end_date"
                  :format="selectDateFormat()"
                  valueFormat="YYYY-MM-DD"
                  :showToday="false"
                  :defaultPickerValue="endDefaultPickerValue"
                  :disabledDate="endDisabledDate"
                  @change="dateChange('end_date')"
                />
              </a-form-item>
            </a-col>
            <a-col v-if="formState.type" :span="[1,2,3].includes(Number(formState.type)) ? 8 : 16">
              <a-form-item :label="t('变更后首次放款')" name="initial_amount">
                <a-input-number
                  v-model:value="formState.initial_amount"
                  :max="99999999999"
                  :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                />
              </a-form-item>
            </a-col>

            <div v-if="percentItems.length || dollarItems.length" class="w-full flex flex-wrap">
              <a-col :span="24"><div class="pt-5" style="border-top: 1px dashed #282828;"></div></a-col>
              <template v-if="percentItems.length">
                <a-col
                  v-for="item in percentItems"
                  :span="getItemsSpan"
                  :key="item.credit_table"
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
                      :suffix="item.credit_unit"
                    />
                  </a-form-item>
                </a-col>
              </template>

              <template v-if="dollarItems.length">
                <a-col
                  v-for="item in dollarItems"
                  :span="getItemsSpan"
                  :key="item.credit_table"
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
                      :formatter="
                        (value) =>
                          `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      "
                      :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                    />
                  </a-form-item>
                </a-col>
              </template>
            </div>

            <a-col :span="24">
              <a-form-item :label="t('说明')" name="note">
                <a-textarea v-model:value="formState.note" :rows="3" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>

        <div class="flex justify-center">
          <a-button @click="save" type="dark" class="save big uppercase" :loading="loading">
            {{ t('确认') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import { systemDictData } from "@/api/system"
import { projectCreditVariation, projectVariationEdit } from '@/api/project/loan';
import { ruleCredit } from '@/api/process';
import { selectDateFormat } from "@/utils/tool"
import dayjs from 'dayjs'
import tool from '@/utils/tool';
import { cloneDeep } from "lodash"

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  currentId: {
    type: String,
    default: ''
  },
  projectDetail: {
    type: Object,
    default: () => {}
  },
  detailData: {
    type: Object,
    default: () => {}
  }
});

const dialogTitle = computed(() => {
  let txt = '添加变更'
  if (props.detailData?.id) {
    txt = '编辑变更'
  }

  return t(txt)
})

const newTotalAmount = computed(() => {
  const total = Number(props.projectDetail.base.loan_money)
  const num = Number(formState.value.amount)
  const isPlus = [1, 4].includes(Number(formState.value.type))

  let res = 0
  if (isPlus) {
    res = tool.plus(total, num)
  } else {
    res = tool.minus(total, num)
  }

  return res
})

const endDefaultPickerValue = computed(() => {
  return dayjs(props.projectDetail.date.end_date).add(1, 'day')
})

const disabledDate = (current) => {
  return (current && current.isBefore(dayjs().startOf('day'))) || current.isAfter(dayjs(props.projectDetail.date.end_date).startOf('day'));
};

const endDisabledDate = (current) => {
  return current && current.isBefore(dayjs(props.projectDetail.date.end_date).add(1, 'day').startOf('day'));
};

const formRef = ref();
const visible = ref(false);
const loading = ref(false);

const formState = ref({
  type: '',
  amount: '',
  start_date: '',
  end_date: '',
  initial_amount: '',
  note: ''
});

const formRules = ref({
  type: [{ required: true, message: t('请选择') + t('变更类型'), trigger: 'change' }],
  amount: [{ required: true, message: t('请输入') + t('总金额'), trigger: 'change' }],
  start_date: [{ required: true, message: t('请选择') + t('变更开始日期'), trigger: 'change' }],
  end_date: [{ required: true, message: t('请选择') + t('变更结束日期'), trigger: 'change' }],
  initial_amount: [{ required: true, message: t('请输入') + t('首次放款总金额'), trigger: 'change' }]
});

const updateVisible = (value) => {
  visible.value = value;

  if (!value) {
    formRef.value.clearValidate();
    formRef.value.resetFields();
    Object.keys(formState.value).forEach((key) => {
      formState.value[key] = ''; // 清空每个字段
    });
  }
};

const save = () => {
  formRef.value
    .validate()
    .then(() => {
      const params = {
        uuid: props.currentId,
        ...cloneDeep(formState.value)
      }
      const credit = {}

      for (const key in params) {
        if (creditItemsData.value.includes(key)) {
          credit[key] = params[key]
          delete params[key]
        }
      }
      params.credit = credit

      if (props.detailData?.id) {
        params.id = props.detailData.id
      }
      loading.value = true

      projectVariationEdit(params).then((res) => {
        emits('update', res)
        loading.value = false
        message.success(t('提交成功'))
        updateVisible(false)
      }).catch(() => {
        loading.value = false
      })
    })
    .catch((error) => {
      console.log('error', error);
    });
};

const dateChange = (type) => {
  const start_date = formState.value.start_date
  const end_date = formState.value.end_date
  if (start_date && end_date) {
    const date1 = dayjs(start_date);
    const date2 = dayjs(end_date);

    if (date1.isAfter(date2)) {
      message.error(t('{0}应在{1}之前', [t('变更开始日期'), t('变更结束日期')]))
      formState.value[type] = ''
    }
  }
}

const getItemsSpan = computed(() => {
  const num = creditItemsData.value.length
  if (num === 1) {
    return 24;
  } else if (num === 2) {
    return 12;
  } else if (num === 3) {
    return 8;
  } else if (num === 4 || num === 7) {
    return 6;
  } else {
    if (num % 4 === 0) {
      return 6;
    } else if (num % 3 === 0) {
      return 8;
    } else {
      return 8;
    }
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

const dataRefull = (flag) => {
  const data = props.detailData
  const { credit } = data
  for (const key in credit) {
    formState.value[key] = credit[key]
  }
  
  formState.value.amount = data.amount
  formState.value.start_date = data.start_date || ''
  formState.value.end_date = data.end_date || ''
  formState.value.initial_amount = data.initial_amount
  formState.value.note = data.note

  if (!flag) {
    formState.value.type = data.type
  } else {
    formState.value.amount = 0
  }
}

const creditData = ref([])
const creditItemsData = ref([])
const percentItems = ref([])
const dollarItems = ref([])

const creditVariationinfo = ref({})

const createFormItems = (flag) => {
  const creditInfo = cloneDeep(creditVariationinfo.value)

  if (formState.value.type === 5) {
    delete creditInfo.credit_estabFeeRate
    delete creditInfo.credit_LineFeeRate
  }
  
  const keyArr = []
  for (const key in creditInfo) {
    formState.value[key] = creditInfo[key]
    keyArr.push(key)
  }

  const colItems = creditData.value.filter(item => keyArr.includes(item.credit_table))
  const rulesData = {}

  for (let i = 0; i < colItems.length; i++) {
    rulesData[colItems[i].credit_table] = [
      { validator: getValidateInfo(colItems[i]), trigger: 'blur' },
    ];
    if (colItems[i].is_req) {
      rulesData[colItems[i].credit_table].push(
        {
          required: true,
          message: t('请输入') + colItems[i].credit_name,
          trigger: 'blur',
        }
      );
    }
  }

  creditItemsData.value = colItems.map(item => item.credit_table)

  const perData = colItems.filter((item) => item.is_ratio);
  const dolData = colItems.filter((item) => !item.is_ratio);
  percentItems.value = perData;
  dollarItems.value = dolData;

  formRules.value = { ...formRules.value, ...rulesData };

  if (props.detailData?.id) {
    dataRefull(Boolean(flag))
  }
}

const getCreditVal = () => {
  projectCreditVariation({
    apply_uuid: props.currentId
  }).then(res => {
    creditVariationinfo.value = res

    createFormItems()
  })
}

const getCreditInfo = () => {
  ruleCredit().then(res => {
    creditData.value = res || []
    getCreditVal()
  })
}

const typeData = ref([])

const init = () => {
  getCreditInfo()

  systemDictData('variation_type').then(res => {
    const data = res.map(item => {
      return {
        label: item.name,
        value: Number(item.code)
      }
    })
    typeData.value = data
  })

  visible.value = true;
};

defineExpose({
  init
})
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.Journal {
  :deep(.ant-modal-content) {
    .ant-modal-header {
      padding: 72px 84px 0px;
      border-radius: 24px;
      .ant-modal-title {
        font-size: 20px;
        font-weight: 500;
      }
    }
    padding: 0px !important;

    .content {
      line-height: 1.33;
      padding: 24px 84px 72px;
      .label {
        color: #888;
        font-size: 12px;
        padding: 0 0 8px;
        &.err {
          color: #c1430c;
        }
      }

      .save {
        margin-top: 24px;
      }
    }
  }

  .input-item {
    margin-top: 20px;
  }
}

.icon-txt {
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

.total-number {
  height: 48px;
  display: flex;
  align-items: center;
}

.cancel-reason {
  padding: 10px !important;
  margin-bottom: 10px;
  :deep(.ant-alert-description) {
    font-size: 12px !important;
  }
}
</style>
