<template>
  <div class="hRgViQ chart">
    <div class="title">
      <p>Loans Book Composition</p>
      <div>
        <div class="select">
          <select v-model="balance_key">
            <option value="balance">Loan Balance</option>
            <option value="currentFc2">Current FC2</option>
          </select>
        </div>
      </div>
    </div>
    <div class="row-bars" style="padding: 42px 0px 16px">
      <div class="ehsbrV" v-for="(item,index) in data" :key="index">
        <div class="cHGikM" :style="{ height: getHeight(item) }">
          <label> {{ getPercentage(item) }}</label>
        </div>
      </div>
    </div>
    <div class="sc-jlOLRj dDGtFy">
      <div class="sc-bXxmBy jQJCwP"></div>
      <div class="value">$2m</div>
      <div class="sc-bXxmBy jQJCwP"></div>
      <div class="value">$5m</div>
      <div class="sc-bXxmBy jQJCwP"></div>
      <div class="value">$10m</div>
      <div class="sc-bXxmBy jQJCwP"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { cloneDeep } from 'lodash';

const props = defineProps({
  data: {
    type: Object
  }
});
const balance_key = ref('balance');
const maxBalance = ref(0);
const maxCurrentFC2 = ref(0);
const totalBalance = ref(0);
const totalCurrentFC2 = ref(0);

const getHeight = (item) => {
  let val = '';
  if (balance_key.value === 'balance') {
    val = ((item.balance / maxBalance.value) * 100).toFixed(1);
  }
  if (balance_key.value === 'currentFc2') {
    val = ((item.currentFc2 / maxCurrentFC2.value) * 100).toFixed(1);
  }
  return val + '%';
};

const getPercentage = (item) => {
  let val = '';
  if (balance_key.value === 'balance') {
    val = ((item.balance / totalBalance.value) * 100).toFixed(1);
  }
  if (balance_key.value === 'currentFc2') {
    val = ((item.currentFc2 / totalCurrentFC2.value) * 100).toFixed(1);
  }
  return val + '%';
};

const initData = () => {
  maxBalance.value = props.data.reduce((max, item) => Math.max(max, item.balance), -Infinity);
  maxCurrentFC2.value = props.data.reduce((max, item) => Math.max(max, item.currentFc2), -Infinity);
  totalBalance.value = props.data.reduce((sum, item) => sum + item.balance, 0);
  totalCurrentFC2.value = props.data.reduce((sum, item) => sum + item.currentFc2, 0);
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
  flex: 1 1 0%;
  min-width: 208px;
  padding: 32px 20px 20px;
  border-radius: 16px;
  background-color: rgb(240, 240, 240);
  color: rgb(39, 39, 39);
  font-size: 14px;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .select {
    height: 32px;
    width: 120px;
    border-radius: 18px;
    background-color: rgb(39, 39, 39);
    display: flex;
    justify-content: center;
    select {
      border: none;
      height: 100%;
      border-radius: 18px;
      font-size: 14px;
      font-weight: 500;
      color: rgb(251, 251, 251);
      background-color: rgb(39, 39, 39);
      &:focus-visible {
        outline: none;
      }
    }
  }
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

      .cHGikM {
        width: 100%;
        background-color: rgb(229, 224, 215);
        position: absolute;
        bottom: 0px;
        left: 0;
        right: auto;
        label {
          position: absolute;
          top: 0px;
          left: 0;
          right: 0;
          transform: translate(0, -100%);
          text-align: center;
          &::after {
            content: '';
            display: block;
            position: absolute;
            bottom: -6px;
            width: 100%;
            height: 6px;
            background-color: rgb(39, 39, 39);
          }
        }
      }
    }
    .dDGtFy {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .jQJCwP {
        height: 1px;
        flex: 1 1 0%;
        border-bottom: 1px dotted rgb(39, 39, 39);
      }
      .value {
        padding: 0.2rem 0.4rem;
        background-color: white;
      }
    }
  }
}
</style>
