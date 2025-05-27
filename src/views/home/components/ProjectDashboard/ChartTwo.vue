<template>
  <div class="hRgViQ chart">
    <div class="title">
      <p>Cashflow Forecast</p>
      <div>
        <div class="dwFSiw">
          <div>
            <div class="fPYWvF"></div>
            <div>Drawdown</div>
          </div>
          <div>
            <div class="hErflg"></div>
            <div>Repayment</div>
          </div>
        </div>
      </div>
    </div>
    <div class="row-bars" style="padding-top: 28px">
      <div class="ehsbrV" v-for="item in data" :key="item.uuid">
        <div class="bar_l" :style="{ height: getHeight(item, 'drawdown') }"></div>
        <div class="bar_r" :style="{ height: getHeight(item, 'repayment') }"></div>
      </div>
    </div>
    <div>
      <div class="jhVYNA first" style="justify-items: center"><span>Dec ‘24</span><span>Jan ‘25</span><span>Feb ‘25</span><span>Mar ‘25</span></div>
      <div class="jhVYNA" style="justify-items: center">
        <div class="fPYWvF"></div>
        <span>0.00</span><span>204,489,045.53</span><span>204,489,045.58</span><span>76,261,902.68</span>
      </div>
      <div class="jhVYNA" style="justify-items: center">
        <div class="hErflg"></div>
        <span>78,066,840.95</span><span>0.00</span><span>0.00</span><span>346,551,502.89</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const max = ref(0);
const maxDrawdown = ref(0);
const maxRepayment = ref(0);
const data = ref({
  '2024-12': {
    drawdown: 0,
    repayment: 78066840.95
  },
  '2025-01': {
    drawdown: 204489045.53,
    repayment: 0
  },
  '2025-02': {
    drawdown: 204489045.58,
    repayment: 0
  },
  '2025-03': {
    drawdown: 76261902.68,
    repayment: 346551502.89
  }
});

const getHeight = (item, type) => {
  return ((item[type] / max.value) * 100).toFixed(1) + '%';
};

onMounted(() => {
  // 找出 drawdown 的最大值
  maxDrawdown.value = Object.values(data.value).reduce((max, item) => Math.max(max, item.drawdown), -Infinity);

  // 找出 repayment 的最大值
  maxRepayment.value = Object.values(data.value).reduce((max, item) => Math.max(max, item.repayment), -Infinity);
  max.value = Math.max(maxDrawdown.value, maxRepayment.value);
});
</script>

<style lang="less" scoped>
.hRgViQ {
  &.chart {
    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .row-bars {
      flex: 1 1 0%;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      .ehsbrV {
        position: relative;
        height: 100%;
        width: 100%;
        background-color: transparent;
      }
    }
    .bar_l {
      left: 0;
      height: 10%;
      width: calc(50% - 2px);
      background-color: rgb(229, 224, 215);
      position: absolute;
      bottom: 0px;
    }
    .bar_r {
      right: 0;
      height: 100%;
      width: calc(50% - 2px);
      background-color: rgb(180, 241, 219);
      position: absolute;
      bottom: 0px;
    }
    .jhVYNA {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 24px;
      position: relative;
      margin-top: 10px;
      text-align: center;
    }
  }
  .dwFSiw {
    display: flex;
    gap: 36px;
    & > div {
      font-weight: 400;
      color: rgba(39, 39, 39, 0.467);
      position: relative;
      .hErflg,
      .fPYWvF {
        top: 53%;
      }
    }
  }
  .hErflg {
    background-color: rgb(180, 241, 219);
    height: 6px;
    width: 6px;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: -5px;
    transform: translate(-100%, -50%);
  }
  .fPYWvF {
    background-color: rgb(229, 224, 215);
    height: 6px;
    width: 6px;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: -5px;
    transform: translate(-100%, -50%);
  }
}
</style>
