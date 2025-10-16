<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="drawdownRequestRef" class="drawdown-request">
    <!-- 抵押物选择弹窗 -->
    <securities-dialog v-model:visible="securitiesVisible" :uuid="uuid" :select-data="relatedData" @done="securitiesDone"></securities-dialog>

    <a-modal :width="860" :open="visible" :title="t('还款申请')" :getContainer="() => $refs.drawdownRequestRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
          <a-row :gutter="24">
            <a-col :span="24">
              <a-form-item :label="t('还款标题')" name="name">
                <a-input v-model:value="formState.name" />
              </a-form-item>
            </a-col>
            <a-col :span="12" v-if="projectDetail.product.code === 'vsl'">
              <a-form-item :label="t('放款账户')" name="drawdown_account">
                <a-spin :spinning="drawDownSelectedListLoading">
                  <a-select v-model:value="formState.drawdown_account" mode="multiple" :maxTagCount="1" @change="loadDrawdown">
                    <template v-for="(item, index) in drawDownSelectedList" :key="index">
                      <a-select-option :value="item.id">{{ item.name }}</a-select-option>
                    </template>
                  </a-select>
                </a-spin>
              </a-form-item>
            </a-col>
            <a-col :span="formState.all_repayment === 1 && maxReductionAmount && !isNormalUser ? 8 : 12">
              <a-form-item :label="t('还款日期')" name="apply_date">
                <a-date-picker v-model:value="formState.apply_date" :format="selectDateFormat()" placeholder="" @change="loadDrawdown">
                  <template #suffixIcon>
                    <a-spin v-if="getLoading"></a-spin>
                    <CalendarOutlined v-else />
                  </template>
                </a-date-picker>
              </a-form-item>
            </a-col>
            <template v-if="formState.all_repayment === 1 && maxReductionAmount && !isNormalUser">
              <a-col :span="8">
                <a-form-item class="data-col-item">
                  <template #label>
                    <div class="flex items-center gap-1">
                      <span>{{ t('建议标准税率') }}</span>
                      <span style="color: #31bd65">{{ `(${t('最小值')}: ${standardRate}%)` }}</span>
                    </div>
                  </template>
                  <a-input-number
                    :max="99999999999"
                    :min="Number(standardRate)"
                    v-model:value="standardRateInput"
                    :formatter="(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                    :controls="false"
                    addon-after="%"
                    :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                    @input="standardInputChange"
                    @blur="standardInputBlur"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item :label="t('罚息减免最大额度')">
                  <div class="input-number-content">
                    <vco-number :bold="true" :value="standardAmount" :precision="2" size="fs_xl" :end="true"></vco-number>
                  </div>
                </a-form-item>
              </a-col>
              <a-col :span="7">
                <a-form-item :label="t('还款总额')">
                  <a-input-number v-model:value="formState.apply_amount" disabled :max="99999999999" :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="(value) => value.replace(/\$\s?|(,*)/g, '')" />
                </a-form-item>
              </a-col>
              <a-col :span="1" class="plus-txt"><i class="iconfont">&#xe711;</i></a-col>
              <a-col :span="8">
                <a-form-item name="reduction_money" class="data-col-item">
                  <template #label>
                    <div class="flex items-center gap-1">
                      <span>{{ t('减免额度') }}</span>
                      <span style="color: #31bd65">{{ `(${t('最大值')}: $${numberStrFormat(showMaxReduction)})` }}</span>
                    </div>
                  </template>
                  <a-input-number
                    v-model:value="formState.reduction_money"
                    :max="99999999999"
                    :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                    :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                    @input="amountInput"
                    @blur="amountInput"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="1" class="plus-txt"><i class="iconfont">&#xe609;</i></a-col>
              <a-col :span="6">
                <a-form-item :label="t('还款金额1')">
                  <div class="input-number-content">
                    <vco-number :bold="true" :value="repaymentAmount" :precision="2" color="#31bd65" :end="true"></vco-number>
                  </div>
                </a-form-item>
              </a-col>
            </template>

            <a-col v-if="formState.all_repayment === 1 && formState.apply_date && hasPermission('projects:repayments:adDownload')" :span="24">
              <a-form-item :label="t('对账单')">
                <a-button type="dark" class="uppercase shadow bold" :loading="downloadLoading" @click="downloadStatement">
                  {{ t('下载') }}
                </a-button>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item class="custom-label related">
                <template #label>
                  <span>{{ t('放款') }}</span>
                </template>
                <div class="table-content sys-table-content related-content no-top-line" :class="drawdownListInspection ? 'drawdownListInspection' : ''">
                  <a-spin :spinning="drawdownListLoading" size="large">
                    <a-table rowKey="uuid" :columns="DrawdownColumns" :data-source="drawdownList" :pagination="false" table-layout="fixed">
                      <template #bodyCell="{ column, record, index }">
                        <template v-if="column.dataIndex === 'name'">
                          <p :title="record.name" class="sec-name">{{ record.name }}</p>
                        </template>
                        <template v-if="column.dataIndex === 'amount'">
                          <div class="text-center">
                            <vco-number size="fs_md" :value="record.amount" :precision="2"></vco-number>
                            <vco-number style="opacity: 0.6" size="fs_md" :value="record.interest" :precision="2"></vco-number>
                          </div>
                        </template>
                        <template v-if="column.dataIndex === 'all_repayment'">
                          <a-select v-model:value="record.all_repayment" class="mini">
                            <a-select-option :value="0">{{ t('部分还款') }}</a-select-option>
                            <a-select-option :value="1">{{ t('全额还款') }}</a-select-option>
                          </a-select>
                        </template>
                        <template v-if="column.dataIndex === 're_type'">
                          <a-select v-model:value="record.re_type" class="mini">
                            <a-select-option :value="1">{{ t('本金优先分配') }}</a-select-option>
                            <a-select-option :value="2">{{ t('利息优先分配') }}</a-select-option>
                          </a-select>
                        </template>
                        <template v-if="column.dataIndex === 'amount1'">
                          <a-input-number
                            v-if="record.all_repayment == 1"
                            :disabled="true"
                            v-model:value="record.total_amount"
                            :max="99999999999"
                            :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                            :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                            class="mini"
                          />
                          <a-input-number
                            v-else
                            v-model:value="record.apply_rep_amount"
                            :max="record.total_amount"
                            :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                            :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                            class="mini"
                          />
                        </template>
                      </template>
                    </a-table>
                  </a-spin>
                </div>
              </a-form-item>
              <p style="color: #ff4d4f; position: absolute; bottom: 0px" v-if="drawdownListInspection">{{ t('请完善数据') }}</p>
            </a-col>
            <a-col :span="24">
              <a-form-item name="note" class="custom-label">
                <template #label>
                  <div class="w-full flex justify-between items-center">
                    <span>{{ t('还款说明') }}</span>
                    <a-dropdown trigger="click">
                      <a-button type="brown" shape="round" size="small"> {{ t('快捷选择') }}</a-button>
                      <template #overlay>
                        <a-menu>
                          <a-menu-item v-for="item in notesTypeData" :key="item.code" @click="notesTap(item)">
                            {{ item.name }}
                          </a-menu-item>
                        </a-menu>
                      </template>
                    </a-dropdown>
                  </div>
                </template>
                <a-textarea v-model:value="formState.note" :placeholder="t('请输入')" :rows="2" />
              </a-form-item>
            </a-col>

            <a-col v-if="!isNormalUser" :span="24">
              <a-form-item class="custom-label related">
                <template #label>
                  <div class="w-full flex justify-between items-center">
                    <div class="flex gap-2 items-center">
                      <span>{{ t('关联抵押物') }}</span>
                      <a-switch v-model:checked="showRelatedSwitch" size="small"></a-switch>
                    </div>

                    <a-button v-if="showRelatedSwitch" type="brown" shape="round" size="small" @click="securitiesVisible = true"> {{ t('选择') }}</a-button>
                  </div>
                </template>
                <div v-if="showRelatedSwitch" class="table-content sys-table-content related-content no-top-line">
                  <a-table rowKey="uuid" :columns="relatedColumns" :data-source="relatedData" :pagination="false" table-layout="fixed">
                    <template #bodyCell="{ column, record, index }">
                      <template v-if="column.dataIndex === 'security_name'">
                        <p :title="record.security_name" class="sec-name">{{ record.security_name }}</p>
                      </template>
                      <template v-if="column.dataIndex === 'amount'">
                        <vco-number size="fs_md" :value="record.amount" :precision="2"></vco-number>
                      </template>
                      <template v-if="column.dataIndex === 'real_amount'">
                        <a-input-number v-model:value="record.real_amount" :max="99999999999" :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="(value) => value.replace(/\$\s?|(,*)/g, '')" class="mini" />
                      </template>
                      <template v-if="column.dataIndex === 'operation'">
                        <a-popconfirm v-if="dataInfo?.id && itemInData(record.uuid)" :title="t('确定删除吗？')" @confirm="removeItems(index, record)">
                          <i class="iconfont remove-icon">&#xe8c1;</i>
                        </a-popconfirm>

                        <i v-else class="iconfont remove-icon" @click="removeItems(index)">&#xe8c1;</i>
                      </template>
                    </template>
                  </a-table>
                </div>
              </a-form-item>
            </a-col>
            <a-col v-if="uploadVisible" :span="24">
              <documents-upload v-model:value="document">
                <div class="upload-title">{{ t('文件') }}</div>
              </documents-upload>
            </a-col>
          </a-row>
        </a-form>

        <div class="flex justify-center mt-5">
          <a-button @click="save" type="dark" class="save big uppercase shadow bold" :loading="loading">
            {{ t('提交') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref, computed, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { loanRDedit, projectLoanAllRepayment, loanDelSecurity } from '@/api/project/loan';
import { systemDictData } from '@/api/system';
import { CalendarOutlined } from '@ant-design/icons-vue';
import DocumentsUpload from '../../../discharge/components/form/DocumentsUpload.vue';
import dayjs from 'dayjs';
import { useUserStore } from '@/store';
import tool, { selectDateFormat, removeDuplicates, numberStrFormat } from '@/utils/tool';
import SecuritiesDialog from './SecuritiesDialog.vue';
import { cloneDeep, debounce } from 'lodash';
import { hasPermission } from '@/directives/permission/index';
import { drawDownSelected, drawDownLists, repaymentDetail } from '@/api/project/loan';

const { t } = useI18n();
const emits = defineEmits(['change']);
const userStore = useUserStore();
const isNormalUser = computed(() => userStore.isNormalUser);

const props = defineProps({
  uuid: {
    type: String
  },
  projectDetail: {
    type: Object,
    default: () => {}
  },
  count: {
    type: Number,
    default: 0
  },
  dataInfo: {
    type: Object,
    default: () => {}
  }
});

const showRelatedSwitch = ref(true);

const visible = ref(false);
const loading = ref(false);
const uploadVisible = ref(false);

const formState = ref({
  name: '',
  apply_amount: '',
  apply_date: '',
  note: '',
  reduction_money: '',
  drawdown_account: []
});

const maxReductionAmount = ref(0);
const showMaxReduction = computed(() => {
  return Number(maxReductionAmount.value) > 0 ? Number(maxReductionAmount.value) : 0;
});

const document = ref([]);

const formRef = ref();

const repaymentAmount = computed(() => {
  let reduceNum = 0;
  if (formState.value.reduction_money < 0) {
    reduceNum = 0;
  } else {
    reduceNum = formState.value.reduction_money > showMaxReduction.value ? showMaxReduction.value : formState.value.reduction_money;
  }

  const res = tool.minus(formState.value.apply_amount, reduceNum);
  return res;
});

const amountInput = () => {
  if (formState.value.reduction_money < 0) {
    formState.value.reduction_money = 0;
  } else {
    formState.value.reduction_money = formState.value.reduction_money > showMaxReduction.value ? showMaxReduction.value : formState.value.reduction_money;
  }
};

const getValidateInfo = () => {
  return (rule, value) => {
    if (!value) {
      return Promise.reject(t('请输入') + t('还款金额1'));
    } else {
      const num = Number(value);
      if (isNaN(num)) {
        return Promise.reject(t('请输入数字'));
      } else {
        if (num < 0 || num === 0) {
          return Promise.reject(t('请输入大于0的数字'));
        }

        return Promise.resolve();
      }
    }
  };
};

const validateRed = () => {
  return (rule, value) => {
    if (!value) {
      return Promise.resolve();
    } else {
      const num = Number(value);
      if (isNaN(num)) {
        return Promise.reject(t('请输入数字'));
      } else {
        if (num < 0) {
          return Promise.reject(t('请输入大于0的数字'));
        }

        if (num > maxReductionAmount.value) {
          return Promise.reject(t('最大值为：{0}', [`$${numberStrFormat(maxReductionAmount.value)}`]));
        }

        return Promise.resolve();
      }
    }
  };
};

const formRules = ref({
  name: [{ required: true, message: t('请输入') + t('还款标题'), trigger: 'blur' }],
  all_repayment: [{ required: true, message: t('请选择') + t('还款方式'), trigger: 'change' }],
  drawdown_account: [{ required: true, message: t('请选择') + t('放款账户'), trigger: 'change' }],
  re_type: [{ required: true, message: t('请选择') + t('还款分配'), trigger: 'change' }],
  apply_date: [{ required: true, message: t('请选择') + t('还款日期'), trigger: 'change' }],
  apply_amount: [{ required: true, validator: getValidateInfo(), trigger: 'blur' }],
  reduction_money: [{ validator: validateRed(), trigger: 'blur' }],
  note: [{ required: true, message: t('请输入') + t('还款说明'), trigger: 'blur' }]
});

const updateVisible = (value) => {
  visible.value = value;
  uploadVisible.value = false;
  drawdownListInspection.value = false;

  if (!value) {
    formRef.value.clearValidate();
    formRef.value.resetFields();
    Object.keys(formState.value).forEach((key) => {
      formState.value[key] = ''; // 清空每个字段
    });
    formState.value.drawdown_account = [];
    relatedData.value = [];
    showRelatedSwitch.value = false;
    document.value = [];
    drawdownList.value = [];
  }
};

const save = () => {
  formRef.value
    .validate()
    .then(() => {
      submit();
    })
    .catch((error) => {
      console.log('error', error);
    });
};

const submit = () => {
  const params = {
    ...formState.value,
    apply_date: dayjs(formState.value.apply_date).format('YYYY-MM-DD'),
    uuid: props.uuid,
    document: document.value,
    security: []
  };

  if (params.all_repayment) {
    params.reduction_rate = standardRateInput.value;
    params.reduction_rate_old = standardRate.value;
    params.reduction_money_old = showMaxReduction.value;
  } else {
    delete params.reduction_money;
  }

  if (relatedData.value.length) {
    const security = relatedData.value.map((item) => {
      return {
        uuid: item.uuid,
        real_amount: item.real_amount
      };
    });
    params.security = security;
  }

  if (props.dataInfo?.id) {
    params.id = props.dataInfo?.id;
  }

  params.repayment = drawdownList.value.map((item) => {
    return {
      id: item.id,
      re_type: item.re_type,
      all_repayment: item.all_repayment,
      amount: item.all_repayment == 1 ? item.total_amount : item.apply_rep_amount
    };
  });
  const validateRepayment = () => {
    return params.repayment.every((item) => {
      return item.re_type !== undefined && item.all_repayment !== undefined && item.amount !== undefined && item.amount > 0;
    });
  };
  if (!validateRepayment()) {
    drawdownListInspection.value = true;
    return;
  }
  params.apply_amount = params.repayment.reduce((sum, item) => {
    return tool.plus(sum, item.amount || 0); // 使用 || 0 防止 NaN
  }, 0);
  loading.value = true;

  loanRDedit(params)
    .then(() => {
      loading.value = false;
      updateVisible(false);
      emits('change');
    })
    .catch(() => {
      loading.value = false;
    });
};

const getLoading = ref(false);

const hasSetStandard = ref(false);
const standardRate = ref(0);
const standardRateInput = ref(0);
const standardAmount = ref(0);

// 防抖处理
const standardInputChange = debounce((value) => {
  const num = Number(value);
  if (num > Number(standardRate.value)) {
    calAmount(num);
  }
}, 300);

const standardInputBlur = () => {
  const num = Number(standardRateInput.value) || 0;
  if (num < Number(standardRate.value) || num === Number(standardRate.value)) {
    standardRateInput.value = Number(standardRate.value);
    setTimeout(() => {
      calAmount(standardRateInput.value);
    }, 200);
  }
};

const calAmount = (rate, flag = false) => {
  getLoading.value = true;

  if (!rate || isNaN(Number(rate))) {
    hasSetStandard.value = false;
  }

  const time = dayjs(formState.value.apply_date).format('YYYY-MM-DD');
  const params = {
    uuid: props.uuid,
    date: time
  };

  if (rate && !isNaN(Number(rate))) {
    params.StandardRate = Number(rate);
  }

  projectLoanAllRepayment(params)
    .then((res) => {
      formState.value.apply_amount = Number(res.last_money) ? Number(res.last_money) : 0;
      maxReductionAmount.value = Number(res.reduction_money) ? Number(res.reduction_money) : 0;

      if (!hasSetStandard.value) {
        standardRate.value = res.min_StandardRate;
        if (!flag) {
          standardRateInput.value = res.StandardRate;
          standardAmount.value = res.reduction_money;
        }

        hasSetStandard.value = true;
      }

      if (!flag) {
        formState.value.reduction_money = 0;
      }
      getLoading.value = false;
    })
    .catch(() => {
      getLoading.value = false;
    });
};

const securitiesVisible = ref(false);

const relatedColumns = reactive([
  { title: t('名称'), dataIndex: 'security_name', width: 140 },
  { title: t('产权编号'), dataIndex: 'card_no', width: 100 },
  { title: t('类型'), dataIndex: 'type_name', width: 90 },
  { title: t('抵押物价值'), dataIndex: 'amount', width: 150 },
  { title: t('当前抵押物价值'), dataIndex: 'real_amount', width: 170 },
  { title: t('操作1'), dataIndex: 'operation', fixed: 'right', align: 'center', width: 50 }
]);

const DrawdownColumns = reactive([
  { title: t('名称'), dataIndex: 'name', width: 140 },
  { title: t('本金/利息'), dataIndex: 'amount' },
  { title: t('还款方式'), dataIndex: 'all_repayment', width: 140 },
  { title: t('还款分配'), dataIndex: 're_type', width: 140 },
  { title: t('还款金额1'), dataIndex: 'amount1' }
]);

const relatedData = ref([]);

const securitiesDone = (data) => {
  const arr = cloneDeep(data);
  const uuidArr = arr.map((item) => item.uuid);

  const selected = Array.from(new Set([...relatedData.value, ...arr]));
  const selData = removeDuplicates(selected, 'uuid').filter((item) => uuidArr.includes(item.uuid));
  selData.forEach((item) => {
    item.real_amount = Number(item.real_amount) ? item.real_amount : item.amount;
  });

  relatedData.value = selData;
};

const removeItems = async (index, data) => {
  if (props.dataInfo?.id && data) {
    const params = {
      uuid: props.uuid,
      ids: [data.uuid]
    };

    await loanDelSecurity(params)
      .then(() => {
        relatedData.value.splice(index, 1);
        const _index = relatedStaticData.value.findIndex((item) => item.uuid === data.uuid);
        if (_index > -1) {
          relatedStaticData.value.splice(_index, 1);
        }
        return true;
      })
      .catch(() => {
        return false;
      });
  } else {
    relatedData.value.splice(index, 1);
  }
};

const itemInData = (uuid) => {
  const obj = relatedStaticData.value.find((item) => item.uuid === uuid);
  return obj ? true : false;
};

const setDefaultTitle = () => {
  const project_apply_sn = props.projectDetail?.base?.project_apply_sn || 'Repayment';
  const count = props.count;
  const title = `${project_apply_sn}-${count + 1}-${dayjs().format('YYYYMMDD')}`;
  formState.value.name = title;
};

const notesTypeData = ref([]);
const getNotesType = () => {
  systemDictData('repayment_notes_type').then((res) => {
    notesTypeData.value = res || [];
  });
};

const notesTap = (data) => {
  formState.value.note = data.name;
};

const relatedStaticData = ref([]);

const setFormData = (dataDetail) => {
  const data = cloneDeep(dataDetail);
  for (const key in formState.value) {
    if (key === 'apply_date') {
      formState.value[key] = dayjs(data[key]);
    } else {
      formState.value[key] = data[key];
    }
  }

  if (data.security && data.security.length) {
    showRelatedSwitch.value = true;
    relatedData.value = cloneDeep(data.security);
    relatedStaticData.value = cloneDeep(data.security);
  } else {
    showRelatedSwitch.value = false;
  }

  if (data.document && data.document.length) {
    document.value = data.document;
  }

  if (data.all_repayment) {
    const time = dayjs(formState.value.apply_date).format('YYYY-MM-DD');
    const params = {
      uuid: props.uuid,
      date: time
    };
    projectLoanAllRepayment(params).then((res) => {
      standardAmount.value = res.reduction_money;
    });

    standardRateInput.value = data.reduction_rate || 0;
    calAmount(data.reduction_rate, Boolean(standardRateInput.value));
  }

  formState.value.drawdown_account = data.drawDown.map((item) => {
    return item.id;
  });

  drawdownList.value = data.drawDown;

  uploadVisible.value = true;
};

const downloadLoading = ref(false);
const downloadStatement = () => {
  downloadLoading.value = true;
  projectLoanAllRepayment({
    uuid: props.uuid,
    date: dayjs(formState.value.apply_date).format('YYYY-MM-DD'),
    pdf: 1,
    less: formState.value.reduction_money || 0
  })
    .then((res) => {
      downloadLoading.value = false;
      window.open(res);
    })
    .catch(() => {
      downloadLoading.value = false;
    });
};

// 加载默认可以选择的放款
const drawDownSelectedList = ref([]);
const drawDownSelectedListLoading = ref(false);
const loadDrawDownSelected = () => {
  drawDownSelectedListLoading.value = true;
  drawDownSelected({ uuid: props.uuid })
    .then((res) => {
      drawDownSelectedList.value = res;
    })
    .finally(() => {
      drawDownSelectedListLoading.value = false;
    });
};

// 加载可以选择的放款
const drawdownList = ref([]);
const drawdownListLoading = ref(false);
const drawdownListInspection = ref(false);

const loadDrawdown = () => {
  if (formState.value.apply_date && formState.value.drawdown_account && formState.value.drawdown_account.length) {
    drawdownListLoading.value = true;
    drawDownLists({ uuid: props.uuid, date: formState.value.apply_date, ids: formState.value.drawdown_account.join() })
      .then((res) => {
        drawdownList.value = res.drawDown;
      })
      .finally(() => {
        drawdownListLoading.value = false;
      });
  }
};

watch(
  () => drawdownList.value,
  (val) => {
    if (drawdownListInspection.value) {
      const params_repayment = drawdownList.value.map((item) => {
        return {
          id: item.id,
          re_type: item.re_type,
          all_repayment: item.all_repayment,
          amount: item.all_repayment == 1 ? item.total_amount : item.apply_rep_amount
        };
      });
      const validateRepayment = () => {
        return params_repayment.every((item) => {
          return item.re_type !== undefined && item.all_repayment !== undefined && item.amount !== undefined && item.amount > 0;
        });
      };
      if (!validateRepayment()) {
        drawdownListInspection.value = true;
        return;
      }
      drawdownListInspection.value = false;
    }
  },
  { deep: true }
);

const init = () => {
  visible.value = true;
  if (!props.dataInfo?.id) {
    setDefaultTitle();
    uploadVisible.value = true;
  } else {
    repaymentDetail({ uuid: props.uuid, id: props.dataInfo?.id }).then((res) => {
      setFormData(res);
    });
  }
  getNotesType();
  loadDrawDownSelected();
};

defineExpose({
  init
});
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.drawdown-request {
  :deep(.ant-modal-content) {
    .ant-modal-header {
      padding: 40px 40px 24px;
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

  :deep(.custom-label) {
    .ant-form-item-label {
      label {
        width: 100%;
      }
    }
    &.related {
      margin-bottom: 0 !important;
      .ant-form-item-control-input {
        min-height: 0 !important;
      }
    }
  }

  .related-content {
    padding: 10px;
    border: 1px solid #272727 !important;
    border-radius: 10px !important;
    margin-bottom: 24px;
    :deep(.ant-empty) {
      min-height: 50px !important;
      margin: 0 !important;
    }
    :deep(.remove-icon) {
      cursor: pointer;
      color: #ea3535 !important;
      &:hover {
        color: #f24f4f !important;
      }
    }
    &.drawdownListInspection {
      border-color: #ff7875 !important;
    }
  }
}

.sec-name {
  white-space: nowrap; /* 禁止换行 */
  overflow: hidden; /* 隐藏溢出内容 */
  text-overflow: ellipsis; /* 使用省略号表示溢出内容 */
}

.input-number-content {
  height: 50px;
  display: flex;
  align-items: center;
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
</style>
