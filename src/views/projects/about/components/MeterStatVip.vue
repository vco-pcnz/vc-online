<template>
  <div class="indicatorsGrid">
    <div class="MeterStat-row">
      <div class="MeterStat MeterStat_type_charcoal">
        <div class="MeterStat-Meter LA"></div>
        <div>
          <p>Current balance</p>
          <div class="fs_3xl bold" style="margin-bottom: 2px"><vco-number :value="data?.currentBalance" :precision="2"></vco-number></div>
          <p class="color_grey flex"><vco-number :value="data?.currentBalanceAvailable" :precision="2" color="#888" size="fs_md" class="mr-2"></vco-number> available</p>
        </div>
      </div>
      <div class="MeterStat MeterStat_type_stone3">
        <div class="MeterStat-Meter LB"></div>
        <div>
          <p>Repayment</p>
          <vco-number :value="0" :precision="2"></vco-number>
        </div>
      </div>
      <div class="MeterStat">
        <div class="MeterStat-Meter LC"></div>
        <div>
          <div class="flex items-center gap-2">
            Full facility
            <div class="efSGMs">
              <i class="iconfont">&#xe76f;</i>
              <div class="tips"><p>Full Facility = Facility + Establishment fee + Estimated Line Fee + Estimated Interest</p></div>
            </div>
          </div>
          <vco-number :value="data?.totalBalance" :precision="2"></vco-number>
        </div>
      </div>
    </div>

    <div class="chart">
      <!-- <v-chart :option="option" autoresize />
      <v-chart class="chart2" :option="option2" autoresize /> -->
      <a-progress type="circle" class="progress" :size="180" strokeColor="#c5dfd6" :strokeWidth="9" :percent="75">
        <template #format="percent">
          <div class="progress-value">
            <p>drawn</p>
            <span class="num">{{ percent }}%</span>
          </div>
        </template>
      </a-progress>
      <a-progress type="circle" class="progress" :size="280" strokeColor="rgba(169, 173, 87, 0.7)" :strokeWidth="6" :showInfo="false" :percent="75" />
    </div>
    <div class="MeterStat-row">
      <div class="MeterStat justify-end text-right">
        <div>
          <p>Drawn amount</p>
          <vco-number :value="data?.loanWithdrawal" :precision="2"></vco-number>
          <p class="color_grey flex"><vco-number :value="data?.loanWithdrawalAvailable" :precision="2" color="#888" size="fs_md" class="mr-2"></vco-number> available</p>
        </div>
        <div class="MeterStat-Meter RA"></div>
      </div>
      <div class="MeterStat justify-end text-right">
        <div>
          <p class="color_grey" style="margin-bottom: 2px">Pending drawdown</p>
          <vco-number :value="data?.pendingDrawdown" :precision="2"></vco-number>
        </div>
        <div class="MeterStat-Meter RB"></div>
      </div>
      <div class="MeterStat justify-end text-right">
        <div>
          <div class="flex items-center gap-2">
            <div class="efSGMs">
              <i class="iconfont">&#xe76f;</i>
              <div class="tips" style="right: 50%;left: auto;"><p>Loan = Approved LoanAmount + Legal fee + Brokerfee</p></div>
            </div>
            Loan
          </div>
          <vco-number :value="data?.pendingDrawdown" :precision="2"></vco-number>
        </div>
        <div class="MeterStat-Meter RC"></div>
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
  .progress {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
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
  height: 83px;
}

.LA {
  background-color: rgba(169, 173, 87, 0.7);
  border: 1px solid rgba(109, 123, 31, 0.5);
}
.LB {
  background-color: #6d7b1f;
  border: 1px solid #6d7b1f;
}
.LC {
  background-color: rgba(169, 173, 87, 0.7);
  border: 1px solid rgba(169, 173, 87, 0.5);
}
.RA {
  background-color: #7dc1c1;
  border-color: #569695;
}
.RB {
  background-color: #c6dada;
  border: none;
}
.RC {
  background-color: hsla(120, 5%, 89%, 0.5);
  border: none;
}

.progress-value {
  color: #3f695b;
  font-size: 16px;
  .num {
    font-size: 24px;
    line-height: 40px;
    font-weight: bold;
  }
}

.efSGMs {
  position: relative;
  cursor: pointer;
  color: rgba(24, 24, 24, 0.5);
  .tips {
    position: absolute;
    top: 0px;
    left: 50%;
    right: auto;
    transform: translateY(calc(-100% - 4px));
    width: 176px;
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
</style>
