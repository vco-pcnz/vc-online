<template>
  <div class="indicatorsGrid">
    <div class="MeterStat-row">
      <div class="MeterStat MeterStat_type_charcoal">
        <div class="MeterStat-Meter  RA"></div>
        <div>
          <p>Current balance</p>
          <div class="fs_3xl bold" style="margin-bottom: 2px"><vco-number :value="data?.currentBalance" :precision="2"></vco-number></div>
        </div>
      </div>
      <div class="MeterStat MeterStat_type_stone3">
        <div class="MeterStat-Meter RB"></div>
        <div>
          <p>Accrued interest</p>
          <vco-number :value="Math.abs(data?.accruedInterest)" :precision="2"></vco-number>
        </div>
      </div>
      <div class="MeterStat">
        <div class="MeterStat-Meter RC"></div>
        <div>
          <div class="flex items-center gap-2 justify-end">
            <p>{{ t('预计还款今天') }}</p>
              <div class="efSGMs">
                <i class="iconfont">&#xe6b3;</i>
                <div class="tips" style="right: 50%; left: auto;width: 200px;"><p>Excluding interest accrued today and unsettled transactions</p></div>
              </div>
          </div>
          <vco-number :value="tool.plus(data?.currentBalance || 0, data?.accruedInterest || 0)" :precision="2"></vco-number>
        </div>
      </div>
    </div>

    <div class="chart">
      <!-- <v-chart :option="option" autoresize />
      <v-chart class="chart2" :option="option2" autoresize /> -->
      <a-progress type="circle" class="progress" :size="180" strokeColor="rgba(169, 173, 87, 0.7)" :strokeWidth="9" :percent="data?.fkrate || 0">
        <template #format="percent">
          <div class="progress-value">
            <p>Drawn amount</p>
            <span class="num">{{ percent }}%</span>
          </div>
        </template>
      </a-progress>
      <a-progress type="circle" class="progress" :size="280" strokeColor="#c5dfd6" :strokeWidth="6" :percent="data?.hkrate || 12" :showInfo="false"> </a-progress>
    </div>
    <div class="MeterStat-row">
      <div class="MeterStat justify-end text-right">
        <div>
          <p>Drawn amount</p>
          <vco-number :value="data?.loanWithdrawal" :precision="2"></vco-number>
        </div>
        <div class="MeterStat-Meter LA"></div>
      </div>
      <div class="MeterStat justify-end text-right">
        <div>
          <p>Available to draw</p>
          <vco-number :value="data?.loanWithdrawalAvailable" :precision="2"></vco-number>
        </div>
        <div class="MeterStat-Meter LB"></div>
      </div>
      <div class="MeterStat justify-end text-right">
        <div>
          <div class="flex items-center gap-2 justify-end">
            <div class="efSGMs">
              <i class="iconfont">&#xe6b3;</i>
              <div class="tips" style="right: 50%; left: auto;width: 200px;"><p>Exclusive broker fee & legal fee</p></div>
            </div>
            Loan amount
          </div>
          <vco-number :value="data?.credit_fc1" :precision="2"></vco-number>
        </div>
        <div class="MeterStat-Meter LC"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';

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
      const currentBalance = props.data?.currentBalance || 0;
      const accruedInterest = props.data?.accruedInterest || 0;
      const payoff = tool.plus(currentBalance, accruedInterest); // estPayoffToday
      if (Number(payoff) > 0) {
        props.data.hkrate = Number(tool.times(tool.div(currentBalance, payoff), 100));
      } else {
        props.data.hkrate = 0;
      }
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
  background-color: hsla(120, 5%, 89%, 0.5);
  border: none;
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
  color: #6d7b1f;
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
