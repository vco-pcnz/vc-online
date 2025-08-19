<template>
  <a-spin :spinning="loading" size="large">
    <div class="flex title items-center gap-5">
      <div class="bold fs_2xl">{{ t('金额日志') }}</div>
      <SearchContent v-model:value="searchForm" :searchConfig="searchConfig" :open_hidden="true" :showPresets="false" downloadUrl="project/forecast/briefExport" @change="loadData"></SearchContent>
    </div>
    <div class="hRgViQ chart mt-10">
      <div class="title">
        <p></p>
        <div>
          <div class="dwFSiw">
            <div>
              <div class="fPYWvF"></div>
              <div>{{t('已使用')}}</div>
            </div>
            <div>
              <div class="hErflg"></div>
              <div>{{t('可用余额1')}}</div>
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
          <span class="flex-1" v-for="(item, ym) in data" :key="ym"> {{ tool.monthYear(ym) }}</span>
        </div>
        <div class="jhVYNA" style="justify-items: center">
          <div class="fPYWvF"></div>
          <div class="flex-1" v-for="(item, ym) in data" :key="ym">
            <vco-number :value="item.drawdown" :bold="true" :precision="2" size="fs_md" prefix="" suffix=""></vco-number>
          </div>
        </div>
        <div class="jhVYNA" style="justify-items: center">
          <div class="hErflg"></div>
          <div class="flex-1" v-for="(item, ym) in data" :key="ym">
            <vco-number :value="item.repayment" :bold="true" :precision="2" size="fs_md" prefix="" suffix=""></vco-number>
          </div>
        </div>
      </div>
    </div>
  </a-spin>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { dashboard } from '@/api/home/index';
import SearchContent from '@/views/dashboard/components/SearchContent/index.vue';
import dayjs from 'dayjs';
const { t } = useI18n();

const searchConfig = ref(['Time']);
const searchForm = ref({
  start_date: dayjs().subtract(0, 'month').startOf('month').format('YYYY-MM-DD'),
  end_date: dayjs().subtract(0, 'month').endOf('month').format('YYYY-MM-DD')
});
const max = ref(0);
const maxDrawdown = ref(0);
const maxRepayment = ref(0);

const getHeight = (item, type) => {
  return ((item[type] / max.value) * 100).toFixed(1) + '%';
};
const initData = () => {
  // 找出 drawdown 的最大值
  maxDrawdown.value = Object.values(data.value).reduce((max, item) => Math.max(max, item.drawdown), -Infinity) || 1;

  // 找出 repayment 的最大值
  maxRepayment.value = Object.values(data.value).reduce((max, item) => Math.max(max, item.repayment), -Infinity) || 1;
  max.value = Math.max(maxDrawdown.value, maxRepayment.value);
};

const loading = ref(false);
const data = ref({});

const loadData = (val) => {
  loading.value = true;
  dashboard(searchForm.value)
    .then((res) => {
      // data.value = res;
      data.value = {
        '2024-09': {
          drawdown: '1258309.18',
          repayment: 0
        },
        '2024-10': {
          drawdown: '1258309.18',
          repayment: 0
        },
        '2024-11': {
          drawdown: '1258309.18',
          repayment: 0
        },
        '2024-12': {
          drawdown: '1258309.18',
          repayment: 0
        },
        '2025-01': {
          drawdown: '1258309.18',
          repayment: 0
        },
        '2025-02': {
          drawdown: '1258309.18',
          repayment: 0
        },
        '2025-03': {
          drawdown: '1258309.18',
          repayment: 0
        },
        '2025-04': {
          drawdown: '1258309.18',
          repayment: 0
        },
        '2025-05': {
          drawdown: '1258309.18',
          repayment: 0
        },
        '2025-06': {
          drawdown: '1519648.61',
          repayment: 0
        },
        '2025-07': {
          drawdown: '1618024.43',
          repayment: 0
        },
        '2025-08': {
          drawdown: '1618024.43',
          repayment: 0
        }
      };
      initData();
    })
    .finally(() => {
      loading.value = false;
    });
};

onMounted(() => {
  loadData();
});
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
      width: 30%;
      max-width: 35px;
      margin-right: 5%;
    }
    .bar_r {
      background-color: rgb(180, 241, 219);
      min-height: 5px !important;
      width: 30%;
      max-width: 35px;
    }
    .jhVYNA {
      display: flex;
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
