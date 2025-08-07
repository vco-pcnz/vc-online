<template>
  <div>
    <vco-page-panel @back="backHandle" :title="t('添加变更')"></vco-page-panel>

    <!-- 首次放款选择弹窗 -->
    <a-modal
      :open="selectVisible"
      :title="t('进度付款阶段')"
      :width="1400"
      :footer="null"
      :keyboard="false"
      :maskClosable="false"
      class="middle-position"
      @cancel="selectVisible = false"
    >
      <view-content
        v-if="selectVisible"
        :variation-id="currentVariationId"
        :selected-data="selectedData"
        @selectDone="selectDoneHandle"
      ></view-content>
    </a-modal>

    <security-dialog
      v-model:visible="securityDialogVisible"
      :current-id="uuid"
      :security-data="securityData"
      :variation-id="currentVariationId"
      @refresh="refreshHandle"
    ></security-dialog>

    <div v-if="pageLoading" class="loading-container">
      <a-spin :spinning="pageLoading" size="large"></a-spin>
    </div>
    <div v-if="uuid && projectInfo" class="project-container">
      <div class="project-info">
        <base-card :variations="true" :detail="projectInfo"></base-card>
      </div>
      <div class="sys-form-content">
        <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
          <a-row :gutter="24">
            <a-col :span="[1, 2, 3].includes(Number(formState.type)) ? 8 : 12">
              <a-form-item :label="t('变更类型')" name="type">
                <a-select v-model:value="formState.type" :options="typeData" @change="typeChange"></a-select>
              </a-form-item>
            </a-col>
            <a-col :span="[1, 2, 3].includes(Number(formState.type)) ? 6 :12">
              <a-form-item :label="t('变更开始日期')" name="start_date">
                <a-form-item-rest>
                  <a-date-picker
                    v-model:value="formState.start_date"
                    :format="selectDateFormat()"
                    valueFormat="YYYY-MM-DD"
                    :disabledDate="disabledDate"
                    :showToday="false"
                    @change="dateChange('start_date')"
                  />
                  <a-checkbox
                    v-if="initDrawdownData.length"
                    v-model:checked="initDrawdownSel"
                    class="mt-1"
                    style="font-size: 12px;"
                    @change="initDrawdownCheckedChange"
                  >{{ t('所选日期存在放款数据，是否将其设置为变更后首次放款') }}</a-checkbox>
                </a-form-item-rest>
              </a-form-item>
            </a-col>
            <template v-if="[1, 2, 3].includes(Number(formState.type))">
              <a-col :span="4">
                <a-form-item :label="t('延长周期(月份)')" name="extend_month">
                  <a-input-number
                    v-model:value="formState.extend_month"
                    :min="0"
                    :precision="0"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="6">
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
            </template>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="7">
              <a-form-item :label="t('抵押物总价值')">
                <div class="input-number-container">
                  <vco-number :value="statistics.all_money" :bold="true" size="fs_ml" :precision="2"></vco-number>
                </div>
              </a-form-item>
            </a-col>
            <a-col :span="1" class="plus-txt">
              <i class="iconfont">&#xe712;</i>
            </a-col>
            <a-col :span="7">
              <a-form-item :label="t('变更值')">
                <div class="input-number-container">
                  <a-input-number
                    v-model:value="securityAmount"
                    :max="99999999999"
                    :disabled="true"
                    :formatter="
                      (value) =>
                        `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    "
                    :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                  />
                  <i class="iconfont" @click="securityDialogVisible = true">&#xe8cf;</i>
                </div>
              </a-form-item>
            </a-col>
            <a-col :span="1" class="plus-txt">
              <i class="iconfont">=</i>
            </a-col>
            <a-col :span="8">
              <a-form-item :label="t('变更后')">
                <div class="input-number-container">
                  <vco-number :value="changeSecurityAfter" :bold="true" size="fs_ml" :precision="2"></vco-number>
                </div>
              </a-form-item>
            </a-col>
            <a-col :span="formState.type === 3 ? 8 : 7">
              <a-form-item :label="t('开发成本')">
                <div class="input-number-container">
                  <vco-number :value="projectInfo?.credit?.right?.devCost" :bold="true" size="fs_ml" :precision="2"></vco-number>
                </div>
              </a-form-item>
            </a-col>
            <template v-if="[1, 2, 4, 5].includes(formState.type)">
              <a-col :span="1" class="plus-txt">
                <i class="iconfont" v-if="[1, 4].includes(Number(formState.type))">&#xe712;</i>
                <i class="iconfont" v-else>&#xe711;</i>
              </a-col>
              <a-col :span="7">
                <a-form-item :label="t('变更值')">
                  <DevCostDetail
                    :dataJson="devCostJsonData"
                    :disabledGST="true"
                    :disabledLoan="true"
                    :disabledModel="true"
                    :is-variation="true"
                    :uuid="uuid"
                    :remain-land-amount="Number(projectInfo?.base?.remain_land_amount) || 0"
                    :is-plus="[1, 4].includes(Number(formState.type))"
                    @change="devCostChange"
                  >
                    <div class="input-number-container">
                      <a-input-number
                        v-model:value="changeCost"
                        :max="99999999999"
                        :disabled="true"
                        :formatter="
                          (value) =>
                            `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                        "
                        :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                      />
                      <i class="iconfont">&#xe8cf;</i>
                    </div>
                  </DevCostDetail>
                </a-form-item>
              </a-col>
              <a-col :span="1" class="plus-txt">
                <i class="iconfont">=</i>
              </a-col>
              <a-col :span="8">
                <a-form-item :label="t('变更后')">
                  <div class="input-number-container">
                    <vco-number :value="changeCostAfter" :bold="true" size="fs_ml" :precision="2"></vco-number>
                  </div>
                </a-form-item>
              </a-col>
            </template>
            <a-col :span="formState.type === 3 ? 8 : 7">
              <a-form-item :label="t('建筑贷款总额')">
                <div class="input-number-container">
                  <vco-number :value="projectInfo?.base?.build_amount" :bold="true" size="fs_ml" :precision="2"></vco-number>
                </div>
              </a-form-item>
            </a-col>
            <template v-if="[1, 2, 4, 5].includes(formState.type)">
              <a-col :span="1" class="plus-txt">
                <i class="iconfont" v-if="[1, 4].includes(Number(formState.type))">&#xe712;</i>
                <i class="iconfont" v-else>&#xe711;</i>
              </a-col>
              <a-col :span="7">
                <a-form-item class="w-full-label">
                  <template #label>
                    <div class="w-full flex justify-between items-center">
                      <p>{{ t('变更值') }}</p>
                      <a-button
                        v-if="Number(buildChangeNum)"
                        type="link"
                        style="font-size: 12px; height: auto !important;"
                        class="flex items-center"
                        @click="goProgressPage"
                      >
                        <p>{{ t('进度付款') }}</p>
                        <i class="iconfont" style="font-size: 12px;">&#xe602;</i>
                      </a-button>
                    </div>
                  </template>

                  <div class="input-number-container">
                    <a-input-number
                      v-model:value="buildChangeNum"
                      :max="99999999999"
                      :disabled="true"
                      :formatter="
                        (value) =>
                          `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      "
                      :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                    />
                  </div>
                </a-form-item>
              </a-col>
              <a-col :span="1" class="plus-txt">
                <i class="iconfont">=</i>
              </a-col>
              <a-col :span="8">
                <a-form-item :label="t('变更后')">
                  <div class="input-number-container">
                    <vco-number :value="buildChangeAfterNum" :bold="true" size="fs_ml" :precision="2"></vco-number>
                  </div>
                </a-form-item>
              </a-col>
            </template>
            <a-col :span="formState.type === 3 ? 8 : 7">
              <a-form-item :label="t('土地贷款总额')">
                <div class="input-number-container">
                  <vco-number :value="projectInfo?.base?.land_amount" :bold="true" size="fs_ml" :precision="2"></vco-number>
                </div>
              </a-form-item>
            </a-col>
            <template v-if="[1, 2, 4, 5].includes(formState.type)">
              <a-col :span="1" class="plus-txt">
                <i class="iconfont" v-if="[1, 4].includes(Number(formState.type))">&#xe712;</i>
                <i class="iconfont" v-else>&#xe711;</i>
              </a-col>
              <a-col :span="7">
                <a-form-item :label="t('变更值')">
                  <div class="input-number-container">
                    <a-input-number
                      v-model:value="landChangeNum"
                      :max="99999999999"
                      :disabled="true"
                      :formatter="
                        (value) =>
                          `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      "
                      :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                    />
                  </div>
                </a-form-item>
              </a-col>
              <a-col :span="1" class="plus-txt">
                <i class="iconfont">=</i>
              </a-col>
              <a-col :span="8">
                <a-form-item :label="t('变更后')">
                  <div class="input-number-container">
                    <vco-number :value="landChangeAfterNum" :bold="true" size="fs_ml" :precision="2"></vco-number>
                  </div>
                </a-form-item>
              </a-col>
            </template>
            <a-col :span="formState.type === 3 ? 8 : 7">
              <a-form-item :label="t('借款总金额')">
                <div class="input-number-container">
                  <vco-number :value="projectInfo?.base?.loan_money" :bold="true" size="fs_ml" :precision="2"></vco-number>
                </div>
              </a-form-item>
            </a-col>
            <template v-if="[1, 2, 4, 5].includes(formState.type)">
              <a-col :span="1" class="plus-txt">
                <i class="iconfont" v-if="[1, 4].includes(Number(formState.type))">&#xe712;</i>
                <i class="iconfont" v-else>&#xe711;</i>
              </a-col>
              <a-col :span="7">
                <a-form-item :label="t('变更值')">
                  <div class="input-number-container">
                    <a-input-number
                      v-model:value="loanMoneyChangeNum"
                      :max="99999999999"
                      :disabled="true"
                      :formatter="
                        (value) =>
                          `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      "
                      :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                    />
                  </div>
                </a-form-item>
              </a-col>
              <a-col :span="1" class="plus-txt">
                <i class="iconfont">=</i>
              </a-col>
              <a-col :span="8">
                <a-form-item :label="t('变更后')">
                  <div class="input-number-container">
                    <vco-number
                      :value="loanMoneyChangeAfterNum"
                      :color="[1, 4].includes(Number(formState.type)) ? '#31bd65' : '#eb4b6d'"
                      :bold="true"
                      size="fs_ml"
                      :precision="2"
                    ></vco-number>
                  </div>
                </a-form-item>
              </a-col>
              <a-col v-if="[1, 2, 4, 5].includes(formState.type)" :span="7">
                <a-form-item :label="t('变更后首次放款')" name="initial_amount">
                  <a-select
                    v-if="initDrawdownSel"
                    v-model:value="formState.initial_sn"
                    :options="initDrawdownData"
                    @change="initDrawdownSelChange"
                  ></a-select>

                  <div v-else class="input-number-container">
                    <a-input-number
                      v-model:value="formState.initial_amount"
                      :max="99999999999"
                      :disabled="true"
                      :formatter="
                        (value) =>
                          `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      "
                      :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                    />
                    <i class="iconfont" @click="selectVisible = true">&#xe8cf;</i>
                  </div>
                </a-form-item>
              </a-col>
            </template>

            <div v-if="colItemsRef.length" class="w-full flex flex-wrap">
              <a-col :span="24"><div class="pt-5" style="border-top: 1px dashed #282828"></div></a-col>
              <template v-if="colItemsRef.length">
                <template v-for="item in colItemsRef" :key="item.credit_table">
                  <a-col :span="getItemsSpan" v-if="!(formState.type == 5 && item.credit_table === 'credit_brokerFeeRate')">
                    <a-form-item :name="item.credit_table">
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
                        :suffix="item.credit_unit"
                        :disabled="item.credit_table === 'credit_brokerFeeRate' && (!borkerFeeCalcAmount && formState.type !== 4)"
                        :loading="item.credit_table === 'credit_brokerFeeRate' && loadingBorkerFeeCalcAmount"
                        @input="handInput(item.credit_table)"
                      />
                      <a-input-number
                        v-else
                        @input="handInput(item.credit_table)"
                        :disabled="item.credit_table === 'credit_brokerFee' && (!borkerFeeCalcAmount && formState.type !== 4)"
                        :loading="item.credit_table === 'credit_brokerFee' && loadingBorkerFeeCalcAmount"
                        v-model:value="formState[item.credit_table]"
                        :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                        :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                      />
                    </a-form-item>
                  </a-col>
                </template>
              </template>
            </div>

            <a-col :span="24">
              <a-form-item :label="t('说明')" name="note">
                <a-textarea v-model:value="formState.note" :rows="3" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </div>
  </div>
  
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { projectDetail } from '@/api/project/project';
import { systemDictData } from '@/api/system';
import { projectCreditVariation, projectVariationDrawdownSel, borkerFeeCalc, dischargeStatistics, projectVariationEdit } from '@/api/project/loan';
import { projectVariationInfo } from '@/api/project/variation';
import { ruleCredit } from '@/api/process';
import { useI18n } from 'vue-i18n';
import DevCostDetail from '@/views/process/temp/default/components/DevCostDetail.vue';
import { selectDateFormat, numberStrFormat, formatMoneyToNumber } from '@/utils/tool';
import BaseCard from '@/views/projects/about/components/base.vue';
import dayjs from 'dayjs';
import tool, { navigationTo } from '@/utils/tool';
import { cloneDeep } from 'lodash';
import securityDialog from './components/security-dialog.vue';
import ViewContent from './components/view-content.vue';

const { t } = useI18n();

const pageLoading = ref(false);
const router = useRouter();
const uuid = ref(useRoute().query.uuid);
const typeData = ref([]);
const projectInfo = ref();

const getTypeData = () => {
  systemDictData('variation_type').then((res) => {
    const data = res.map((item) => {
      return {
        label: item.name,
        value: Number(item.code)
      };
    });
    typeData.value = data;
  });
};

const backHandle = () => {
  router.back();
}

const devCostJsonData = ref([]);

const getProjectDetail = async () => {
  pageLoading.value = true;
  const res = await projectDetail({uuid: uuid.value});
  projectInfo.value = res;
  pageLoading.value = false;

  if (!currentVariationId.value) {
    devCostJsonData.value = projectInfo.value.base.devCostDetail;
  }
};

const devCostChange = (val) => {
  devCostJsonData.value = val.devCostDetail;

  const params = {
    uuid: uuid.value,
    devCostDetail: val.devCostDetail
  }

  if (currentVariationId.value) {
    params.id = currentVariationId.value;
  }

  projectVariationEdit(params).then(res => {
    setVariationIdStore(res.id);
    getVariationDetail();
  })
}

const typeChange = (val) => {
  const params = {
    uuid: uuid.value,
    type: val,
    devCostDetail: []
  }

  if (currentVariationId.value) {
    params.id = currentVariationId.value;
  }

  projectVariationEdit(params).then(res => {
    setVariationIdStore(res.id);
    getVariationDetail();
  })
}

const formRef = ref();

const formState = ref({
  type: '',
  amount: '',
  start_date: '',
  end_date: '',
  initial_amount: '',
  note: '',
  initial_sn: ''
});

const changeCost = computed(() => {
  const data = cloneDeep(devCostJsonData.value);
  if (data.length) {
    const itemData = data[0].data[0].list || []
    // 平铺itemData 并计算change_value 的合
    const flatData = itemData.flatMap((item) => item.list || []);
    const mergeData = [...itemData, ...flatData];
    const changeValue = mergeData.reduce((acc, item) => tool.plus(acc, item.change_value || 0), 0);
    return changeValue;
  } else {
    return 0;
  }
});

const changeCostAfter = computed(() => {
  let changeNum = changeCost.value || 0
  let resNum = 0
  if ([1, 4].includes(Number(formState.value.type))) {
    resNum = tool.plus(projectInfo.value.credit.right.devCost, changeNum)
  }
  if ([2, 5].includes(Number(formState.value.type))) {
    resNum = tool.minus(projectInfo.value.credit.right.devCost, changeNum)
  }
  return resNum;
});

const landChangeNum = computed(() => {
  const data = cloneDeep(devCostJsonData.value);
  if (data.length) {
    const itemData = data[0].data[0].list || []
    const land = itemData.find(item => item.name === 'Land')
    if (land) {
      return land.change_value || 0
    }
  } else {
    return 0;
  }
})

const landChangeAfterNum = computed(() => {
  const landAmount = projectInfo.value.base.land_amount || 0
  const changeNum = landChangeNum.value || 0
  let resNum = 0
  if ([1, 4].includes(Number(formState.value.type))) {
    resNum = tool.plus(landAmount, changeNum)
  }
  if ([2, 5].includes(Number(formState.value.type))) {
    resNum = tool.minus(landAmount, changeNum)
  }
  return resNum;
})

const buildChangeNum = computed(() => {
  const data = cloneDeep(devCostJsonData.value);
  if (data.length) {
    const itemData = data[0].data[0].list || []
    const flatData = itemData.flatMap((item) => item.list || []);
    const mergeData = [...itemData, ...flatData];
    const buildList = mergeData.filter(item => !['Land', 'Land GST'].includes(item.name) && !item.list)
    
    const changeValue = buildList.reduce((acc, item) => tool.plus(acc, item.change_value || 0), 0);
    return changeValue
  } else {
    return 0;
  }
})

const buildChangeAfterNum = computed(() => {
  const buildAmount = projectInfo.value.base.build_amount || 0
  const changeNum = buildChangeNum.value || 0
  let resNum = 0
  if ([1, 4].includes(Number(formState.value.type))) {
    resNum = tool.plus(buildAmount, changeNum)
  }
  if ([2, 5].includes(Number(formState.value.type))) {
    resNum = tool.minus(buildAmount, changeNum)
  }
  return resNum;
})

const loanMoneyChangeNum = computed(() => {
  return tool.plus(landChangeNum.value, buildChangeNum.value)
})

const loanMoneyChangeAfterNum = computed(() => {
  const loanMoney = projectInfo.value.base.loan_money || 0
  const changeNum = loanMoneyChangeNum.value || 0
  let resNum = 0
  if ([1, 4].includes(Number(formState.value.type))) {
    resNum = tool.plus(loanMoney, changeNum)
  }
  if ([2, 5].includes(Number(formState.value.type))) {
    resNum = tool.minus(loanMoney, changeNum)
  }
  return resNum;
})

const goProgressPage = () => {
  navigationTo(`/projects/variations/progress-payment/?uuid=${uuid.value}&id=${currentVariationId.value}`)
}

const formRules = ref({
  type: [{ required: true, message: t('请选择') + t('变更类型'), trigger: 'change' }],
  amount: [{ required: true, message: t('请输入') + t('总金额'), trigger: 'change' }],
  start_date: [{ required: true, message: t('请选择') + t('变更开始日期'), trigger: 'change' }],
  end_date: [{ required: true, message: t('请选择') + t('变更结束日期'), trigger: 'change' }],
  initial_amount: [{ required: true, message: t('请输入') + t('首次放款总金额'), trigger: 'change' }]
});

const disabledDate = (current) => {
  const startDate = dayjs(projectInfo.value.date.var_start_date);
  return (current && current.isBefore(startDate.startOf('day').add(1, 'day')));
};

const endDefaultPickerValue = computed(() => {
  return dayjs(projectInfo.value.date.end_date).add(1, 'day');
});

const endDisabledDate = (current) => {
  return current && current.isBefore(dayjs(projectInfo.value.date.end_date).add(1, 'day').startOf('day'));
};

const initDrawdownSel = ref(false);
const initDrawdownData = ref([]);

const initDrawdownSelChange = (val) => {
  if (val) {
    const amount = initDrawdownData.value.find((item) => item.value == val)?.label;
    formState.value.initial_amount = formatMoneyToNumber(amount);
  } else {
    formState.value.initial_amount = '';
  }
};

const initDrawdownCheckedChange = () => {
  formState.value.initial_amount = '';
  formState.value.initial_sn = '';
  selectedData.value = []
}

const getInitDradownData = (flag = false) => {
  projectVariationDrawdownSel({
    uuid: uuid.value,
    date: formState.value.start_date
  }).then((res) => {
    const data = res.map((item) => {
      return {
        label: `$${numberStrFormat(item.amount)}`,
        value: item.sn
      };
    });
    initDrawdownData.value = data;
  });
}


const dateChange = (type) => {
  const start_date = formState.value.start_date;
  const end_date = formState.value.end_date;
  if (start_date && end_date) {
    const date1 = dayjs(start_date);
    const date2 = dayjs(end_date);

    if (date1.isAfter(date2)) {
      message.error(t('{0}应在{1}之前', [t('变更开始日期'), t('变更结束日期')]));
      formState.value[type] = '';
    }
  }

  if (type == 'start_date') {
    formState.value.initial_sn = '';

    initDrawdownSel.value = false;

    // 如果所选时间在当月之前并且天数大于7天
    const startDate = dayjs(formState.value.start_date);
    const nowDate = dayjs(new Date());
    const diffDay = startDate.diff(nowDate, 'day');

    // 晚变更
    if (startDate.isBefore(nowDate.startOf('month')) && Math.abs(diffDay) > 7) {
      getInitDradownData()
    } else {
      initDrawdownData.value = [];
    }
  }
};

const statistics = ref({
  all_money: 0,
  all_total: 0
})
const getsecurityInfo = () => {
  dischargeStatistics({ uuid: uuid.value }).then((res) => {
    statistics.value = res
  });
}

const securityDialogVisible = ref(false)

const setVariationIdStore = (id) => {
  currentVariationId.value = id;
  const obj = JSON.parse(localStorage.getItem('variationId') || '{}');
  obj[uuid.value] = id;
  localStorage.setItem('variationId', JSON.stringify(obj));
}

const securityData = ref([])
const securityAmount = computed(() => {
  if (securityData.value.length) {
    return securityData.value.reduce((acc, item) => tool.plus(acc, item.amount), 0);
  } else {
    return 0;
  }
})

const changeSecurityAfter = computed(() => {
  return tool.plus(statistics.value.all_money, securityAmount.value);
})

const currentVariationId = ref('')
// 请求变更详情
const getVariationDetail = () => {
  projectVariationInfo({
    uuid: uuid.value,
    id: currentVariationId.value
  }).then((res) => {
    securityData.value = res.security || [];
    formState.value.type = res.type;

    devCostJsonData.value = res.devCostDetail && res.devCostDetail.length ? res.devCostDetail : projectInfo.value.base.devCostDetail;
  })
}

const refreshHandle = (id) => {
  setVariationIdStore(id);
  getVariationDetail();
}

const selectVisible = ref(false)
const selectedData = ref([])
const selectDoneHandle = (data) => {
  const build__data = cloneDeep(data.build__data)
  selectedData.value = build__data
  formState.value.initial_amount = data.total
  selectVisible.value = false
}

const creditData = ref([]);
const creditItemsData = ref([]);
const percentItems = ref([]);
const dollarItems = ref([]);

const creditVariationinfo = ref({});

const passFormInit = (key) => {
  const obj = creditData.value.find((item) => item.credit_table === key);
  if (obj) {
    return !Boolean(obj.is_ratio);
  } else {
    return false;
  }
};

const getValidateInfo = (data) => {
  return (rule, value) => {
    const min = data.min ? Number(data.min) : 0;
    const max = data.max ? Number(data.max) : 0;

    const num = Number(value);
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
  };
};

const colItemsRef = ref([])
const createFormItems = (flag) => {
  const creditInfo = cloneDeep(creditVariationinfo.value);

  if (formState.value.type === 5) {
    delete creditInfo.credit_estabFeeRate;
    delete creditInfo.credit_LineFeeRate;
  }

  const keyArr = [];
  for (const key in creditInfo) {
    formState.value[key] = passFormInit(key) ? '' : creditInfo[key];
    keyArr.push(key);
  }

  let colItems = creditData.value.filter((item) => keyArr.includes(item.credit_table));
  const has_linefee = Boolean(projectInfo.value.has_linefee);
  if (!has_linefee) {
    colItems = colItems.filter((item) => !item.is_linefee);
  }
  const rulesData = {};

  for (let i = 0; i < colItems.length; i++) {
    rulesData[colItems[i].credit_table] = [{ validator: getValidateInfo(colItems[i]), trigger: 'blur' }];
    if (colItems[i].is_req) {
      rulesData[colItems[i].credit_table].push({
        required: true,
        message: t('请输入') + colItems[i].credit_name,
        trigger: 'blur'
      });
    }
  }

  const ascArr = ['credit_estabFeeRate', 'credit_estabFee', 'credit_brokerFeeRate', 'credit_brokerFee'];
  
  // 按照 ascArr 顺序重新排列 colItems
  const orderedItems = [];
  const remainingItems = [...colItems];
  
  // 先添加 ascArr 中指定顺序的项
  ascArr.forEach(key => {
    const index = remainingItems.findIndex(item => item.credit_table === key);
    if (index !== -1) {
      orderedItems.push(remainingItems.splice(index, 1)[0]);
    }
  });
  
  // 再添加剩余的项
  orderedItems.push(...remainingItems);
  colItems = orderedItems;

  colItemsRef.value = colItems;
  creditItemsData.value = colItems.map((item) => item.credit_table);

  const perData = colItems.filter((item) => item.is_ratio);
  const dolData = colItems.filter((item) => !item.is_ratio);

  percentItems.value = perData;
  dollarItems.value = dolData;

  formRules.value = { ...formRules.value, ...rulesData };
};

const getCreditVal = () => {
  projectCreditVariation({
    apply_uuid: uuid.value
  }).then((res) => {
    creditVariationinfo.value = res;

    createFormItems();
  });
};

const getCreditInfo = () => {
  ruleCredit().then((res) => {
    creditData.value = res || [];
    getCreditVal();
  });
};

const borkerFeeCalcAmount = ref(0);
const borkerFeeCalcAmountRef = computed(() => {
  const total = Number(borkerFeeCalcAmount.value);
  const num = Number(formState.value.amount);
  const isPlus = [1, 4].includes(Number(formState.value.type));

  let res = 0;
  if (isPlus) {
    res = tool.plus(total, num);
  } else {
    res = tool.minus(total, num);
  }

  return res;
})

const type_startDate = computed(() => ({
  type: formState.value.type,
  start_date: formState.value.start_date
}));

const getItemsSpan = computed(() => {
  const num = creditItemsData.value.length;
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
});

const loadingBorkerFeeCalcAmount = ref(false);
watch(
  type_startDate,
  (val) => {
    // 变更自动计算broker fee
    if ([1, 2, 3].includes(val.type) && val.start_date) {
      borkerFeeCalcAmount.value = 0;
      loadingBorkerFeeCalcAmount.value = true;
      borkerFeeCalc({ uuid: uuid.value, start_date: val.start_date })
        .then((res) => {
          borkerFeeCalcAmount.value = res;
          handInput('credit_brokerFeeRate');
        })
        .finally(() => {
          loadingBorkerFeeCalcAmount.value = false;
        });
    }
  },
  { deep: true }
);

const handInput = (key) => {
  if (key == 'credit_brokerFeeRate' && formState.value.type != 4) {
    formState.value.credit_brokerFee = (((formState.value.credit_brokerFeeRate || 0) * (borkerFeeCalcAmountRef.value || 0)) / 100).toFixed(2);
  }
  if (key == 'credit_brokerFee') {
    formState.value.credit_brokerFeeRate = (((formState.value.credit_brokerFee || 0) / (borkerFeeCalcAmountRef.value || 0)) * 100).toFixed(6);
  }
};

onMounted(async () => {
  if (uuid.value) {
    await getProjectDetail();

    const obj = JSON.parse(localStorage.getItem('variationId') || '{}');
    if (obj[uuid.value]) {
      currentVariationId.value = obj[uuid.value];
      getVariationDetail();
    }
    getsecurityInfo()
    getTypeData();

    getCreditInfo();
  }
});
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.project-container {
  color: @color_coal;
  position: relative;
  display: grid;
  grid-template-columns: 315px 1fr;
  gap: 24px;
  align-items: flex-start;

  .project-info {
    overflow: hidden;
    border-radius: 12px;
    border: 1px solid @clr_white;
    background-color: @clr_white;
    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.1);
  }

  .sys-form-content {
    padding: 20px 30px;
    overflow: hidden;
    border-radius: 12px;
    border: 1px solid @clr_white;
    background-color: @clr_white;
    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.1);
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
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

.input-number-container {
  height: 48px;
  display: flex;
  align-items: center;
  position: relative;
  .iconfont {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: @colorPrimary;
    font-weight: bold;
    font-size: 18px;
  }
}

.line-content {
  width: 100%;
  border-top: 1px dashed #808080;
}
</style>