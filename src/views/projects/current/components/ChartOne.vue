<template>
  <div class="hRgViQ chart">
    <div class="title">
      <p>Loans Book Composition</p>
      <div>
        <div class="select">
          <select v-model="balance_key">
            <option value="balance">Loan Balance</option>
            <option value="currentFC2">Current FC2</option>
          </select>
        </div>
      </div>
    </div>
    <div class="row-bars" style="padding: 42px 0px 16px">
      <div class="ehsbrV" v-for="item in projectBalance" :key="item.uuid">
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
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const balance_key = ref('balance');
const maxBalance = ref(0);
const maxCurrentFC2 = ref(0);
const totalBalance = ref(0);
const totalCurrentFC2 = ref(0);

const projectBalance = ref([
  {
    uuid: '13b1f7eb-0983-4719-96a0-bf26ee12906a',
    title: '112201',
    balance: 318569.75,
    currentFC2: 2412114.7
  },
  {
    uuid: '1726193c-b5c6-4efd-87a3-f51aeb19f7cd',
    title: 'lynn0722+ex',
    balance: 6039.8,
    currentFC2: 102256.91
  },
  {
    uuid: '1893b17a-84ea-4fa3-9eb0-2fd08d80491e',
    title: 'test1122',
    balance: 44177093.16,
    currentFC2: 145491711.93
  },
  {
    uuid: '257b5d84-3208-4f28-8e57-37753e272f71',
    title: 'test082003',
    balance: 21882060.44,
    currentFC2: 200000
  }
]);
const getHeight = (item) => {
  let val = '';
  if (balance_key.value === 'balance') {
    val = ((item.balance / maxBalance.value) * 100).toFixed(1);
  }
  if (balance_key.value === 'currentFC2') {
    val = ((item.currentFC2 / maxCurrentFC2.value) * 100).toFixed(1);
  }
  return val + '%';
};

const getPercentage = (item) => {
  let val = '';
  if (balance_key.value === 'balance') {
    val = ((item.balance / totalBalance.value) * 100).toFixed(1);
  }
  if (balance_key.value === 'currentFC2') {
    val = ((item.currentFC2 / totalCurrentFC2.value) * 100).toFixed(1);
  }
  return val + '%';
};
onMounted(() => {
  maxBalance.value = projectBalance.value.reduce((max, item) => Math.max(max, item.balance), -Infinity);
  maxCurrentFC2.value = projectBalance.value.reduce((max, item) => Math.max(max, item.currentFC2), -Infinity);
  totalBalance.value = projectBalance.value.reduce((sum, item) => sum + item.balance, 0);
  totalCurrentFC2.value = projectBalance.value.reduce((sum, item) => sum + item.currentFC2, 0);
});
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
