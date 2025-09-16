<template>
  <a-alert type="info" closable class="mb-5 synced-diff" style="margin-top: -45px" v-if="Math.abs(tool.minus(base?.vcoSpendAmount, base?.xeroSpendAmount)) || Math.abs(tool.minus(base?.vcoReceivedAmount, base?.xeroReceivedAmount))">
    <template #description>
      <div class="flex">
        <a-tooltip placement="top">
          <template #title>
            <div class="flex items-center">
              <span class="xt_label">Vco: </span>
              <vco-number :value="Math.abs(base?.vcoSpendAmount)" color="#fff" size="fs_md" :precision="2"></vco-number>
            </div>
            <div class="flex items-center">
              <span class="xt_label">Xero: </span>
              <vco-number :value="Math.abs(base?.xeroSpendAmount)" color="#fff" size="fs_md" :precision="2"></vco-number>
            </div>
          </template>
          <div class="flex cursor-pointer">
            <span class="mr-3"> {{ t('放款对账情况') }} diff: </span>
            <vco-number color="#F19915" :value="Math.abs(tool.minus(base?.vcoSpendAmount, base?.xeroSpendAmount))" size="fs_md" :precision="2"></vco-number>
          </div>
        </a-tooltip>
        <a-tooltip placement="top" class="ml-5">
          <template #title>
            <div class="flex items-center">
              <span class="xt_label">Vco: </span>
              <vco-number :value="Math.abs(base?.vcoReceivedAmount)" color="#fff" size="fs_md" :precision="2"></vco-number>
            </div>
            <div class="flex items-center">
              <span class="xt_label">Xero: </span>
              <vco-number :value="Math.abs(base?.xeroReceivedAmount)" color="#fff" size="fs_md" :precision="2"></vco-number>
            </div>
          </template>
          <div class="flex cursor-pointer">
            <span class="mr-3"> {{ t('还款对账情况') }} diff: </span>
            <vco-number color="#F19915" :value="Math.abs(tool.minus(base?.vcoReceivedAmount, base?.xeroReceivedAmount))" size="fs_md" :precision="2"></vco-number>
          </div>
        </a-tooltip>
      </div>
    </template>
  </a-alert>

  <div class="indicatorsGrid">
    <div class="chart">
      <v-chart :option="option" autoresize />
      <v-chart class="chart2" :option="option2" autoresize />
    </div>
    <div class="MeterStat-row">
      <div class="MeterStat MeterStat_type_stone3 one">
        <div class="MeterStat-Meter"></div>
        <div>
          <p>Facility limit 2</p>
          <vco-number :value="data?.credit_fc2" :precision="2"></vco-number>
        </div>
      </div>
      <div class="MeterStat MeterStat_type_charcoal four">
        <div class="MeterStat-Meter"></div>
        <div>
          <p>Current balance</p>
          <div class="fs_3xl bold" style="margin-bottom: 2px"><vco-number :value="data?.currentBalance" :precision="2"></vco-number></div>
          <p class="color_grey flex"><vco-number :value="data?.currentBalanceAvailable" :precision="2" color="#888" size="fs_md" class="mr-2"></vco-number> available</p>
        </div>
      </div>
      <div class="MeterStat MeterStat_type_dotsYellow four">
        <div class="MeterStat-Dots">
          <div class="MeterStat-Dot"></div>
          <div class="MeterStat-Dot"></div>
          <div class="MeterStat-Dot"></div>
          <div class="MeterStat-Dot"></div>
        </div>
        <div>
          <p class="color_grey" style="margin-bottom: 2px">Total balance</p>
          <vco-number :value="data?.totalBalance" :precision="2"></vco-number>
          <div class="color_grey flex items-center gap-2">
            <vco-number :value="data?.accruedInterest" :precision="2" color="#888" size="fs_md" class="mr-2"></vco-number>
            <p style="font-size: 10px">Accrued interest</p>
            <div class="efSGMs">
              <i class="iconfont">&#xe6b3;</i>
              <div class="tips">
                <p>Estimated covering {{ dayjs(data?.s_day).format(selectDateFormat()) }} - {{ dayjs(data?.e_day).format(selectDateFormat()) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="MeterStat-row">
      <div class="MeterStat MeterStat_type_transparent one">
        <div class="MeterStat-Meter"></div>
        <div>
          <p>Facility limit 1</p>
          <vco-number :value="data?.credit_fc1" :precision="2"></vco-number>
        </div>
      </div>
      <div class="MeterStat MeterStat_type_cyan four">
        <div class="MeterStat-Meter"></div>
        <div>
          <p>Drawn amount</p>
          <vco-number :value="data?.loanWithdrawal" :precision="2"></vco-number>
          <p v-if="data?.loanWithdrawalAvailable >= 0" class="color_grey flex"><vco-number :value="data?.loanWithdrawalAvailable" :precision="2" color="#888" size="fs_md" class="mr-2"></vco-number> available</p>
          <div v-else class="color_red-error flex">
            {{ t('{0} 已超额', [tool.formatMoney(Math.abs(data?.loanWithdrawalAvailable || 0))]) }}
          </div>
        </div>
      </div>
      <div class="MeterStat MeterStat_type_dotsBlack four">
        <div class="MeterStat-Dots">
          <div class="MeterStat-Dot"></div>
          <div class="MeterStat-Dot"></div>
          <div class="MeterStat-Dot"></div>
          <div class="MeterStat-Dot"></div>
        </div>
        <div>
          <p class="color_grey" style="margin-bottom: 2px">Pending drawdown</p>
          <vco-number :value="data?.pendingDrawdown" :precision="2"></vco-number>
        </div>
      </div>
    </div>

    <!-- <div class="MeterStat-row" style="border-left: 1px solid #ccc; padding-left: 20px">
      <div class="MeterStat MeterStat_type_transparent one">
        <div>
          <p>{{ t('放款对账情况') }}</p>
          <div class="flex items-center">
            <span class="xt_label">Vco: </span>
            <vco-number :value="Math.abs(base?.vcoSpendAmount)" size="fs_md" :precision="2"></vco-number>
          </div>
          <div class="flex items-center">
            <span class="xt_label">Xero: </span>
            <vco-number :value="Math.abs(base?.xeroSpendAmount)" size="fs_md" :precision="2"></vco-number>
          </div>
          <div class="flex items-center">
            <span class="xt_label">Diff: </span>
            <vco-number :value="Math.abs(tool.minus(base?.vcoSpendAmount, base?.xeroSpendAmount))" size="fs_md" :precision="2"></vco-number>
          </div>
        </div>
      </div>
      <div class="MeterStat MeterStat_type_cyan four">
        <div>
          <p>{{ t('还款对账情况') }}</p>
          <div class="flex items-center">
            <span class="xt_label">Vco: </span>
            <vco-number :value="Math.abs(base?.vcoReceivedAmount)" size="fs_md" :precision="2"></vco-number>
          </div>
          <div class="flex items-center">
            <span class="xt_label">Xero: </span>
            <vco-number :value="Math.abs(base?.xeroReceivedAmount)" size="fs_md" :precision="2"></vco-number>
          </div>
          <div class="flex items-center">
            <span class="xt_label">Diff: </span>
            <vco-number :value="Math.abs(tool.minus(base?.vcoReceivedAmount, base?.xeroReceivedAmount))" size="fs_md" :precision="2"></vco-number>
          </div>
        </div>
      </div>
      <div class="MeterStat MeterStat_type_dotsBlack four"></div>
    </div> -->
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import tool, { selectDateFormat } from '@/utils/tool';
import dayjs, { Dayjs } from 'dayjs';

const { t } = useI18n();

const props = defineProps(['data', 'base']);

const option = ref({
  series: [
    {
      type: 'pie',
      center: ['50%', '50%'],
      radius: '100%',
      color: ['#272727', '#f19915', '#f3ede5'],
      label: {
        show: false
      },
      silent: true,
      data: []
    }
  ]
});
// 初始化图表
const option2 = ref({
  autoFit: false,
  legend: false,
  tooltip: false,

  series: [
    {
      type: 'pie',
      center: ['50%', '50%'],
      radius: '100%',
      color: ['#b4f1db', 'rgba(169, 173, 87, 1)', '#fff'],
      label: {
        show: false
      },
      silent: true,
      data: []
    }
  ]
});

watch(
  () => props.data,
  (val) => {
    if (val) {
      option.value.series[0].data = [{ value: props.data.currentBalance }, { value: props.data.accruedInterest }, { value: props.data.currentBalanceAvailable }];
      option2.value.series[0].data = [{ value: props.data.loanWithdrawal }, { value: props.data.pendingDrawdown }, { value: props.data.loanWithdrawalAvailable }];
    }
  },
  {
    immediate: true
  }
);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.indicatorsGrid {
  align-items: center;
  display: grid;
  gap: 12px;
  // grid-template-columns: 1.2fr 1fr 1fr 1fr;
  grid-template-columns: 2fr 1fr 1fr;
  margin-bottom: 40px;
}

.chart {
  position: relative;
  height: 100%;
  margin-right: 30px;
  .chart2 {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 170px;
    height: 170px;
    border-radius: 50%;
    box-shadow: 0 3px 6px -4px hsla(0, 0%, 9%, 0.24), 0 6px 16px 0 hsla(0, 0%, 9%, 0.16), 0 9px 28px 8px hsla(0, 0%, 9%, 0.1);
  }
}

.MeterStat-row {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.MeterStat {
  display: flex;
  font-weight: 500;
  gap: 24px;
  flex: 1;
  &.one {
    min-height: 60px;
  }
  &.four {
    min-height: 84px;
  }
}
.MeterStat-Meter {
  border: 1px solid;
  border-radius: 4px;
  width: 6px;
}
.MeterStat_type_stone3 > .MeterStat-Meter {
  background-color: #f3ede5;
  border-color: #f3ede5;
}
.MeterStat_type_transparent > .MeterStat-Meter {
  background-color: transparent;
  border-color: hsla(200, 9%, 66%, 0.5);
}
.MeterStat_type_charcoal > .MeterStat-Meter {
  background-color: #272727;
  border-color: #272727;
}
.MeterStat_type_dotsYellow > .MeterStat-Meter {
  background-color: rgba(169, 173, 87, 0.7);
  border: 1px solid rgba(109, 123, 31, 0.5);
}
.MeterStat_type_dotsBlack > .MeterStat-Meter {
  background-color: #f19915;
  border-color: #f19915;
}
.MeterStat-Dots {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}
.MeterStat-Dot {
  background-color: rgba(169, 173, 87, 0.7);
  border: 1px solid rgba(109, 123, 31, 0.5);
  border-radius: 3px;
  height: 6px;
  width: 6px;
}
.MeterStat_type_cyan > .MeterStat-Meter {
  background-color: #b4f1db;
  border-color: #b4f1db;
}
.MeterStat_type_dotsYellow .MeterStat-Dot {
  background-color: #f19915;
  border-color: #f19915;
}
.efSGMs {
  position: relative;
  cursor: pointer;
  color: rgba(24, 24, 24, 0.5);
  .tips {
    z-index: 10;
    position: absolute;
    top: 0px;
    left: 50%;
    right: auto;
    transform: translateY(calc(-100% - 4px));
    width: 280px;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid rgba(24, 24, 24, 0.2);
    background: rgb(255, 255, 255);
    box-shadow: rgba(0, 0, 0, 0.25) 0px 4px 4px 0px;
    color: rgba(24, 24, 24, 0.5);
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: 1.5;
    display: none;
  }
  &:hover {
    .tips {
      display: block;
    }
  }
}

.xt_label {
  color: #888;
  width: 33px;
  text-align: right;
  margin-right: 5px;
}

.synced-diff {
    padding-block: 10px;
}
</style>
