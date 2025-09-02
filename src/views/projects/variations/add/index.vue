<template>
  <div>
    <vco-page-panel @back="backHandle" :title="isEdit ? t('编辑变更') : t('添加变更')"></vco-page-panel>

    <!-- 首次放款选择弹窗 -->
    <a-modal
      :open="selectVisible"
      :title="t('进度付款阶段')"
      :width="1500"
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
      :has-build="hasBuild"
      @refresh="refreshHandle"
    ></security-dialog>

    <div v-if="pageLoading" class="loading-container">
      <a-spin :spinning="pageLoading" size="large"></a-spin>
    </div>
    <div v-if="uuid && projectInfo && !pageLoading && canEdit" class="project-container">
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
            <a-col :span="[1, 2, 3].includes(Number(formState.type)) ? 16 : 12">
              <a-row :gutter="24">
                <a-col :span="[1, 2, 3].includes(Number(formState.type)) ? 8 : 24">
                  <a-form-item :label="t('变更开始日期')" name="start_date">
                    <a-date-picker
                      v-model:value="formState.start_date"
                      :format="selectDateFormat()"
                      valueFormat="YYYY-MM-DD"
                      :disabledDate="[1, 2, 3].includes(Number(formState.type)) ? endDisabledDate : disabledDate"
                      :defaultPickerValue="[1, 2, 3].includes(Number(formState.type)) ? endDefaultPickerValue : defaultPickerValue"
                      :showToday="false"
                      @change="dateChange('start_date')"
                    />
                  </a-form-item>
                </a-col>
                <template v-if="[1, 2, 3].includes(Number(formState.type))">
                  <a-col :span="8">
                    <a-form-item :label="t('延长周期')" name="extend_month">
                      <a-form-item-rest>
                        <div class="flex gap-2">
                          <a-input-number
                            v-model:value="formState.extend_month"
                            :min="0"
                            :precision="0"
                            :placeholder="t('月1')"
                            :controls="false"
                            @input="extendCycleInput"
                          >
                            <template #addonAfter>
                              <span>{{ t('月1') }}</span>
                            </template>
                          </a-input-number>
                          <a-input-number
                            v-model:value="formState.extend_day"
                            :min="0"
                            :max="30"
                            :precision="0"
                            :placeholder="t('天1')"
                            :controls="false"
                            @input="extendCycleInput"
                          >
                            <template #addonAfter>
                              <span>{{ t('天1') }}</span>
                            </template>
                          </a-input-number>
                        </div>
                      </a-form-item-rest>
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
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
                <a-col :span="24" v-if="initDrawdownData.length" style="position: relative; top: -10px;">
                  <a-checkbox
                    v-model:checked="initDrawdownSel"
                    class="mt-1"
                    style="font-size: 12px;"
                    @change="initDrawdownCheckedChange"
                  >{{ t('所选日期存在放款数据，是否将其设置为变更后首次放款') }}</a-checkbox>
                </a-col>
                
              </a-row>
            </a-col>
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
              <i class="iconfont" v-if="securityAmount < 0">&#xe711;</i>
              <i class="iconfont" v-else>&#xe712;</i>
            </a-col>
            <a-col :span="7">
              <a-form-item :label="t('变更值')">
                <div class="input-number-container">
                  <a-input-number
                    v-model:value="showSecurityAmount"
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
                <a-form-item :label="t('变更值')" name="changeCost">
                  <DevCostDetail
                    :dataJson="devCostJsonData"
                    :disabledGST="true"
                    :disabledLoan="true"
                    :disabledModel="true"
                    :is-variation="true"
                    :has-build="hasBuild"
                    :uuid="uuid"
                    :remain-land-amount="Number(projectInfo?.base?.remain_land_amount) || 0"
                    :is-plus="[1, 4].includes(Number(formState.type))"
                    @change="devCostChange"
                    @clearBuild="clearBuildHandle"
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
                <a-form-item class="w-full-label" name="buildChangeNum">
                  <template #label>
                    <div class="w-full flex justify-between items-center">
                      <p>{{ t('变更值') }} (<span :class="hasBuild ? 'text-green-500' : 'text-red-500'">{{ hasBuild ? t('已设置') : t('未设置') }}</span>)</p>
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
              <template v-if="[1, 2, 4, 5].includes(formState.type)">
                <a-col :span="7">
                  <a-form-item class="w-full-label" name="initial_land_amount">
                    <template #label>
                      <div class="w-full flex justify-between items-center">
                        <p>{{ t('首次土地贷款放款额') }}</p>
                        <p>{{ t('最大值') }}: ${{ numberStrFormat(maxLandAmount) }}</p>
                      </div>
                    </template>

                    <div class="input-number-container">
                      <a-input-number
                        v-model:value="formState.initial_land_amount"
                        :max="maxLandAmount"
                        :min="0"
                        :formatter="
                          (value) =>
                            `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                        "
                        :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                        @input="formRef.clearValidate('initial_amount')"
                      />
                    </div>
                  </a-form-item>
                </a-col>
                <a-col :span="1" class="plus-txt">
                  <i class="iconfont">&#xe712;</i>
                </a-col>
                <a-col :span="7">
                  <a-form-item :label="t('首次建筑贷款放款额')" name="initial_build_amount">
                    <a-select
                      v-if="initDrawdownSel"
                      v-model:value="formState.initial_sn"
                      :options="initDrawdownData"
                      @change="initDrawdownSelChange"
                    ></a-select>

                    <div v-else class="input-number-container">
                      <a-input-number
                        v-model:value="formState.initial_build_amount"
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
                <a-col :span="1" class="plus-txt">
                  <i class="iconfont">=</i>
                </a-col>
                <a-col :span="8">
                  <a-form-item :label="t('变更后首次放款')" name="initial_amount">
                    <div class="input-number-container">
                      <vco-number
                        :value="initialAmount"
                        :bold="true"
                        size="fs_ml"
                        :precision="2"
                      ></vco-number>
                    </div>
                  </a-form-item>
                </a-col>
              </template>
              
            </template>

            <div v-if="colItemsRef.length" class="w-full flex flex-wrap">
              <a-col :span="24"><div class="pt-5" style="border-top: 1px dashed #282828"></div></a-col>
              <template v-if="colItemsRef.length">
                <template v-for="item in colItemsRef" :key="item.credit_table">
                  <a-col :span="getItemsSpan">
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
    <div v-if="!pageLoading && canEdit" class="mt-10 flex justify-end">
      <a-button type="dark" class="big shadow bold uppercase"
        :loading="submitLoading"
        @click="submitHandle"
      >{{ t('提交') }}</a-button>
    </div>
  </div>
  
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { projectDetail } from '@/api/project/project';
import { systemDictData } from '@/api/system';
import { projectCreditVariation, projectVariationDrawdownSel, borkerFeeCalc, dischargeStatistics, projectVariationEdit } from '@/api/project/loan';
import { projectVariationInfo } from '@/api/project/variation';
import { ruleCredit } from '@/api/process';
import { useI18n } from 'vue-i18n';
import DevCostDetail from '@/views/process/temp/default/components/DevCostDetail.vue';
import tool, { navigationTo, selectDateFormat, numberStrFormat, formatMoneyToNumber } from '@/utils/tool';
import BaseCard from '@/views/projects/about/components/base.vue';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';
import securityDialog from './components/security-dialog.vue';
import ViewContent from './components/view-content.vue';
import { hasPermission } from '@/directives/permission/index';

const { t } = useI18n();

const pageLoading = ref(false);
const router = useRouter();
const route = useRoute();
const uuid = ref(route.query.uuid);
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

  if (!currentVariationId.value) {
    pageLoading.value = false;
  }
  

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
  createFormItems()

  // 根据变更类型设置默认开始日期
  let defaultDate = '';
  if ([1, 2, 3].includes(Number(val))) {
    // 延期类型使用项目结束日期+1天
    defaultDate = dayjs(projectInfo.value.date.end_date).add(1, 'day').format('YYYY-MM-DD');
  } else {
    // 其他类型使用变更开始日期+1天
    defaultDate = dayjs(projectInfo.value.date.var_start_date).add(1, 'day').format('YYYY-MM-DD');
  }

  const params = {
    uuid: uuid.value,
    type: val,
    start_date: defaultDate,
    devCostDetail: [],
    build: [],
    build_log: [],
    amount: 0,
    initial_amount: 0,
    land_amount: 0,
    initial_land_amount: 0,
    build_amount: 0,
    initial_build_amount: 0
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
  changeCost: '',
  buildChangeNum: '',
  initial_land_amount: '',
  initial_build_amount: '',
  initial_amount: '',
  extend_month: '',
  extend_day: '',
  note: '',
  initial_sn: ''
});

const initialAmount = computed(() => {
  return Number(tool.plus(formState.value.initial_land_amount, formState.value.initial_build_amount))
})

const maxLandAmount = computed(() => {
  const remain_land_amount = Number(projectInfo.value.base.remain_land_amount || 0)
  const toolFn = [1, 4].includes(Number(formState.value.type)) ? tool.plus : tool.minus
  const landNum = Number(landChangeNum.value || 0)
  return toolFn(remain_land_amount, landNum)
})

const changeCost = computed(() => {
  const data = cloneDeep(devCostJsonData.value);
  let num = 0;
  if (data.length) {
    const itemData = data[0].data[0].list || []
    // 平铺itemData 并计算change_value 的合
    const flatData = itemData.flatMap((item) => item.list || []);
    const mergeData = [...itemData, ...flatData];
    const changeValue = mergeData.reduce((acc, item) => tool.plus(acc, item.change_value || 0), 0);
    num = changeValue;
  }

  formState.value.changeCost = num;

  formRef.value && formRef.value.clearValidate('changeCost')
  return num;
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

const validateChangeCost = () => {
  return (rule, value) => {
    if (Number(value) === 0) {
      return Promise.reject(t('请设置') + t('开发成本变更值'));
    } else {
      return Promise.resolve();
    }
  }
}

const validateBuildChangeNum = () => {
  return () => {
    if (Number(buildChangeNum.value) === 0) {
      return Promise.resolve();
    } else {
      if (!hasBuild.value) {
        return Promise.reject(t('请设置') + t('进度付款'));
      } else {
        return Promise.resolve();
      }
    }
  }
}

const validateInitialAmount = () => {
  return () => {
    if (Number(initialAmount.value) === 0) {
      return Promise.reject(t('请设置') + t('首次放款总金额'));
    } else {
      return Promise.resolve();
    }
  }
}

const formRules = ref({
  type: [{ required: true, message: t('请选择') + t('变更类型'), trigger: 'change' }],
  amount: [{ required: true, message: t('请输入') + t('总金额'), trigger: 'change' }],
  start_date: [{ required: true, message: t('请选择') + t('变更开始日期'), trigger: 'change' }],
  end_date: [{ required: true, message: t('请选择') + t('变更结束日期'), trigger: 'change' }],
  changeCost: [{ required: true, validator: validateChangeCost(), trigger: 'change' }],
  buildChangeNum: [{ required: true, validator: validateBuildChangeNum(), trigger: 'change' }],
  // initial_amount: [{ required: true, validator: validateInitialAmount(), trigger: 'blur' }]
});

const disabledDate = (current) => {
  const startDate = dayjs(projectInfo.value.date.var_start_date);
  return (current && current.isBefore(startDate.startOf('day').add(1, 'day')));
};

const defaultPickerValue = computed(() => {
  return dayjs(projectInfo.value.date.var_start_date).add(1, 'day');
});

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
    formState.value.initial_build_amount = formatMoneyToNumber(amount);
  } else {
    formState.value.initial_build_amount = '';
  }
};

const initDrawdownCheckedChange = () => {
  formState.value.initial_build_amount = '';
  formState.value.initial_sn = '';
  selectedData.value = []
}

const getInitDradownData = async (flag = false) => {
  await projectVariationDrawdownSel({
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

const endDateChange = () => {
  const end_date = formState.value.end_date
  if (end_date) {
    const startDate = projectInfo.value.date.end_date
    const calcDay = tool.calculateDurationPrecise(startDate, end_date)
    formState.value.extend_month = calcDay.months
    formState.value.extend_day = calcDay.days
  } else {
    formState.value.extend_month = ''
    formState.value.extend_day = ''
  }
}

const dateChange = (type) => {
  // 清除当前字段的校验错误
  if (formRef.value) {
    formRef.value && formRef.value.clearValidate([type]);
  }
  
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

    // 提价时间数据
    submitSingleRquest('start_date', formState.value.start_date ? startDate.format('YYYY-MM-DD') : '')
  }

  if (type == 'end_date') {
    endDateChange()
    submitSingleRquest('end_date', formState.value.end_date ? dayjs(formState.value.end_date).format('YYYY-MM-DD') : '')
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
  if (!isEdit.value) {
    currentVariationId.value = id;
    const obj = JSON.parse(localStorage.getItem('variationId') || '{}');
    obj[uuid.value] = id;
    localStorage.setItem('variationId', JSON.stringify(obj));
  }
}

const securityData = ref([])
const securityAmount = computed(() => {
  if (securityData.value.length) {
    const oldNum = securityData.value.reduce((acc, item) => tool.plus(acc, Number(item.old_amount || 0)), 0);

    const nowData = securityData.value.filter(item => !item.is_delete)
    const nowNum = nowData.reduce((acc, item) => tool.plus(acc, Number(item.amount || 0)), 0);
    return tool.minus(nowNum, oldNum);
  } else {
    return 0;
  }
})
const showSecurityAmount = computed(() => {
  return Math.abs(securityAmount.value)
})

const changeSecurityAfter = computed(() => {
  return tool.plus(statistics.value.all_money, securityAmount.value);
})

const currentVariationId = ref('')
const variationData = ref(null)
// 请求变更详情
const getVariationDetail = async () => {
  await projectVariationInfo({
    uuid: uuid.value,
    id: currentVariationId.value
  }).then((res) => {
    variationData.value = res
    securityData.value = res.security || [];
    formState.value.type = res.type || '';
    formState.value.start_date = res.start_date || '';
    formState.value.end_date = res.end_date || '';
    formState.value.initial_sn = res.initial_sn || ''
    formState.value.initial_land_amount = res.initial_land_amount || ''
    formState.value.initial_build_amount = res.initial_build_amount || ''
    formState.value.note = res.note || ''
    selectedData.value = res.build_log || []

    devCostJsonData.value = res.devCostDetail && res.devCostDetail.length ? res.devCostDetail : projectInfo.value.base.devCostDetail;
  })
}

const hasBuild = computed(() => {
  if (variationData.value) {
    const data = variationData.value?.build || {}
    const bData = data?.data || {}
    const sData = data?.summary || {}
    return Boolean(Object.keys(bData).length > 0 || Object.keys(sData).length > 0)
  } else {
    return false
  }
})

const refreshHandle = (id) => {
  setVariationIdStore(id);
  getVariationDetail();
}

const selectVisible = ref(false)
const selectedData = ref([])
const selectDoneHandle = (data) => {
  const build__data = cloneDeep(data.build__data)
  selectedData.value = build__data
  formState.value.initial_build_amount = data.total
  selectVisible.value = false

  formRef.value && formRef.value.clearValidate('initial_amount')
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
const createFormItems = () => {
  const creditInfo = cloneDeep(creditVariationinfo.value);

  if (formState.value.type === 5) {
    delete creditInfo.credit_estabFee;
    delete creditInfo.credit_estabFeeRate;
    delete creditInfo.credit_LineFeeRate;
    delete creditInfo.credit_brokerFee;
    delete creditInfo.credit_brokerFeeRate;
  }

  const keyArr = [];
  for (const key in creditInfo) {
    formState.value[key] = passFormInit(key) ? '' : creditInfo[key];
    if (['credit_brokerFeeRate', 'credit_estabFeeRate'].includes(key)) {
      formState.value[key] = 0
    }
    keyArr.push(key);
  }

  let colItems = creditData.value.filter((item) => keyArr.includes(item.credit_table));
  const has_linefee = Boolean(projectInfo.value.base.has_linefee);
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

const getCreditVal = async () => {
  await projectCreditVariation({
    apply_uuid: uuid.value
  }).then((res) => {
    creditVariationinfo.value = res;

    createFormItems();
  });
};

const getCreditInfo = async () => {
  await ruleCredit().then(async (res) => {
    creditData.value = res || [];
    await getCreditVal();
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
const borkerFeeCalcHandle = () => {
  loadingBorkerFeeCalcAmount.value = true;
  borkerFeeCalc({ uuid: uuid.value, start_date: formState.value.start_date })
    .then((res) => {
      borkerFeeCalcAmount.value = res;
      handInput('credit_brokerFeeRate');
      handInput('credit_estabFeeRate');
    })
    .finally(() => {
      loadingBorkerFeeCalcAmount.value = false;
    });
}
watch(
  type_startDate,
  (val) => {
    // 变更自动计算broker fee
    if ([1, 2, 3, 4].includes(val.type)) {
      if (val.start_date) {
        borkerFeeCalcAmount.value = 0;
        borkerFeeCalcHandle()
      } else {
        borkerFeeCalcAmount.value = 0
        handInput('credit_brokerFeeRate');
        handInput('credit_estabFeeRate');
      }
    }
  },
  { deep: true }
);

const calcSameTermBroker = (flag = false) => {
  const num = loanMoneyChangeNum.value || 0
  const brokerFeeRate = formState.value.credit_brokerFeeRate || 0
  const credit_brokerFee = formState.value.credit_brokerFee || 0

  if (flag) {
    const rate = Number(tool.div(brokerFeeRate, 100))
    formState.value.credit_brokerFee = Number(tool.times(num, rate)).toFixed(2)
  } else {
    const rate = Number(tool.div(credit_brokerFee, num))
    formState.value.credit_brokerFeeRate = Number(tool.times(rate, 100)).toFixed(2)
  }
}

const calcExtendTermEstab = (flag = false) => {
  const credit_estabFeeRate = Number(formState.value.credit_estabFeeRate || 0) > 0 ? Number(formState.value.credit_estabFeeRate || 0) : 0
  const credit_estabFee = Number(formState.value.credit_estabFee || 0) > 0 ? Number(formState.value.credit_estabFee || 0) : 0
  let num = Number(borkerFeeCalcAmountRef.value || 0)

  if (formState.value.type !== 4) {
    const legalFee = Number(formState.value.credit_legalFee || 0) > 0 ? Number(formState.value.credit_legalFee || 0) : 0
    const otherFee = Number(formState.value.credit_otherFee || 0) > 0 ? Number(formState.value.credit_otherFee || 0) : 0
    const brokerFee = Number(formState.value.credit_brokerFee || 0) > 0 ? Number(formState.value.credit_brokerFee || 0) : 0

    const loFee = Number(tool.plus(legalFee, otherFee))
    const brFee = Number(tool.plus(loFee, brokerFee))
    const fNum = Number(tool.plus(num, brFee))
    const cNum = Number(loanMoneyChangeNum.value || 0)
    const toolFn = [1].includes(formState.value.type) ? tool.plus : tool.minus
    num = Number(toolFn(fNum, cNum))
  } else {
    const legalFee = Number(formState.value.credit_legalFee || 0) > 0 ? Number(formState.value.credit_legalFee || 0) : 0
    const otherFee = Number(formState.value.credit_otherFee || 0) > 0 ? Number(formState.value.credit_otherFee || 0) : 0
    const brokerFee = Number(formState.value.credit_brokerFee || 0) > 0 ? Number(formState.value.credit_brokerFee || 0) : 0

    const loFee = Number(tool.plus(legalFee, otherFee))
    const brFee = Number(tool.plus(loFee, brokerFee))
    const cNum = Number(loanMoneyChangeNum.value || 0)
    num = Number(tool.plus(brFee, cNum))
  }

  if (formState.value.start_date) {
    if (flag) {
      formState.value.credit_estabFee = Number(tool.times(tool.div(credit_estabFeeRate, 100), num)).toFixed(2)
    } else {
      formState.value.credit_estabFeeRate = Number(tool.times(tool.div(credit_estabFee, num), 100)).toFixed(2)
    }
  } else {
    if (flag) {
      formState.value.credit_estabFee = 0
    } else {
      formState.value.credit_estabFeeRate = 0
    }
  }
}

watch(
  () => loanMoneyChangeNum.value,
  () => {
    if ([4].includes(type_startDate.value.type)) {
      calcSameTermBroker(true)
    }
    if ([1, 2, 3, 4].includes(type_startDate.value.type)) {
      handInput('credit_brokerFeeRate')
      calcExtendTermEstab(true)
    }
  },
  { deep: true }
);

const handInput = (key) => {
  // 中介费
  if (['credit_brokerFeeRate', 'credit_brokerFee'].includes(key)) {
    const credit_brokerFeeRate = Number(formState.value.credit_brokerFeeRate || 0) > 0 ? Number(formState.value.credit_brokerFeeRate || 0) : 0
    const credit_brokerFee = Number(formState.value.credit_brokerFee || 0) > 0 ? Number(formState.value.credit_brokerFee || 0) : 0
    const varNum = Number(loanMoneyChangeNum.value || 0)
    const resNum = Number(borkerFeeCalcAmountRef.value || 0)
    const toolFn = [1].includes(formState.value.type) ? tool.plus : tool.minus
    const num = Number(toolFn(resNum, varNum))

    if (key == 'credit_brokerFeeRate') {
      if (formState.value.type === 4) {
        calcSameTermBroker(true)
      } else {
        if (formState.value.start_date) {
          formState.value.credit_brokerFee = Number(tool.times(tool.div(credit_brokerFeeRate, 100), num)).toFixed(2)
        } else {
          formState.value.credit_brokerFee = 0
        }
      }
    }
    if (key == 'credit_brokerFee') {
      if (formState.value.type === 4) {
        calcSameTermBroker(false)
      } else {
        if (formState.value.start_date) {
          formState.value.credit_brokerFeeRate = Number(tool.times(tool.div(credit_brokerFee, num), 100)).toFixed(2)
        } else {
          formState.value.credit_brokerFeeRate = 0
        }
      }
    }
    calcExtendTermEstab(true)
  }

  // 建立费
  if (['credit_estabFeeRate', 'credit_estabFee'].includes(key)) {
    calcExtendTermEstab(key === 'credit_estabFeeRate')
  }
  if (['credit_legalFee', 'credit_otherFee'].includes(key) && [1, 2, 3, 4].includes(formState.value.type)) {
    calcExtendTermEstab(true)
  }
};

const extendCycleInput = () => {
  const { end_date } = projectInfo.value.date;
  const months = formState.value.extend_month || 0;
  const days = formState.value.extend_day || 0;

  if (!isNaN(months) && !isNaN(days)) {
    if (months || days) {
      const endDate = tool.calculateEndDate(dayjs(end_date), months, days)
      formState.value.end_date = endDate
    } else {
      formState.value.end_date = ''
    }
  }

  formRef.value.validateFields('end_date')
  submitSingleRquest('end_date', formState.value.end_date ? dayjs(formState.value.end_date).format('YYYY-MM-DD') : '')
}

const submitSingleRquest = (key, value) => {
  const params = {
    [key]: value,
    uuid: uuid.value
  }

  if (currentVariationId.value) {
    params.id = currentVariationId.value
  }

  projectVariationEdit(params).then(res => {
    setVariationIdStore(res.id);
    getVariationDetail();
  })
}

const clearBuildHandle = () => {
  submitSingleRquest('build', '')
  if (!initDrawdownSel.value) {
    selectedData.value = []
    formState.value.initial_build_amount = ''
  }
}

const submitLoading = ref(false)
const submitHandle = () => {
  formRef.value
    .validate()
    .then(() => {
      const params = {
        uuid: uuid.value,
        id: currentVariationId.value,
        do__save: 1,
        type: formState.value.type,
        start_date: formState.value.start_date,
        end_date: formState.value.end_date,
        initial_sn: formState.value.initial_sn || '',
        initial_land_amount: formState.value.initial_land_amount || 0,
        initial_build_amount: formState.value.initial_build_amount || 0,
        initial_amount: initialAmount.value || 0,
        land_amount: landChangeAfterNum.value || 0,
        build_amount: buildChangeAfterNum.value || 0,
        amount: loanMoneyChangeNum.value || 0,
        build_log: cloneDeep(selectedData.value) || [],
        note: formState.value.note || ''
      }
      const credit = {};
      for (let i = 0; i < colItemsRef.value.length; i++) {
        credit[colItemsRef.value[i].credit_table] = formState.value[colItemsRef.value[i].credit_table]
        delete params[colItemsRef.value[i].credit_table]
      }

      params.credit = credit;

      submitLoading.value = true
      projectVariationEdit(params).then(res => {
        submitLoading.value = false
        // 清除已经缓存的数据
        const obj = JSON.parse(localStorage.getItem('variationId') || '{}');
        delete obj[uuid.value];
        localStorage.setItem('variationId', JSON.stringify(obj));

        navigationTo(`/projects/variations-details/about?uuid=${uuid.value}&id=${res.id}`)
      }).catch(() => {
        submitLoading.value = false
      })
    })
    .catch((error) => {
      const { values } = error;
      let top = 100
      if (!values.initial_build_amount) {
        top = 300
      }
      if (!values.buildChangeNum) {
        top = 200
      }

      window.scrollTo({
        top,
        behavior: 'smooth'
      });
    });
}

const isEdit = ref(false);
const canEdit = computed(() => {
  if (isEdit.value) {
    return variationData.value?.state === 0 && hasPermission('projects:variations:edit')
  }
  return true
})

const editDataFull = () => {
  if (variationData.value.initial_sn) {
    initDrawdownSel.value = true
  }
  const credit = variationData.value.credit
  for (const key in credit) {
    formState.value[key] = credit[key]
  }
}

onMounted(async () => {
  if (uuid.value) {
    const { id } = route.query;
    if (id) { // 编辑
      document.title = t('编辑变更')
      isEdit.value = true;
    }
    const obj = JSON.parse(localStorage.getItem('variationId') || '{}');
    if (id || obj[uuid.value]) {
      currentVariationId.value = id || obj[uuid.value];
    }

    await getProjectDetail();
    getTypeData();
    getsecurityInfo()

    if (id || obj[uuid.value]) {
      await getVariationDetail();
      pageLoading.value = false;

      if (formState.value.start_date) {
        getInitDradownData()
      }
      endDateChange()

      if (canEdit.value) {
        editDataFull()
      }
    }
    await getCreditInfo();
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
  height: 50px;
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