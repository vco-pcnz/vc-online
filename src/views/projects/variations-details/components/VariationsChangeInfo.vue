<template>
  <div class="block-main-content">
    <div class="change-item">
      <p class="title">{{ t('变更前') }}</p>
      <a-row :gutter="24" class="mt-5">
        <a-col :span="12" class="item-txt">
          <p class="name">{{ t('开始日期1') }}</p>
          <p class="txt">{{ tool.showDate(beforeData.start_date) }}</p>
        </a-col>
        <a-col :span="12" class="item-txt">
          <p class="name">{{ t('结束日期1') }}</p>
          <p class="txt">{{ tool.showDate(beforeData.end_date) }}</p>
        </a-col>
        <a-col :span="24" class="item-txt">
          <p class="name">{{ t('批准贷款金额') }}</p>
          <vco-number :value="beforeData.loan_money" :precision="2"></vco-number>
        </a-col>
        <a-col :span="24" class="item-txt">
          <p class="name">{{ t('建立费') }}</p>
          <vco-number :value="beforeData.estabFee" :precision="2"></vco-number>
        </a-col>
        <a-col :span="24" class="item-txt" v-if="detail?.base?.has_linefee">
          <p class="name">{{ t('额度费') }}</p>
          <vco-number :value="beforeData.lineFee" :precision="2"></vco-number>
        </a-col>
        <a-col :span="24" class="item-txt">
          <p class="name">{{ t('第二授信额度') }}</p>
          <vco-number :value="beforeData.credit_fc2" :precision="2"></vco-number>
        </a-col>
        <a-col :span="8" class="item-txt no">
          <p class="name">{{ t('利息') }}</p>
          <p class="txt">{{ beforeData.interestRate }}%</p>
        </a-col>
        <a-col :span="8" class="item-txt no">
          <p class="name">LVR</p>
          <p class="txt">{{ beforeData.lvr }}%</p>
        </a-col>
        <a-col :span="8" class="item-txt no">
          <p class="name">IRR</p>
          <p class="txt">{{ beforeData.irr }}%</p>
        </a-col>
      </a-row>
    </div>
    <div class="change-item middle">
      <p class="title">{{ t('变更值') }}</p>
      <a-row :gutter="24" class="mt-5">
        <a-col :span="12" class="item-txt">
          <p class="name">{{ t('变更开始日期') }}</p>
          <p class="txt">{{ tool.showDate(changeData.start_date) }}</p>
        </a-col>
        <a-col :span="12" class="item-txt">
          <p class="name">{{ t('变更总天数') }}</p>
          <p class="txt" :class="{ plus: Number(changeData.end_date) > 0, reduce: Number(changeData.end_date) < 0 }">
            <i class="iconfont" v-if="Number(changeData.end_date) > 0" style="color: #31bd65">&#xe712;</i>
            <i class="iconfont" v-if="Number(changeData.end_date) < 0" style="color: #eb4b6d">&#xe711;</i>
            <span>{{ Math.abs(Number(changeData.end_date)) }}</span>
          </p>
        </a-col>
        <a-col :span="24" class="item-txt">
          <p class="name">{{ t('变更金额') }}</p>
          <p class="txt" :class="{ plus: Number(changeData.loan_money) > 0, reduce: Number(changeData.loan_money) < 0 }">
            <i class="iconfont" v-if="Number(changeData.loan_money) > 0" style="color: #31bd65">&#xe712;</i>
            <i class="iconfont" v-if="Number(changeData.loan_money) < 0" style="color: #eb4b6d">&#xe711;</i>
            <vco-number :value="Math.abs(changeData.loan_money)" :precision="2"></vco-number>
          </p>
        </a-col>
        <a-col :span="24" class="item-txt">
          <p class="name">{{ t('建立费') }}</p>
          <p class="txt" :class="{ plus: Number(changeData.estabFee) > 0, reduce: Number(changeData.estabFee) < 0 }">
            <i class="iconfont" v-if="Number(changeData.estabFee) > 0" style="color: #31bd65">&#xe712;</i>
            <i class="iconfont" v-if="Number(changeData.estabFee) < 0" style="color: #eb4b6d">&#xe711;</i>
            <vco-number :value="Math.abs(changeData.estabFee)" :precision="2"></vco-number>
          </p>
        </a-col>
        <a-col :span="24" class="item-txt" v-if="detail?.base?.has_linefee">
          <p class="name">{{ t('额度费') }}</p>
          <p class="txt" :class="{ plus: Number(changeData.lineFee) > 0, reduce: Number(changeData.lineFee) < 0 }">
            <i class="iconfont" v-if="Number(changeData.lineFee) > 0" style="color: #31bd65">&#xe712;</i>
            <i class="iconfont" v-if="Number(changeData.lineFee) < 0" style="color: #eb4b6d">&#xe711;</i>
            <vco-number :value="Math.abs(changeData.lineFee)" :precision="2"></vco-number>
          </p>
        </a-col>
        <a-col :span="24" class="item-txt">
          <p class="name">{{ t('第二授信额度') }}</p>
          <p class="txt" :class="{ plus: Number(changeData.credit_fc2) > 0, reduce: Number(changeData.credit_fc2) < 0 }">
            <i class="iconfont" v-if="Number(changeData.credit_fc2) > 0" style="color: #31bd65">&#xe712;</i>
            <i class="iconfont" v-if="Number(changeData.credit_fc2) < 0" style="color: #eb4b6d">&#xe711;</i>
            <vco-number :value="Math.abs(changeData.credit_fc2)" :precision="2"></vco-number>
          </p>
        </a-col>
        <a-col :span="8" class="item-txt no">
          <p class="name">{{ t('利息') }}</p>
          <p class="txt" :class="{ plus: Number(changeData.interestRate) > 0, reduce: Number(changeData.interestRate) < 0 }">
            <i class="iconfont" v-if="Number(changeData.interestRate) > 0" style="color: #31bd65">&#xe712;</i>
            <i class="iconfont" v-if="Number(changeData.interestRate) < 0" style="color: #eb4b6d">&#xe711;</i>
            <span>{{ Math.abs(changeData.interestRate) }}%</span>
          </p>
        </a-col>
        <a-col :span="8" class="item-txt no">
          <p class="name">LVR</p>
          <p class="txt" :class="{ plus: Number(changeData.lvr) > 0, reduce: Number(changeData.lvr) < 0 }">
            <i class="iconfont" v-if="Number(changeData.lvr) > 0" style="color: #31bd65">&#xe712;</i>
            <i class="iconfont" v-if="Number(changeData.lvr) < 0" style="color: #eb4b6d">&#xe711;</i>
            <span>{{ Math.abs(changeData.lvr) }}%</span>
          </p>
        </a-col>
        <a-col :span="8" class="item-txt no">
          <p class="name">IRR</p>
          <p class="txt" :class="{ plus: Number(changeData.irr) > 0, reduce: Number(changeData.irr) < 0 }">
            <i class="iconfont" v-if="Number(changeData.irr) > 0" style="color: #31bd65">&#xe712;</i>
            <i class="iconfont" v-if="Number(changeData.irr) < 0" style="color: #eb4b6d">&#xe711;</i>
            <span>{{ Math.abs(changeData.irr) }}%</span>
          </p>
        </a-col>
      </a-row>
    </div>
    <div class="change-item">
      <p class="title">{{ t('变更后') }}</p>
      <a-row :gutter="24" class="mt-5">
        <a-col :span="12" class="item-txt">
          <p class="name">{{ t('开始日期1') }}</p>
          <p class="txt">{{ tool.showDate(afterData.start_date) }}</p>
        </a-col>
        <a-col :span="12" class="item-txt">
          <p class="name">{{ t('结束日期1') }}</p>
          <p class="txt">{{ tool.showDate(afterData.end_date) }}</p>
        </a-col>
        <a-col :span="24" class="item-txt">
          <p class="name">{{ t('批准贷款金额') }}</p>
          <vco-number :value="afterData.loan_money" :precision="2"></vco-number>
        </a-col>
        <a-col :span="24" class="item-txt">
          <p class="name">{{ t('建立费') }}</p>
          <vco-number :value="afterData.estabFee" :precision="2"></vco-number>
        </a-col>
        <a-col :span="24" class="item-txt" v-if="detail?.base?.has_linefee">
          <p class="name">{{ t('额度费') }}</p>
          <vco-number :value="afterData.lineFee" :precision="2"></vco-number>
        </a-col>
        <a-col :span="24" class="item-txt">
          <p class="name">{{ t('第二授信额度') }}</p>
          <vco-number :value="afterData.credit_fc2" :precision="2"></vco-number>
        </a-col>
        <a-col :span="8" class="item-txt no">
          <p class="name">{{ t('利息') }}</p>
          <p class="txt">{{ afterData.interestRate }}%</p>
        </a-col>
        <a-col :span="8" class="item-txt no">
          <p class="name">LVR</p>
          <p class="txt">{{ afterData.lvr }}%</p>
        </a-col>
        <a-col :span="8" class="item-txt no">
          <p class="name">IRR</p>
          <p class="txt">{{ afterData.irr }}%</p>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';

const { t } = useI18n();

const props = defineProps({
  detail: {
    type: Object,
    default: () => {},
  },
  variationInfo: {
    type: Object,
    default: () => {},
  },
});

const beforeData = computed(() => {
  if (props.variationInfo.state === 1000) {
    return {
      start_date: props.variationInfo.old_credit.project.var_start_date || '',
      end_date: props.variationInfo.old_credit.project.end_date || '',
      loan_money: props.variationInfo.old_credit.project.loan_money || 0,
      estabFee: props.variationInfo.old_credit.credit_estabFee || 0,
      lineFee: props.variationInfo.old_credit?.project?.all_lineFee || 0,
      credit_fc2: props.variationInfo.old_credit.credit_fc2 || 0,
      interestRate: Number(props.variationInfo.old_credit.credit_loanInterest) || 0,
      lvr: props.variationInfo.old_credit.credit_lvr || 0,
      irr: props.variationInfo.old_credit.credit_irr || 0
    }
  } else {
    return {
      start_date: props.detail.date.start_date || '',
      end_date: props.detail.date.end_date || '',
      loan_money: props.detail.base.loan_money || 0,
      estabFee: props.detail.credit.left.estabFee || 0,
      lineFee: props.detail.credit.left.lineFee || 0,
      credit_fc2: props.detail.credit.credit_fc2 || 0,
      interestRate: props.detail.credit.left.interestRate || 0,
      lvr: props.detail.credit.right.lvr || 0,
      irr: props.detail.credit.right.irr || 0
    }
  }
});

const changeData = computed(() => {
  const gapDay = tool.calculateDurationPrecise(beforeData.value.end_date, props.detail.variationInfo.end_date);
  const estabFee = tool.minus(props.detail.variationInfo.project_credit.credit_estabFee, beforeData.value.estabFee);
  const lineFee = tool.minus(props.detail.variationInfo.all_lineFee, beforeData.value.lineFee);
  const credit_fc2 = tool.minus(props.detail.variationInfo.project_credit.credit_forecastFc2, beforeData.value.credit_fc2);
  const interestRate = tool.minus(props.detail.variationInfo.project_credit.credit_loanInterest, beforeData.value.interestRate);
  const lvr = tool.minus(props.detail.variationInfo.project_credit.credit_lvr, beforeData.value.lvr);
  const irr = tool.minus(props.detail.variationInfo.project_credit.credit_irrPreset, beforeData.value.irr);

  const amount = props.detail.variationInfo.amount;
  const loan_money = [2, 5].includes(Number(props.detail.variationInfo.type)) ? amount * -1 : amount;
  const obj = {
    start_date: props.detail.variationInfo.start_date || 0,
    end_date: gapDay.gapDay,
    loan_money: loan_money || 0,
    estabFee: estabFee || 0,
    lineFee: lineFee || 0,
    credit_fc2: credit_fc2 || 0,
    interestRate: interestRate || 0,
    lvr: lvr || 0,
    irr: irr || 0,
  };
  return obj;
});

const afterData = computed(() => {
  const cAmount = props.detail.variationInfo.amount || 0;
  const bAmount = props.variationInfo.state === 1000 ? props.variationInfo.old_credit.project.loan_money : props.detail.base.loan_money;
  let loan_money = 0;
  if ([2, 5].includes(Number(props.detail.variationInfo.type))) {
    loan_money = tool.minus(bAmount, cAmount);
  } else {
    loan_money = tool.plus(bAmount, cAmount);
  }
  const obj = {
    start_date: props.detail.date.start_date || '',
    end_date: props.detail.variationInfo.end_date || '',
    loan_money: loan_money,
    estabFee: props.detail.variationInfo.project_credit.credit_estabFee || 0,
    lineFee: props.detail.variationInfo.all_lineFee || 0,
    credit_fc2: props.detail.variationInfo.project_credit.credit_forecastFc2 || 0,
    interestRate: props.detail.variationInfo.project_credit.credit_loanInterest || 0,
    lvr: props.detail.variationInfo.project_credit.credit_lvr || 0,
    irr: props.detail.variationInfo.project_credit.credit_irrPreset || 0,
  };
  return obj;
});
</script>

<style lang="less" scoped>
.block-main-content {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  > .change-item {
    padding: 32px 30px 36px;
    background-color: #f0f0f0;
    border: 1px solid #f0f0f0;
    border-radius: 10px;
    &.middle {
      background-color: #fff2df;
      border: 1px solid #fff2df;
    }
    > .title {
      font-weight: 500;
      font-size: 14px;
    }
  }
}

.item-txt {
  margin-bottom: 20px;
  &.no {
    margin-bottom: 0;
  }
  > p {
    font-size: 13px;
    &.name {
      color: #999;
      margin-bottom: 3px;
    }
    &.txt {
      font-size: 17px;
      font-weight: 500;
      color: #181818;
      display: flex;
      align-items: center;
      gap: 2px;
      &.plus {
        color: #31bd65;
        :deep(.ant-statistic-content) {
          color: #31bd65 !important;
        }
      }
      &.reduce {
        color: #eb4b6d;
        :deep(.ant-statistic-content) {
          color: #eb4b6d !important;
        }
      }
      > .iconfont {
        font-size: 14px;
      }
    }
  }
  .txt-box {
    display: flex;
    align-items: center;
    gap: 2px;
  }
  :deep(.ant-statistic-content) {
    font-size: 17px !important;
    font-weight: 500 !important;
  }
}
</style>
