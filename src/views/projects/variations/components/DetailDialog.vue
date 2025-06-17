<template>
  <a-modal :open="visible" :title="t(titleTxt)" :width="830" :footer="null" :keyboard="false" :maskClosable="false" @cancel="updateVisible(false)">
    <!-- 拒接、退回弹窗 -->
    <reject-dialog v-model:visible="rejectVisible" :uuid="uuid" :id="detailData.id" :type="rejectType" :about="true" @done="doneHandle"> </reject-dialog>

    <!-- 确认变更时间弹窗 -->
    <a-modal v-model:open="showConfirm" :width="500" :title="t('确认变更')" :footer="null">
      <div class="sys-form-content mt-5">
        <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
          <a-form-item :label="t('变更开始日期')" name="start_date">
            <a-date-picker v-model:value="formState.start_date" :format="selectDateFormat()" :disabledDate="disabledDate" :disabled="detailData.mark == 'variation_overdue_open'" placeholder="" @change="dateChange" />
          </a-form-item>
          <!-- <a-form-item :label="t('开发成本')" name="devCost">
            <DevCostDetail :dataJson="DevCostData.devCostDetail || projectDetail?.base?.devCostDetail" :disabledGST="true" :DevCostDetail="true" @change="saveDevCostData">
              <a-input-number :value="DevCostData.devCost || projectDetail?.base?.devCost" :max="99999999999" readonly :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="(value) => value.replace(/\$\s?|(,*)/g, '')" />
            </DevCostDetail>
          </a-form-item> -->
        </a-form>
      </div>

      <a-row v-if="![4, 5].includes(detailData.type)" :gutter="24">
        <a-col :span="10" class="mt-2">
          <div class="info-content">
            <p class="name">{{ t('预计项目周期') }}</p>
            <p class="txt">{{ tool.showDate(startDate) + ' - ' + tool.showDate(endDate) }}</p>
          </div>
        </a-col>
        <a-col :span="9" class="mt-2">
          <div class="info-content">
            <p class="name">{{ t('借款周期') }}</p>
            <p class="txt">{{ showTerm }}</p>
          </div>
        </a-col>
        <a-col :span="5" class="mt-2">
          <div class="info-content">
            <p class="name">{{ t('总天数') }}</p>
            <p class="txt">{{ showTotalDay }}</p>
          </div>
        </a-col>
      </a-row>
      <!-- <a-row :gutter="24">
        <a-col :span="24" class="mt-2 cursor-pointer">
          <DevCostDetail :dataJson="DevCostData.devCostDetail || projectDetail?.base?.devCostDetail" :disabledGST="true" @change="saveDevCostData">
            <p class="color_grey fs_xs">Total Development Cost <i class="iconfont color_coal">&#xe76f;</i></p>
            <vco-number :value="DevCostData.devCost || projectDetail?.base?.devCost" :bold="true" size="fs_xl" :precision="2"></vco-number>
          </DevCostDetail>
        </a-col>
      </a-row> -->

      <div class="mt-10 flex justify-end">
        <a-button type="dark" class="big shadow bold uppercase mb-5 mt-5 w-full" :loading="confirmLoading" @click="openHandle">{{ t('确认') }}</a-button>
      </div>
    </a-modal>

    <a-row v-if="detailData && projectDetail" :gutter="24" class="pl-10 pr-10">
      <a-col v-if="detailData.cancel_reason || detailData.decline_reason" :span="24" class="mt-5">
        <a-alert :message="detailData.cancel_reason ? t('退回原因') : t('拒绝原因')" :description="detailData.cancel_reason || detailData.decline_reason" type="error" class="cancel-reason" />
      </a-col>

      <a-col :span="8" class="item-txt">
        <p>{{ t('变更类型') }}</p>
        <p>{{ detailData.type_name || '--' }}</p>
      </a-col>
      <a-col :span="8" class="item-txt">
        <p>{{ t('变更开始日期') }}</p>
        <p>{{ detailData.start_date ? tool.showDate(detailData.start_date) : '--' }}</p>
      </a-col>
      <a-col :span="8" class="item-txt">
        <p>{{ t('变更后结束日期') }}</p>
        <div v-if="detailData.end_date" class="change-content">
          <p>{{ tool.showDate(projectDetail.date.end_date) }}</p>
          <i class="iconfont">&#xe794;</i>
          <p>{{ tool.showDate(detailData.end_date) }}</p>
        </div>
        <div v-else class="change-info">
          <p>{{ tool.showDate(projectDetail.date.end_date) }}</p>
          <p>({{ t('到期日期') }})</p>
        </div>
      </a-col>
      <a-col :span="8" class="item-txt">
        <p>{{ t('变更后首次放款') }}</p>
        <vco-number :value="detailData.initial_amount" :precision="2"></vco-number>
      </a-col>
      <a-col :span="16" class="item-txt">
        <p>{{ t('变更后借款总金额') }}</p>
        <div class="change-amount">
          <vco-number :value="projectDetail.base.loan_money" color="#888888" :precision="2"></vco-number>
          <i class="iconfont" v-if="[1, 4].includes(Number(detailData.type))">&#xe712;</i>
          <i class="iconfont" v-else>&#xe711;</i>
          <vco-number :value="detailData.amount" color="#F19915" :precision="2"></vco-number>
          <i class="iconfont">&#xe609;</i>
          <div class="total-amount">
            <vco-number v-if="visible" :value="newTotalAmount" :color="Number(detailData.amount) ? ([1, 4].includes(Number(detailData.type)) ? '#eb4b6d' : '#31bd65') : '#282828'" :precision="2"></vco-number>
            <p v-if="!Number(detailData.amount)">{{ t('借款总金额') }}</p>
          </div>
        </div>
      </a-col>
      <a-col v-if="detailData.note" :span="24" class="item-txt">
        <p>{{ t('说明') }}</p>
        <p>{{ detailData.note }}</p>
      </a-col>
      <div v-if="creditItemsData.length" class="flex flex-wrap mt-5">
        <a-col :span="24"><div class="mt-5" style="border-top: 1px dashed #282828"></div></a-col>
        <a-col v-for="(item, index) in creditItemsData" :span="8" class="item-txt" :key="index">
          <p>{{ item.credit_name }}</p>
          <div class="change-content">
            <p v-if="item.is_ratio">{{ creditOldinfo[item.credit_table] }}%</p>
            <vco-number v-else :value="creditOldinfo[item.credit_table]" color="#888888" :precision="2"></vco-number>
            <i class="iconfont">&#xe794;</i>
            <p v-if="item.is_ratio">{{ detailData.credit[item.credit_table] }}%</p>
            <vco-number v-else :value="item.variation_add ? tool.plus(detailData?.credit[item.credit_table], creditOldinfo[item.credit_table]) : detailData?.credit[item.credit_table]" :precision="2"></vco-number>
          </div>
        </a-col>
      </div>
    </a-row>

    <div class="mt-10 mb-5">
      <div class="flex justify-end gap-5">
        <a-button type="grey" class="big shadow bold uppercase mb-5 mt-5" @click="updateVisible(false)">{{ t('关闭') }}</a-button>

        <a-button v-if="detailData.has_permission" type="brown" class="big shadow bold uppercase mb-5 mt-5" @click="rejectHandle('variationsBack')">{{ t('退回请求') }}</a-button>

        <template v-if="detailData.has_permission">
          <a-button v-if="detailData.mark === 'variation_lm' || detailData.mark === 'variation_overdue_open'" type="dark" class="big shadow bold uppercase mb-5 mt-5" @click="showOpenDialog">{{ t('确认变更') }}</a-button>

          <a-popconfirm v-else :title="t('您确定要接受该请求吗？')" @confirm="accept">
            <a-button type="dark" class="big shadow bold uppercase mb-5 mt-5">{{ t('接受请求') }}</a-button>
          </a-popconfirm>
        </template>
      </div>

      <div v-if="detailData.has_permission" class="flex flex-col justify-end items-end">
        <p class="color_grey fs_xs my-3">{{ t('您可以点击下面的按钮来拒绝请求。') }}</p>
        <div class="flex justify-center">
          <a-button type="danger" size="small" shape="round" @click="rejectHandle('variationsDecline')">{{ t('拒绝请求') }}</a-button>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { projectCreditVariation } from '@/api/project/loan';
import { ruleCredit } from '@/api/process';
import { projectVariationSaveStep } from '@/api/project/variation';
import tool, { selectDateFormat } from '@/utils/tool';
import { cloneDeep } from 'lodash';
import RejectDialog from '@/views/process/components/RejectDialog.vue';
import dayjs from 'dayjs';
import DevCostDetail from '@/views/process/temp/default/components/DevCostDetail.vue';
import { saveDevCost } from '@/api/project/project';

const emits = defineEmits(['update:visible', 'done']);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  uuid: {
    type: String,
    default: ''
  },
  detailData: {
    type: Object,
    default: () => {}
  },
  projectDetail: {
    type: Object,
    default: () => {}
  }
});

const { t } = useI18n();

const titleTxt = computed(() => {
  let txt = '';
  if (props.detailData?.has_permission) {
    txt = '审核变更请求';
  } else {
    txt = '变更详情';
  }
  return txt;
});

/* 更新visible */
const updateVisible = (value) => {
  emits('update:visible', value);
};

const newTotalAmount = computed(() => {
  const total = Number(props.projectDetail.base.loan_money);
  const num = Number(props.detailData.amount);
  const isPlus = [1, 4].includes(Number(props.detailData.type));

  let res = 0;
  if (isPlus) {
    res = tool.plus(total, num);
  } else {
    res = tool.minus(total, num);
  }

  return res;
});

const creditData = ref([]);
const creditOldinfo = ref({});
const creditItemsData = ref([]);

const getCreditVal = () => {
  projectCreditVariation({
    apply_uuid: props.uuid
  }).then((res) => {
    const creditInfo = cloneDeep(res);

    if (props.detailData.type === 5) {
      delete creditInfo.credit_estabFeeRate;
      delete creditInfo.credit_LineFeeRate;
    }

    const keyArr = [];
    for (const key in creditInfo) {
      keyArr.push(key);
    }

    let colItems = creditData.value.filter((item) => keyArr.includes(item.credit_table));
    const has_linefee = Boolean(props.projectDetail.base.has_linefee);
    if (!has_linefee) {
      colItems = colItems.filter((item) => !item.is_linefee);
    }

    const perData = colItems.filter((item) => item.is_ratio);
    const dolData = colItems.filter((item) => !item.is_ratio);

    creditOldinfo.value = res;
    creditItemsData.value = [...perData, ...dolData];
  });
};

const getCreditInfo = () => {
  ruleCredit().then((res) => {
    creditData.value = res || [];
    getCreditVal();
  });
};

const rejectVisible = ref(false);
const rejectType = ref('');
const rejectHandle = (type) => {
  rejectType.value = type;
  rejectVisible.value = true;
};

const doneHandle = () => {
  updateVisible(false);
  emits('done');
};

const accept = async () => {
  await projectVariationSaveStep({ id: props.detailData?.id, uuid: props.uuid })
    .then((res) => {
      doneHandle();
      return true;
    })
    .catch(() => {
      return false;
    });
};

const confirmLoading = ref(false);
const showConfirm = ref(false);

const formRef = ref();
const formState = ref({
  start_date: ''
});

const formRules = ref({
  start_date: [{ required: true, message: t('请选择') + t('变更开始日期'), trigger: 'change' }]
});

const startDate = ref('');
const endDate = ref('');

const showTerm = computed(() => {
  const data = tool.calculateDurationPrecise(startDate.value, endDate.value);
  if (data.months && data.days) {
    return `${data.months} ${t('月')} ${data.days} ${t('天')}`;
  }

  if (data.months && !data.days) {
    return `${data.months} ${t('月')}`;
  }

  if (!data.months && data.days) {
    return `${data.days} ${t('天')}`;
  }

  return '--';
});

const showTotalDay = computed(() => {
  const data = tool.calculateDurationPrecise(startDate.value, endDate.value);
  return data.gapDay || 0;
});

const showOpenDialog = () => {
  showConfirm.value = true;

  startDate.value = props.detailData.start_date;

  const currentDate = dayjs();
  const startDateDay = dayjs(props.detailData.start_date);

  if (startDateDay.isAfter(currentDate)) {
    formState.value.start_date = currentDate
  } else {
    formState.value.start_date = startDateDay
  }
  endDate.value = props.detailData.end_date;
};

const DevCostData = ref({
  devCost: '',
  devCostDetail: ''
});
// 保存开发成本
const saveDevCostData = (val) => {
  DevCostData.value = val;
};
const editSaveDevCost = (params) => {
  saveDevCost({ uuid: props.uuid, ...DevCostData.value }).then((res) => {
    openHandleSubmit(params);
  });
};

const openHandle = () => {
  formRef.value.validate().then(() => {
    const params = {
      id: props.detailData.id,
      uuid: props.uuid,
      do__open: 1,
      start_date: startDate.value
    };

    if (![4, 5].includes(props.detailData.type)) {
      params.end_date = endDate.value;
    }

    confirmLoading.value = true;
    if (!DevCostData.value.devCostDetail) {
      openHandleSubmit(params);
    } else {
      editSaveDevCost(params);
    }
  });
};

const openHandleSubmit = (params) => {
  projectVariationSaveStep(params)
    .then(() => {
      confirmLoading.value = false;
      showConfirm.value = false;
      doneHandle();
    })
    .catch(() => {
      confirmLoading.value = false;
    });
};

const disabledDate = (currentDate) => {
  const startDate = dayjs(props.projectDetail.date.var_start_date);
  return currentDate && currentDate.isBefore(startDate.startOf('day').add(1, 'day')) || currentDate.valueOf() > Date.now();
};

const dateChange = (date) => {
  if (date) {
    const { start_date, end_date } = props.detailData;
    const calcDay = tool.calculateDurationPrecise(start_date, end_date);
    const gapDay = calcDay.gapDay;

    if (gapDay) {
      let statrDate = dayjs(date);
      const endDateStr = tool.calculateEndDateByDays(statrDate, gapDay);

      startDate.value = dayjs(date).format('YYYY-MM-DD');
      endDate.value = endDateStr;
    }
  } else {
    startDate.value = props.detailData.start_date;
    endDate.value = props.detailData.end_date;
  }
};

watch(
  () => props.visible,
  (val) => {
    if (val) {
      getCreditInfo();
    } else {
      rejectType.value = '';
      formRef.value?.clearValidate();
      formState.value.start_date = '';
    }
  }
);
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
.item-txt {
  margin-top: 25px;
  &.no {
    margin-top: 0;
  }
  &.total {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  > p {
    font-size: 13px;
    &:first-child {
      color: #999;
    }
    &:last-child {
      font-size: 14px;
      margin-top: 5px;
    }
  }
  :deep(.ant-statistic-content) {
    font-size: 16px !important;
  }
}

.change-content {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 5px;
  > p {
    font-size: 14px;
    &:first-child {
      color: #888;
    }
  }
  > i {
    font-size: 13px;
  }
}

.change-info {
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
  > p {
    font-size: 14px;
    color: #888;
    &:last-child {
      font-size: 12px;
    }
  }
}

.change-amount {
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.total-amount {
  position: relative;
  > p {
    font-size: 11px;
    color: #888;
    line-height: 1;
    position: absolute;
  }
}

.cancel-reason {
  padding: 10px !important;
  margin-bottom: 10px;
  :deep(.ant-alert-description) {
    font-size: 12px !important;
  }
}

.info-content {
  margin-top: 10px;
  .name {
    font-size: 12px;
    color: #666;
  }
  .txt {
    font-size: 13px;
    font-weight: 500;
    :deep(.ant-statistic-content) {
      font-size: 16px !important;
    }
  }
}
.color_coal {
  color: @colorPrimary;
  font-size: 14px;
}
</style>
