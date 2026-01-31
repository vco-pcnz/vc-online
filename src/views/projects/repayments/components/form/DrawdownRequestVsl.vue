<template>

  <div class="inline" @click="init">
    <slot>
      <a-button type="brown" shape="round" size="small" :loading="repayApplyStatusLoading">{{ t('创建还款') }}</a-button>
    </slot>
  </div>
  <div @click.stop ref="drawdownRequestRef" class="drawdown-request">
    <!-- 抵押物选择弹窗 -->
    <securities-dialog v-model:visible="securitiesVisible" :uuid="uuid" :select-data="relatedData"
                       @done="securitiesDone"></securities-dialog>
    <!-- 提示弹窗 -->
    <vco-confirm-alert v-model:visible="visibleTip" :showClose="true" :confirmTxt="confirmTxt"></vco-confirm-alert>

    <a-modal :width="1100" :open="visible" :title="t('还款申请')" :getContainer="() => $refs.drawdownRequestRef"
             :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
          <a-row :gutter="24">
            <a-col :span="24">
              <a-form-item :label="t('还款标题')" name="name">
                <a-input v-model:value="formState.name" />
              </a-form-item>
            </a-col>

            <a-col :span="12">
              <a-form-item :label="t('还款日期')" name="apply_date">
                <a-date-picker v-model:value="formState.apply_date" :format="selectDateFormat()"
                               valueFormat="YYYY-MM-DD" placeholder="" @change="loadDrawDownSelected">
                  <template #suffixIcon>
                    <a-spin v-if="getLoading"></a-spin>
                    <CalendarOutlined v-else />
                  </template>
                </a-date-picker>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :label="t('还款金额1')" name="apply_amount">
                <a-input-number v-model:value="formState.apply_amount" readonly :min="0" :max="99999999999" :formatter="(value) =>
                  `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  " :parser="(value) => value.replace(/\$\s?|(,*)/g, '')" />
              </a-form-item>
            </a-col>
            <a-col :span="12" v-if="lender === 'VS'">
              <a-form-item :label="t('还款方式')" name="all_repayment">
                <a-select v-model:value="formState.all_repayment" @change="initVsDrawdownList">
                  <a-select-option :value="0">
                    {{ t('部分还款') }}
                  </a-select-option>
                  <a-select-option :value="1">
                    {{ t('全额还款') }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :span="24">
              <a-form-item class="custom-label">
                <template #label>
                  <span>{{ t('还款分配1') }}</span>
                </template>
                <a-button style="position: absolute; top: -32px; right: 0"
                          v-if="drawdownList.length < drawDownSelectedList.length" type="brown" shape="round"
                          size="small" @click.stop="addDrawdownColumnsItem()">
                  {{ t('添加') }}
                </a-button>

                <div class="table-content sys-table-content related-content no-top-line Repayment_allocation" :class="drawdownListInspection ? 'drawdownListInspection' : ''
                  ">
                  <a-spin :spinning="drawdownListLoading || drawDownSelectedListLoading
                    " size="large">
                    <a-table rowKey="uuid" :columns="DrawdownColumns" :data-source="drawdownList" :pagination="false"
                             table-layout="fixed" :scroll="{ y: 300 }">
                      <template #bodyCell="{ column, record, index }">
                        <template v-if="column.dataIndex === 'name'">
                          <a-select v-model:value="record.sn" :maxTagCount="1" class="mini"
                                    @change="loadDrawdown($event, index)" :disabled="isVsAll_repayment"
                                    :title="getDrawdownName(record.sn)">
                            <template v-for="(item, index) in drawDownSelectedList" :key="index">
                              <a-select-option :value="item.sn" :disabled="disabledIds.includes(item.sn)"
                                               :title="item.name">
                                {{ item.name }}
                              </a-select-option>
                            </template>
                          </a-select>
                        </template>
                        <template v-if="column.dataIndex === 'amount'">
                          <div class="text-center">
                            <vco-number size="fs_md" :value="record.amount" :precision="2"></vco-number>
                            <div class="flex justify-center items-center gap-1">
                              <vco-number style="opacity: 0.6" size="fs_md" :value="record.total_interest"
                                          :precision="2"></vco-number>
                              <i class="iconfont edit-icon" v-if="!record.interest_status && record.sn"
                                 @click="record.interest_status = 1">
                                &#xe743;
                              </i>
                            </div>
                          </div>
                        </template>
                        <template v-if="column.dataIndex === 'reality_interest'">
                          <div class="flex justify-center items-center gap-1"
                               v-if="record.interest_status == 1 && record.sn">
                            <a-input-number v-model:value="record.reality_interest" :min="0" :max="99999999999"
                                            :formatter="(value) =>
                                              `$ ${value}`.replace(
                                                /\B(?=(\d{3})+(?!\d))/g,
                                                ','
                                              )
                                              " :parser="(value) => value.replace(/\$\s?|(,*)/g, '')
                                                " class="mini" />
                            <i class="iconfont icon-delete" @click="record.interest_status = 0">
                              &#xe781;
                            </i>
                          </div>
                          <div v-else></div>
                        </template>
                        <template v-if="column.dataIndex === 'all_repayment'">
                          <a-select v-model:value="record.all_repayment" :title="record.all_repayment
                            ? t('全额还款')
                            : record.all_repayment === 0
                              ? t('部分还款')
                              : ''
                            " class="mini" :disabled="isVsAll_repayment">
                            <a-select-option :title="t('部分还款')" :value="0">
                              {{ t('部分还款') }}
                            </a-select-option>
                            <a-select-option :title="t('全额还款')" :value="1">
                              {{ t('全额还款') }}
                            </a-select-option>
                          </a-select>
                        </template>
                        <template v-if="column.dataIndex === 're_type'">
                          <a-select v-model:value="record.re_type" class="mini" :title="record.re_type == 1
                            ? t('本金优先分配')
                            : record.re_type == 2
                              ? t('利息优先分配')
                              : ''
                            " :disabled="Boolean(record.all_repayment)">
                            <a-select-option :title="t('本金优先分配')" :value="1">
                              {{ t('本金优先分配') }}
                            </a-select-option>
                            <a-select-option :title="t('利息优先分配')" :value="2">
                              {{ t('利息优先分配') }}
                            </a-select-option>
                          </a-select>
                        </template>
                        <template v-if="column.dataIndex === 'amount1'">
                          <a-input-number v-model:value="record.apply_rep_amount"
                                          :disabled="Boolean(record.all_repayment)" :min="0" :max="record.total_amount"
                                          :formatter="(value) =>
                                            `$ ${value}`.replace(
                                              /\B(?=(\d{3})+(?!\d))/g,
                                              ','
                                            )
                                            " :parser="(value) => value.replace(/\$\s?|(,*)/g, '')
                                              " class="mini" />
                        </template>
                        <template v-if="column.dataIndex === 'operation'">
                          <div class="flex justify-center items-center pt-2">
                            <a-popconfirm :title="t('确定删除吗？')" @confirm="deleteDrawdownColumnsItem(index)">
                              <i class="iconfont remove-icon">&#xe8c1;</i>
                            </a-popconfirm>
                            <!-- <a-switch v-if="lender === 'BOC'" v-model:checked="record.interest_status" :title="t('实际')" style="transform: scale(0.6)"></a-switch> -->
                          </div>
                        </template>
                      </template>
                    </a-table>
                  </a-spin>
                </div>
              </a-form-item>
              <p style="color: #ff4d4f; position: absolute; bottom: 0px" v-if="drawdownListInspection">
                {{ t('请完善数据') }}
              </p>
            </a-col>
            <!-- (formState.all_repayment === 1 && maxReductionAmount ) -->
            <template v-if="
              formState.all_repayment === 1 &&
              !isNormalUser &&
              maxReductionAmount
            ">
              <a-col :span="7">
                <a-form-item :label="t('还款总额')">
                  <a-input-number v-model:value="formState.apply_amount" :disabled="true" :max="99999999999" :formatter="(value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    " :parser="(value) => value.replace(/\$\s?|(,*)/g, '')" />
                </a-form-item>
              </a-col>
              <a-col :span="1" class="plus-txt">
                <i class="iconfont">&#xe711;</i>
              </a-col>
              <a-col :span="9">
                <a-form-item name="reduction_money" class="data-col-item">
                  <template #label>
                    <div class="flex items-center gap-1">
                      <span>{{ t('罚息减免额度') }}</span>
                      <span style="color: #31bd65">
                        {{
                          `(${t('罚息减免')}: $${numberStrFormat(
                            showMaxReduction
                          )})`
                        }}
                      </span>
                    </div>
                  </template>
                  <a-input-number v-model:value="formState.reduction_money" :max="99999999999" :formatter="(value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    " :parser="(value) => value.replace(/\$\s?|(,*)/g, '')" @input="() => amountInput(false)"
                                  @blur="() => amountInput(true)" />
                </a-form-item>
              </a-col>
              <a-col :span="1" class="plus-txt">
                <i class="iconfont">&#xe609;</i>
              </a-col>
              <a-col :span="5">
                <a-form-item :label="t('还款金额1')">
                  <div class="input-number-content">
                    <vco-number :bold="true" :value="repaymentAmount" :precision="2" color="#31bd65"
                                :end="true"></vco-number>
                  </div>
                </a-form-item>
              </a-col>
            </template>

            <a-col v-if="overdueDays" :span="6">
              <a-form-item :label="t('逾期天数')">
                <div class="show-date">{{ overdueDays }}</div>
              </a-form-item>
            </a-col>
            <a-col v-if="formState.all_repayment === 1" :span="6">
              <a-form-item>
                <template #label>
                  <div class="flex items-center gap-1">
                    <span>Loan IRR</span>
                    <span style="color: #31bd65">
                      {{ `(${numberStrFormat(oldIrrNumber)}%)` }}
                    </span>
                  </div>
                </template>
                <vco-number :value="irrPercent" prefix="" suffix="%" :precision="2" size="fs_md"
                            :end="true"></vco-number>
              </a-form-item>
            </a-col>
            <a-col v-if="
              formState.all_repayment === 1 &&
              formState.apply_date &&
              hasPermission('projects:repayments:adDownload')
            " :span="overdueDays ? 12 : 16">
              <a-form-item :label="t('对账单')">
                <a-button type="dark" class="uppercase shadow bold" :loading="downloadLoading"
                          @click="downloadStatement">
                  {{ t('下载') }}
                </a-button>
              </a-form-item>
            </a-col>

            <a-col :span="24">
              <a-form-item name="note" class="custom-label">
                <template #label>
                  <div class="w-full flex justify-between items-center">
                    <span>{{ t('还款说明') }}</span>
                    <a-dropdown trigger="click">
                      <a-button type="brown" shape="round" size="small">
                        {{ t('快捷选择') }}
                      </a-button>
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

                    <a-button v-if="showRelatedSwitch" type="brown" shape="round" size="small"
                              @click="securitiesVisible = true">
                      {{ t('选择') }}
                    </a-button>
                  </div>
                </template>
                <div v-if="showRelatedSwitch" class="table-content sys-table-content related-content no-top-line">
                  <a-table rowKey="uuid" :columns="relatedColumns" :data-source="relatedData" :pagination="false"
                           table-layout="fixed">
                    <template #bodyCell="{ column, record, index }">
                      <template v-if="column.dataIndex === 'security_name'">
                        <p :title="record.security_name" class="sec-name">
                          {{ record.security_name }}
                        </p>
                      </template>
                      <template v-if="column.dataIndex === 'amount'">
                        <vco-number size="fs_md" :value="record.amount" :precision="2"></vco-number>
                      </template>
                      <template v-if="column.dataIndex === 'real_amount'">
                        <a-input-number v-model:value="record.real_amount" :max="99999999999" :formatter="(value) =>
                          `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                          " :parser="(value) => value.replace(/\$\s?|(,*)/g, '')" class="mini" />
                      </template>
                      <template v-if="column.dataIndex === 'operation'">
                        <a-popconfirm v-if="dataInfo?.id && itemInData(record.uuid)" :title="t('确定删除吗？')"
                                      @confirm="removeItems(index, record)">
                          <i class="iconfont remove-icon">&#xe8c1;</i>
                        </a-popconfirm>

                        <i v-else class="iconfont remove-icon" @click="removeItems(index)">
                          &#xe8c1;
                        </i>
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
import {
  loanRDedit,
  projectLoanAllRepayment,
  loanDelSecurity,
  projectLoanCalcIrr,
  repayApplyStatus
} from '@/api/project/loan';
import { systemDictData } from '@/api/system';
import { CalendarOutlined } from '@ant-design/icons-vue';
import DocumentsUpload from '../../../discharge/components/form/DocumentsUpload.vue';
import dayjs from 'dayjs';
import { useUserStore } from '@/store';
import tool, {
  selectDateFormat,
  removeDuplicates,
  numberStrFormat,
} from '@/utils/tool';
import SecuritiesDialog from './SecuritiesDialog.vue';
import { cloneDeep, debounce } from 'lodash';
import { hasPermission } from '@/directives/permission/index';
import {
  drawDownSelected,
  drawDownLists,
  repaymentDetail,
} from '@/api/project/loan';
import { number } from 'echarts/core';

const { t } = useI18n();
const emits = defineEmits(['change']);
const userStore = useUserStore();
const isNormalUser = computed(() => userStore.isNormalUser);

const props = defineProps({
  uuid: {
    type: String,
  },
  projectDetail: {
    type: Object,
    default: () => { },
  },
  count: {
    type: Number,
    default: 0,
  },
  dataInfo: {
    type: Object,
    default: () => { },
  },
});

const showRelatedSwitch = ref(true);

const visible = ref(false);
const loading = ref(false);
const uploadVisible = ref(false);
const visibleTip = ref(false);
const confirmTxt = ref('');

const formState = ref({
  name: '',
  all_repayment: 0,
  apply_amount: '',
  apply_date: '',
  note: '',
  reduction_money: '',
});

const oldIrrNumber = ref(0);
const irrPercent = ref(0);
const irrLoading = ref(false);

const refreshIrr = () => {
  irrLoading.value = true;
  const params = {
    uuid: props.uuid,
    date: dayjs(formState.value.apply_date).format('YYYY-MM-DD'),
    last_money: repaymentAmount.value,
    do__est: 0,
  };

  projectLoanCalcIrr(params)
    .then((res) => {
      irrPercent.value = Number(res.irr || 0) < 0 ? 0 : Number(res.irr || 0);
      irrLoading.value = false;
    })
    .catch(() => {
      irrLoading.value = false;
    });
};

const maxReductionAmount = ref(0);
const showMaxReduction = computed(() => {
  return Number(maxReductionAmount.value) > 0
    ? Number(maxReductionAmount.value)
    : 0;
});

const document = ref([]);

const formRef = ref();

const repaymentAmount = computed(() => {
  let reduceNum = 0;
  if (formState.value.reduction_money < 0) {
    reduceNum = 0;
  } else {
    reduceNum =
      formState.value.reduction_money > showMaxReduction.value
        ? showMaxReduction.value
        : formState.value.reduction_money;
  }

  const res = tool.minus(formState.value.apply_amount, reduceNum);
  return res;
});

const amountInput = (flag = false) => {
  if (formState.value.reduction_money < 0) {
    formState.value.reduction_money = 0;
  } else {
    formState.value.reduction_money =
      formState.value.reduction_money > showMaxReduction.value
        ? showMaxReduction.value
        : formState.value.reduction_money;
  }

  if (flag) {
    refreshIrr();
  }
};

const getValidateInfo = () => {
  return (rule, value) => {
    if (value !== '') {
      const num = Number(value);
      if (num < 0 || num === 0) {
        return Promise.reject(t('还款金额不能小于等于0'));
      }
      return Promise.resolve();
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
          return Promise.reject(
            t('最大值为：{0}', [
              `$${numberStrFormat(maxReductionAmount.value)}`,
            ])
          );
        }

        return Promise.resolve();
      }
    }
  };
};

const formRules = ref({
  name: [
    { required: true, message: t('请输入') + t('还款标题'), trigger: 'blur' },
  ],
  all_repayment: [
    { required: true, message: t('请选择') + t('还款方式'), trigger: 'change' },
  ],
  // drawdown_account: [{ required: true, message: t('请选择') + t('放款账户'), trigger: 'change' }],
  re_type: [
    { required: true, message: t('请选择') + t('还款分配'), trigger: 'change' },
  ],
  apply_date: [
    { required: true, message: t('请选择') + t('还款日期'), trigger: 'change' },
  ],
  apply_amount: [
    { required: true, validator: getValidateInfo(), trigger: 'blur' },
  ],
  reduction_money: [{ validator: validateRed(), trigger: 'blur' }],
  note: [
    { required: true, message: t('请输入') + t('还款说明'), trigger: 'blur' },
  ],
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
    // formState.value.drawdown_account = [];
    relatedData.value = [];
    showRelatedSwitch.value = false;
    document.value = [];
    drawdownList.value = [];
    drawDownSelectedList.value = [];
    lender.value = '';
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
    apply_date: formState.value.apply_date,
    uuid: props.uuid,
    document: document.value,
    security: [],
  };

  if (params.all_repayment) {
    params.reduction_money_old = showMaxReduction.value;
    params.reduction_irr = irrPercent.value;
    params.reduction_irr_old = oldIrrNumber.value;
  } else {
    delete params.reduction_money;
  }

  if (relatedData.value.length) {
    const security = relatedData.value.map((item) => {
      return {
        uuid: item.uuid,
        real_amount: item.real_amount,
      };
    });
    params.security = security;
  }

  if (props.dataInfo?.id) {
    params.id = props.dataInfo?.id;
  }

  params.repayment = params_repayment();
  if (!validateRepayment(params.repayment)) {
    drawdownListInspection.value = true;
    return;
  }
  let apply_amount_total = params.repayment.reduce((sum, item) => {
    return tool.plus(sum, item.amount || 0); // 使用 || 0 防止 NaN
  }, 0);
  if (Number(apply_amount_total) !== Number(params.apply_amount)) {
    visibleTip.value = true;
    confirmTxt.value = t(
      '还款金额 {0},还款分配金额总计 {1},相差 {2},请调整金额',
      [
        tool.formatMoney(params.apply_amount),
        tool.formatMoney(apply_amount_total),
        tool.formatMoney(tool.minus(params.apply_amount, apply_amount_total)),
      ]
    );
    return;
  }
  params.all_repayment = params.all_repayment ? 1 : 0;

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

const calAmount = () => {
  getLoading.value = true;

  const time = formState.value.apply_date;
  const params = {
    uuid: props.uuid,
    date: time,
    verify: 1,
    reduction_money: formState.value.reduction_money,
  };

  if (props.dataInfo?.id) {
    params.verify_id = props.dataInfo?.id;
  }

  projectLoanAllRepayment(params)
    .then((res) => {
      formState.value.apply_amount = Number(res.last_money)
        ? Number(res.last_money)
        : 0;
      maxReductionAmount.value = Number(res.reduction_money)
        ? Number(res.reduction_money)
        : 0;

      if (isRestIrr.value) {
        isRestIrr.value = false;
        oldIrrNumber.value = res.irr;
        irrPercent.value = res.irr;
      } else {
        refreshIrr();
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
  {
    title: t('操作1'),
    dataIndex: 'operation',
    fixed: 'right',
    align: 'center',
    width: 50,
  },
]);

const showRealityInterestColumn = computed(() => {
  return drawdownList.value.some((item) => Number(item.interest_status) === 1);
});

const DrawdownColumns = computed(() => {
  const base = [
    { title: t('账号'), dataIndex: 'name' },
    { title: t('本金/利息'), dataIndex: 'amount', width: 140, align: 'center' },
    ...(showRealityInterestColumn.value
      ? [{ title: t('实际利息'), dataIndex: 'reality_interest', width: 150 }]
      : []),
    {
      title: t('还款方式'),
      dataIndex: 'all_repayment',
      width: showRealityInterestColumn.value ? 140 : 160,
    },
    {
      title: t('还款分配'),
      dataIndex: 're_type',
      width: showRealityInterestColumn.value ? 140 : 160,
    },
    {
      title: t('还款金额1'),
      dataIndex: 'amount1',
      width: showRealityInterestColumn.value ? 140 : 160,
    },
    // { title: t('还款金额1'), dataIndex: 'amount1', width: 120 },
    {
      title: t('操作1'),
      dataIndex: 'operation',
      fixed: 'right',
      align: 'center',
      width: 50,
    },
  ];
  return isVsAll_repayment.value
    ? base.filter((item) => item.dataIndex !== 'operation')
    : base;
});

const relatedData = ref([]);

const securitiesDone = (data) => {
  const arr = cloneDeep(data);
  const uuidArr = arr.map((item) => item.uuid);

  const selected = Array.from(new Set([...relatedData.value, ...arr]));
  const selData = removeDuplicates(selected, 'uuid').filter((item) =>
    uuidArr.includes(item.uuid)
  );
  selData.forEach((item) => {
    item.real_amount = Number(item.real_amount)
      ? item.real_amount
      : item.amount;
  });

  relatedData.value = selData;
};

const removeItems = async (index, data) => {
  if (props.dataInfo?.id && data) {
    const params = {
      uuid: props.uuid,
      ids: [data.uuid],
    };

    await loanDelSecurity(params)
      .then(() => {
        relatedData.value.splice(index, 1);
        const _index = relatedStaticData.value.findIndex(
          (item) => item.uuid === data.uuid
        );
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
  const project_apply_sn =
    props.projectDetail?.base?.project_apply_sn || 'Repayment';
  const count = props.count;
  const title = `${project_apply_sn}-${count + 1}-${dayjs().format(
    'YYYYMMDD'
  )}`;
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
    formState.value[key] = data[key];
  }
  formState.value.apply_amount = Math.abs(formState.value.apply_amount);

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
    const time = formState.value.apply_date;

    calAmount();
  }

  // formState.value.drawdown_account = data.drawDown.map((item) => {
  //   return item.id;
  // });

  drawdownList.value = data.drawDown;

  uploadVisible.value = true;
};

const downloadLoading = ref(false);
const downloadStatement = () => {
  downloadLoading.value = true;

  projectLoanAllRepayment({
    uuid: props.uuid,
    date: formState.value.apply_date,
    pdf: 1,
    less: formState.value.reduction_money || 0,
    verify_id: props.dataInfo?.id,
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
const lender = ref('');
const drawDownSelectedList = ref([]);
const drawDownSelectedListLoading = ref(false);
const loadDrawDownSelected = (rest = true) => {
  drawDownSelectedListLoading.value = true;
  maxReductionAmount.value = 0;
  lender.value = '';
  if (rest) {
    formState.value.all_repayment = 0;
    drawdownList.value = [];
  }
  drawDownSelected({
    uuid: props.uuid,
    apply_id: props.dataInfo?.id,
    date: formState.value.apply_date,
  })
    .then((res) => {
      lender.value = res.lender;
      drawDownSelectedList.value = res.drawDown;
    })
    .finally(() => {
      drawDownSelectedListLoading.value = false;
    });
};

// 加载可以选择的放款
const drawdownList = ref([]);
const drawdownListLoading = ref(false);
const drawdownListInspection = ref(false);
const disabledIds = ref([]);
// VS 且全额还款时用于禁用操作的标记
const isVsAll_repayment = computed(
  () => lender.value === 'VS' && Boolean(formState.value.all_repayment)
);

const handleApplyDateAndRepaymentChange = () => {
  // TODO: add fill logic here.
  if (formState.value.apply_date && formState.value.all_repayment === 1) {
    isRestIrr.value = true;
    calAmount();
  } else {
    maxReductionAmount.value = 0;
  }
  formState.value.note =
    formState.value.all_repayment === 1
      ? 'Full Repayment'
      : formState.value.note === 'Full Repayment'
        ? ''
        : formState.value.note;
};

watch(
  [() => formState.value.apply_date, () => formState.value.all_repayment],
  handleApplyDateAndRepaymentChange
);

// 通过 id 获取放款名称，便于展示 title
const getDrawdownName = (sn) => {
  const target = drawDownSelectedList.value.find((item) => item.sn === sn);
  return target ? target.name : '';
};

// VS 放款的初始化逻辑占位，由业务补充
const initVsDrawdownList = () => {
  if (
    lender.value === 'VS' &&
    formState.value.all_repayment &&
    formState.value.apply_date
  ) {
    const sn = drawDownSelectedList.value.map((item) => item?.sn).join(',');
    drawdownListLoading.value = true;
    drawDownLists({
      uuid: props.uuid,
      date: formState.value.apply_date,
      sn: sn,
    })
      .then((res) => {
        drawdownList.value = cloneDeep(res.drawDown);
        drawdownList.value.map((item) => {
          item['all_repayment'] = 1;
        });
      })
      .finally(() => {
        drawdownListLoading.value = false;
      });
  }
};

// watch(
//   [() => lender.value, () => formState.value.all_repayment],
//   ([vsLoan, allRepayment]) => {
//     if (vsLoan === 'VS' && allRepayment) {
//       initVsDrawdownList();
//     }
//   }
// );

const loadDrawdown = (e, index) => {
  if (formState.value.apply_date && e !== '') {
    drawdownListLoading.value = true;
    drawDownLists({ uuid: props.uuid, date: formState.value.apply_date, sn: e })
      .then((res) => {
        drawdownList.value[index] = res.drawDown[0];
        res['interest_status'] = 0;
        res['reality_interest'] = 0;
      })
      .finally(() => {
        drawdownListLoading.value = false;
      });
  }
};

const addDrawdownColumnsItem = () => {
  drawdownList.value.push({
    amount: '',
    sn: '',
    interest: '',
    interest_day: 0,
    name: '',
    rate: '',
    source: '',
    total_amount: 0,
    interest_status: 0,
    reality_interest: 0,
  });
};

const deleteDrawdownColumnsItem = (index) => {
  drawdownList.value.splice(index, 1);
};

// 验证选择的放款是否有必填项没有填
const validateRepayment = (arr) => {
  return arr.every((item) => {
    if (
      item.all_repayment === undefined ||
      !item.amount ||
      Number(item.amount) <= 0
    ) {
      return false;
    }
    if (item.all_repayment === 0 && item.re_type == undefined) {
      return false;
    }
    return true;
  });
};

// 格式化上传的放款金额
const params_repayment = () => {
  return drawdownList.value.map((item) => {
    item.interest_status = item.interest_status || 0;
    if (item.all_repayment) {
      if (item.interest_status == 1) {
        item.apply_rep_amount = tool.plus(
          item.reality_interest || 0,
          item.amount || 0
        );
      } else {
        item.apply_rep_amount =
          item.total_amount || tool.plus(item.amount || 0, item.interest || 0);
      }
    }
    return {
      sn: item.sn,
      re_type: item.re_type,
      source: item.source,
      all_repayment: item.all_repayment,
      amount: item.apply_rep_amount,
      interest_status: item.interest_status,
      reality_interest: item.reality_interest,
    };
  });
};

watch(
  () => drawdownList.value,
  (val) => {
    disabledIds.value = val
      .filter((item) => item.sn != null && item.sn !== '')
      .map((item) => item.sn);
    // 如果是vs全额还款

    formState.value.apply_amount = params_repayment().reduce((sum, item) => {
      return tool.plus(sum, item.amount || 0); // 使用 || 0 防止 NaN
    }, 0);
    if (drawdownListInspection.value) {
      if (!validateRepayment(params_repayment())) {
        drawdownListInspection.value = true;
        return;
      }
      drawdownListInspection.value = false;
    }
  },
  { deep: true }
);

const repayApplyStatusLoading = ref(false);
const init = () => {
  if (!props.dataInfo?.id) {
    repayApplyStatusLoading.value = true;
    repayApplyStatus({ uuid: props.uuid }).then(
      (res) => {
        if (res.status) {
          visible.value = true;
          setDefaultTitle();
          uploadVisible.value = true;
          getNotesType();
        }
        repayApplyStatusLoading.value = false;
      }
    ).catch(() => {
      repayApplyStatusLoading.value = false;
    });

  } else {
    visible.value = true;
    repaymentDetail({ uuid: props.uuid, id: props.dataInfo?.id }).then(
      (res) => {
        setFormData(res);
        loadDrawDownSelected(false);
      }
    );
    getNotesType();
  }
};

const isRestIrr = ref(false);
const overdueDays = computed(() => {
  const selectDate = formState.value.apply_date;
  const endDate = props.projectDetail?.date?.end_date;
  if (selectDate && endDate && dayjs(endDate).isBefore(dayjs(selectDate))) {
    return tool.diffDate(endDate, selectDate);
  }
  return 0;
});
defineExpose({
  init,
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
  white-space: nowrap;
  /* 禁止换行 */
  overflow: hidden;
  /* 隐藏溢出内容 */
  text-overflow: ellipsis;
  /* 使用省略号表示溢出内容 */
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

:deep(.Repayment_allocation) {

  .ant-table-wrapper .ant-table-thead>tr>th,
  .ant-table-wrapper .ant-table-tbody>tr>td,
  .ant-table-wrapper tfoot>tr>th,
  .ant-table-wrapper tfoot>tr>td {
    padding: 16px 5px;
  }

  .ant-table-wrapper .ant-table-thead>tr>th:first-child,
  .ant-table-wrapper .ant-table-tbody>tr>td:first-child,
  .ant-table-wrapper tfoot>tr>th:first-child,
  .ant-table-wrapper tfoot>tr>td:first-child {
    padding-left: 16px;
  }

  .ant-table-body {
    overflow-x: hidden !important;
  }
}

.edit-icon {
  color: @colorPrimary !important;
  font-size: 12px;
  cursor: pointer;
}

.icon-delete {
  color: @colorPrimary !important;
  cursor: pointer;
}
</style>
