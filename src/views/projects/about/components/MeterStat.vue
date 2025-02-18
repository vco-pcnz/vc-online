<template>
  <div class="indicatorsGrid">
    <div class="chart">
      <v-chart :option="option" autoresize />
      <v-chart class="chart2" :option="option2" autoresize />
    </div>
    <div class="MeterStat-row">
      <div class="MeterStat MeterStat_type_stone3">
        <div class="MeterStat-Meter"></div>
        <div>
          <p>Facility limit 2</p>
          <vco-number :value="data?.credit_fc2" :precision="2"></vco-number>
        </div>
      </div>
      <div class="MeterStat MeterStat_type_charcoal">
        <div class="MeterStat-Meter"></div>
        <div>
          <p>Current balance</p>
          <div class="fs_3xl bold" style="margin-bottom: 2px"><vco-number :value="data?.currentBalance" :precision="2"></vco-number></div>
          <p class="color_grey flex"><vco-number :value="data?.currentBalanceAvailable" :precision="2" color="#888" size="fs_md" class="mr-2"></vco-number> available</p>
        </div>
      </div>
      <div class="MeterStat MeterStat_type_dotsYellow">
      <div class="MeterStat-Dots">
        <div class="MeterStat-Dot"></div>
        <div class="MeterStat-Dot"></div>
        <div class="MeterStat-Dot"></div>
        <div class="MeterStat-Dot"></div>
      </div>
        <div>
          <p class="color_grey" style="margin-bottom: 2px">Total balance</p>
          <vco-number :value="data?.totalBalance" :precision="2"></vco-number>
          <p class="color_grey flex"><vco-number :value="data?.accruedInterest" :precision="2" color="#888" size="fs_md" class="mr-2"></vco-number> Accrued interest</p>
        </div>
      </div>
    </div>
    <div class="MeterStat-row">
      <div class="MeterStat MeterStat_type_transparent">
        <div class="MeterStat-Meter"></div>
        <div>
          <p>Facility limit 1</p>
          <vco-number :value="data?.credit_fc1" :precision="2"></vco-number>
        </div>
      </div>
      <div class="MeterStat MeterStat_type_cyan">
        <div class="MeterStat-Meter"></div>
        <div>
          <p>Drawn amount</p>
          <vco-number :value="data?.loanWithdrawal" :precision="2"></vco-number>
          <p class="color_grey flex"><vco-number :value="data?.loanWithdrawalAvailable" :precision="2" color="#888" size="fs_md" class="mr-2"></vco-number> available</p>
        </div>
      </div>
      <div class="MeterStat MeterStat_type_dotsBlack">
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
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps(['data']);

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
  grid-template-columns: 1fr 1fr 1fr;
  margin-bottom: 40px;
}

.chart {
  position: relative;
  height: 100%;
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
</style>
