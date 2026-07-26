<template>
  <a-spin :spinning="loading" size="large">
    <div class="title flex justify-between items-center">
      <div class="bold fs_2xl">{{ t('贷款概览') }}</div>
    </div>
    <div class="funding-overview mt-6">
      <section v-for="funding in visibleFundingRows" :key="funding.key" class="funding-row">
        <h3>{{ funding.title }}</h3>
        <div class="funding-cards">
          <div class="funding-card drawdown-card">
            <div class="card-title">
              Live Loans Drawdown
              <a-tooltip title="Based on currently live loans only.">
                <InfoCircleOutlined />
              </a-tooltip>
              <span class="as-at">· as at {{ asAtDate }}</span>
            </div>
            <div class="drawdown-values">
              <div>
                <p>Total</p>
                <vco-number class="amount" :value="funding.amount" :precision="2" :end="true"></vco-number>
              </div>
              <div>
                <p>Available</p>
                <vco-number class="amount" :value="funding.available" :precision="2" :end="true"></vco-number>
              </div>
              <div>
                <p>Used</p>
                <vco-number class="amount" :value="funding.used" :precision="2" :end="true"></vco-number>
              </div>
            </div>
            <div class="progress-track">
              <div class="progress-value" :style="{ width: `${funding.usedPercent}%` }"></div>
            </div>
            <p class="undrawn">Undrawn {{ funding.availablePercent.toFixed(1) }}%</p>
          </div>

          <div class="funding-card income-card">
            <div class="card-title">
              Income for the period
              <a-tooltip title="Includes all loans live at any point in the selected period, including settled loans.">
                <InfoCircleOutlined />
              </a-tooltip>
              <a-range-picker
                v-model:value="fundingCloseDateRanges[funding.key]"
                class="period-picker"
                format="D MMM YYYY"
                :allowClear="false"
                :disabledDate="disabledFutureDate"
                @change="fundingDateChange"
              />
            </div>
            <div class="income-values">
              <div>
                <p>Establishment fee</p>
                <vco-number class="amount" :value="funding.establishmentFee" :precision="2" :end="true"></vco-number>
              </div>
              <div>
                <p>Capitalized interest</p>
                <vco-number class="amount" :value="funding.capitalizedInterest" :precision="2" :end="true"></vco-number>
              </div>
              <div>
                <p>Accrued interest</p>
                <vco-number class="amount" :value="funding.accruedInterest" :precision="2" :end="true"></vco-number>
              </div>
              <div>
                <p>Total income</p>
                <vco-number class="amount" :value="funding.totalIncome" :precision="2" :end="true"></vco-number>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </a-spin>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import { InfoCircleOutlined } from '@ant-design/icons-vue';
import { statistics } from '@/api/invest/index';
import { hasPermission } from '@/directives/permission/index';
const { t } = useI18n();

const props = defineProps({
  invest_id: {
    type: String
  },
  product_uuid: {
    type: String,
    default: ''
  }
});

const statisticsData = ref({});
const loading = ref(false);
const fundingCloseDateRanges = reactive({
  vs: [dayjs().startOf('year'), dayjs()],
  boc: [dayjs().startOf('year'), dayjs()]
});

const numberValue = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const createFundingRow = (key, title) => {
  const amount = numberValue(statisticsData.value?.[`amount_${key}`]);
  const available = numberValue(statisticsData.value?.[`available_amount_${key}`]);
  const used = numberValue(statisticsData.value?.[`use_amount_${key}`]);
  const usedPercent = amount > 0 ? Math.min(Math.max((used / amount) * 100, 0), 100) : 0;

  return {
    key,
    title,
    amount,
    available,
    used,
    usedPercent,
    availablePercent: amount > 0 ? Math.min(Math.max((available / amount) * 100, 0), 100) : 0,
    establishmentFee: numberValue(statisticsData.value?.[`frate_${key}`]),
    capitalizedInterest: numberValue(statisticsData.value?.[`rate_${key}`]),
    accruedInterest: numberValue(statisticsData.value?.[`accruedInterest_${key}`]),
    totalIncome: numberValue(statisticsData.value?.[`totalIncome_${key}`])
  };
};

const fundingRows = computed(() => [createFundingRow('vs', 'VS funding'), createFundingRow('boc', 'BOC funding')]);
const canViewVsFunding = computed(() => hasPermission('projects:schedule:vs_schedule'));
const canViewBocFunding = computed(() => hasPermission('projects:schedule:boc_schedule'));
const isBocOnlyInvestor = computed(() => !canViewVsFunding.value && canViewBocFunding.value);
const visibleFundingRows = computed(() =>
  isBocOnlyInvestor.value ? fundingRows.value.filter((item) => item.key === 'boc') : fundingRows.value
);
const asAtDate = computed(() => statisticsData.value?.as_at || statisticsData.value?.date || dayjs().format('D MMM YYYY'));

const disabledFutureDate = (current) => current && current.isAfter(dayjs(), 'day');

const loadData = () => {
  const params = {
    uuid: props.invest_id,
    product_uuid: props.product_uuid
  };
  if (!isBocOnlyInvestor.value) {
    const vsRange = fundingCloseDateRanges.vs;
    params.vs_close_date_s = vsRange[0].format('YYYY-MM-DD');
    params.vs_close_date_e = vsRange[1].format('YYYY-MM-DD');
  }
  if (!isBocOnlyInvestor.value || canViewBocFunding.value) {
    const bocRange = fundingCloseDateRanges.boc;
    params.boc_close_date_s = bocRange[0].format('YYYY-MM-DD');
    params.boc_close_date_e = bocRange[1].format('YYYY-MM-DD');
  }

  loading.value = true;
  statistics(params)
    .then((res) => {
      statisticsData.value = res;
    })
    .finally(() => {
      loading.value = false;
    });
};

const fundingDateChange = () => {
  loadData();
};

watch(
  () => [props.invest_id, props.product_uuid],
  ([id]) => {
    if (id) {
      loadData();
    }
  },
  {
    immediate: true
  }
);
</script>

<style lang="less" scoped>
.funding-overview {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.funding-row {
  padding: 20px;
  border-radius: 14px;
  background: #f7f6f3;

  > h3 {
    margin-bottom: 14px;
    color: #272727;
    font-size: 18px;
    font-weight: 700;
  }
}

.funding-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.funding-card {
  min-height: 162px;
  padding: 18px;
  border: 1px solid #e2e2e2;
  border-radius: 10px;
  background: #fff;

  .card-title {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 20px;
    color: #666;
    font-size: 14px;
    font-weight: 600;

    :deep(.anticon) {
      color: #999;
      cursor: help;
    }

    .as-at {
      color: #999;
      font-size: 12px;
      font-weight: 400;
    }

    .period-picker {
      margin-left: auto;
      width: 230px;
      height: 30px;
      border-color: #d7e6ef;
      border-radius: 6px;
      background: #edf6fc;

      :deep(input) {
        color: #46708b;
        font-size: 12px;
        font-weight: 500;
        text-align: center;
        cursor: pointer;
      }

      :deep(.ant-picker-suffix) {
        display: none;
      }
    }
  }

  .amount {
    font-weight: 600;

    :deep(.ant-statistic-content) {
      font-size: 18px !important;
    }
  }
}

.drawdown-values {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;

  p,
  .undrawn {
    color: #999;
    font-size: 12px;
  }
}

.progress-track {
  height: 4px;
  margin-top: 18px;
  overflow: hidden;
  border-radius: 2px;
  background: #e7e4df;

  .progress-value {
    height: 100%;
    border-radius: inherit;
    background: #71613c;
  }
}

.undrawn {
  margin-top: 5px;
  color: #999;
  font-size: 12px;
  text-align: right;
}

.income-values {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  row-gap: 18px;

  p {
    color: #999;
    font-size: 12px;
  }
}

@media (max-width: 900px) {
  .funding-cards {
    grid-template-columns: 1fr;
  }
}

.header-static {
  margin-bottom: 60px;
  align-items: center;
  .item-content {
    display: flex;
    flex: 1;
    gap: 45px;
    align-items: center;
    > .item {
      display: flex;
      gap: 15px;
      min-height: 75px;
      min-width: 15%;
      flex: 1;
      > .line {
        border-radius: 4px;
        width: 6px;
        &.one {
          background-color: rgba(169, 173, 87, 0.7);
          border: 1px solid rgba(109, 123, 31, 0.5);
        }
        &.two {
          background-color: #272727;
          border-color: #272727;
        }
        &.three {
          background-color: #6d7b1f;
        }
      }
      > .line-content {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        > .round {
          background-color: rgba(169, 173, 87, 0.7);
          border: 1px solid rgba(109, 123, 31, 0.5);
          border-radius: 3px;
          height: 6px;
          width: 6px;
        }
      }
      > .info-content {
        > p {
          font-size: 14px;
          font-weight: 500;
        }
        .vco-number.num {
          font-weight: 500;
          :deep(.ant-statistic-content) {
            font-size: 16px !important;
          }
        }
        > div {
          display: flex;
          align-items: center;
          color: #666;
          > span {
            font-size: 11px;
            padding-left: 5px;
          }
        }
      }
    }
    .chart-content {
      width: 160px;
      height: 160px;
      position: relative;
      &::after {
        content: '';
        display: block;
        width: 160px;
        height: 160px;
        border-radius: 50%;
        background-color: transparent;
        box-shadow: 0 5px 24px rgba(169, 173, 87, 0.5);
        position: absolute;
        top: 0;
        left: 0;
      }
    }
  }
}

:deep(.income) {
  flex: 0 0 500px;
  .ant-col {
    margin-left: 46px;
    .vco-number.num {
      font-weight: 500;
      .ant-statistic-content {
        font-size: 16px !important;
      }
    }
  }
  
  .value {
    font-size: 16px;
  }
}

.bocLabel {
    font-size: 11px;
    padding-left: 5px;
    color: #666;
}
</style>
