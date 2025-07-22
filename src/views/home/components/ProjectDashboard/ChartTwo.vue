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
      <div class="jhVYNA first" style="justify-items: center">
        <span v-for="(item, ym) in data" :key="ym"> {{ tool.monthYear(ym) }}</span>
      </div>
      <div class="jhVYNA" style="justify-items: center">
        <div class="fPYWvF"></div>
        <vco-number v-for="(item, ym) in data" :key="ym" :value="item.drawdown" :bold="true" :precision="2" size="fs_md" prefix="" suffix=""></vco-number>
      </div>
      <div class="jhVYNA" style="justify-items: center">
        <div class="hErflg"></div>
        <vco-number v-for="(item, ym) in data" :key="ym" :value="item.repayment" :bold="true" :precision="2" size="fs_md" prefix="" suffix=""></vco-number>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
const { t } = useI18n();

const props = defineProps({
  data: {
    type: Object
  }
});
const max = ref(0);
const maxDrawdown = ref(0);
const maxRepayment = ref(0);

const getHeight = (item, type) => {
  return ((item[type] / max.value) * 100).toFixed(1) + '%';
};
const initData = () => {
  // 找出 drawdown 的最大值
  maxDrawdown.value = Object.values(props.data).reduce((max, item) => Math.max(max, item.drawdown), -Infinity) || 1;

  // 找出 repayment 的最大值
  maxRepayment.value = Object.values(props.data).reduce((max, item) => Math.max(max, item.repayment), -Infinity) || 1;
  max.value = Math.max(maxDrawdown.value, maxRepayment.value);
};

watch(
  () => props.data,
  (val) => {
    initData();
  },
  {
    deep: true,
    immediate: true
  }
);
</script>

<style lang="less" scoped>
.hRgViQ {
  height: 400px;
  flex: 1 1 0%;
  padding: 32px 20px 20px;
  border-radius: 16px;
  background-color: rgb(240, 240, 240);
  color: rgb(39, 39, 39);
  font-size: 14px;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  &.chart {
    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .row-bars {
      flex: 1;
      display: flex;
      .ehsbrV {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: flex-end;
      }
    }
    .bar_l {
      background-color: rgb(229, 224, 215);
      min-height: 5px !important;
      width: 35px;
      margin-right: 15px;
    }
    .bar_r {
      background-color: rgb(180, 241, 219);
      min-height: 5px !important;
      width: 35px;
    }
    .jhVYNA {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 12px;
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
