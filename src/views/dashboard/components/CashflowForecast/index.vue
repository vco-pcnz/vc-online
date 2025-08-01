<template>
  <div class="flex items-end title">
    <template v-if="isNav">
      <div v-if="showArrow" class="flex-1 fs_2xl cursor-pointer" @click="navigationTo('/dashboard/cashflow')">Cashflow forecast <i class="iconfont">&#xe794;</i></div>
      <div v-else class="flex-1 fs_2xl cursor-pointer" @click="goBack()"><i class="iconfont" style="rotate: 180deg; display: inline-block">&#xe794;</i>Cashflow forecast</div>
    </template>
    <template v-else>
      <div class="flex-1 fs_2xl cursor-pointer">Cashflow forecast</div>
    </template>
    <SearchContent v-model:value="searchForm" :searchConfig="searchConfig" downloadUrl="project/forecast/cashFlowForecastExport" @change="loadData"></SearchContent>
  </div>
  <a-spin :spinning="loading" size="large">
    <div class="CashflowForecastChart">
      <template v-if="data">
        <div class="flex flex-col justify-between">
          <p class="bold">Available fund for upcoming 11 months</p>
          <div>
            <i class="iconfont">&#xe75f;</i>
            <vco-number-new :value="data.available_fund"></vco-number-new>
            <p class="fs_xs color_grey">Open available fund</p>
          </div>
        </div>
        <div class="flex-1 relative">
          <div class="chart-list" style="height: 300px">
            <div class="zeroWrapper">
              <div class="zeroLine" :style="{ top: 'calc(' + zeroLine + '% + 5px)' }"></div>
            </div>
            <div class="chart-list-item" v-for="(item, index) in dates" :key="item">
              <div class="inner" v-if="!isAllElementsEqual" :style="{ height: setBarHeight(index) }"></div>
              <div class="relative" style="height: 100%">
                <!-- label -->
                <template v-if="index && !isAllElementsEqual">
                  <line-label :Max="Max" :Min="Min" :zeroLine="zeroLine" :value="option.series[0].data[index]" :pre-value="option.series[0].data[index - 1]" :amount="data.data[2].data[dates[index]]"></line-label>
                </template>
              </div>
              <div class="month">{{ tool.monthYear(item) }}</div>
            </div>
          </div>
          <!-- hover -->
          <div class="hoverBox chart-list" style="height: 300px" @click="visible_forecast = true">
            <div class="chart-list-item hover" v-for="(item, index) in dates" :key="item" @mousemove="mousemove($event, index)" @mouseout="mouseout"></div>
          </div>
          <!-- charts -->
          <div class="chartBox">
            <v-chart :option="option" autoresize />
          </div>
        </div>
        <div class="flex flex-col justify-end">
          <i class="iconfont">&#xe75f;</i>
          <vco-number-new :value="data.data[3].data[dates[dates.length - 1]]"></vco-number-new>
          <p class="fs_xs color_grey">Forecasted available fund</p>
        </div>
      </template>
    </div>
    <TableBlock v-if="data" :data="data.data"></TableBlock>
  </a-spin>

  <div class="tooltipBoxWrapper" v-if="chartData && showTipCard" :style="{ top: `${mouseY - 60}px`, left: `${mouseX - 155}px` }">
    <div class="tooltipBox" ref="tooltipBoxRef">
      <template v-if="chartData">
        <!-- {{ chartData }} -->
        <div class="card" style="padding-bottom: 0px">
          <div class="flex justify-between">
            <p class="bold fs_md">{{ tool.monthYearFull(chartData.Date) }}</p>
            <p class="flex ml-10">
              <i class="iconfont mr-2">&#xe755;</i>
              <vco-number :bold="true" prefix="$(" suffix=")" :value="chartData.Drawdowns" :precision="2" size="fs_md"></vco-number>
            </p>
          </div>
          <p class="color_grey fs_xs">{{ data.drawdown_num[dates[hoverIndex]] }} drawdowns</p>
          <div class="my-3">
            <p class="flex items-center justify-end">
              <i class="iconfont mr-2">&#xe757;</i>
              <vco-number :bold="true" color="#6d7b1f" :value="chartData.Repayments" :precision="2" size="fs_md"></vco-number>
            </p>
            <p class="color_grey fs_xs">{{ data.repayment_num[dates[hoverIndex]] }} repayments</p>
          </div>
          <vco-number-new :value="chartData.Total" size="fs_md"></vco-number-new>
        </div>
        <a-divider />
        <div class="card" style="padding-top: 0px">
          <vco-number-new :type="2" :value="chartData.AvailableFund - chartData.Total" size="fs_md"></vco-number-new>
          <p class="color_grey fs_xs">Available fund {{ tool.monthYear(chartData.Date) }}</p>
          <div class="flex items-center justify-between mt-5">
            <i class="iconfont available-fund-icon">&#xe75f;</i>
            <div class="text-left">
              <vco-number-new :type="2" :value="chartData.AvailableFund"></vco-number-new>
              <p class="color_grey fs_xs">Available fund</p>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
  <Forecast :date="dates[hoverIndex]" :searchForm="searchForm" v-model:visible="visible_forecast"></Forecast>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import tool, { goBack, navigationTo } from '@/utils/tool';
import dayjs from 'dayjs';
import TableBlock from './TableBlock.vue';
import { cashFlowForecast } from '@/api/project/forecast';
import Forecast from './ForecastModal.vue';
import VcoNumberNew from './vco-number-new.vue';
import LineLabel from './line-label.vue';
import { useUserStore } from '@/store';
import SearchContent from '../SearchContent/index.vue';

const { t } = useI18n();

const props = defineProps({
  showArrow: {
    type: Boolean,
    default: false
  },
  isNav: {
    type: Boolean,
    default: true
  }
});

const visible_forecast = ref(false);
const tooltipBoxRef = ref();
const hoverIndex = ref(null);
const option = ref({
  xAxis: {
    type: 'category',
    data: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    show: false
  },
  grid: {
    left: 0,
    right: 0,
    bottom: 5,
    top: 5
  },
  color: ['#181818'],
  yAxis: {
    label: false,
    grid: {
      line: false
    },
    splitLine: {
      show: false
    },
    min: 0,
    max: 0
  },
  series: [
    {
      data: [],
      type: 'line',
      symbolSize: 8,
      smooth: true,
      lineStyle: {
        width: 4
      }
    }
  ]
});

const chartData = computed(() => {
  if (data.value) {
    return {
      Date: dates.value[hoverIndex.value],
      Repayments: data.value.data[0].data[dates.value[hoverIndex.value]],
      Drawdowns: data.value.data[1].data[dates.value[hoverIndex.value]],
      Total: data.value.data[2].data[dates.value[hoverIndex.value]],
      AvailableFund: data.value.data[3].data[dates.value[hoverIndex.value]]
    };
  }
  return false;
});

const data = ref(null);
const zeroLine = ref(0);
const Min = ref(0);
const Max = ref(0);
const minMax = ref(0);
const dates = ref([]);
const loading = ref(false);
const toDay = ref(dayjs().format('YYYY-MM-DD'));

const searchConfig = ref(['Date', 'State', 'LM', 'Project']);
const searchForm = ref({
  date: dayjs().format('YYYY-MM-DD'),
  search: 'open' //approve
});

const isAllElementsEqual = ref(false);
const areAllElementsEqual = (arr) => {
  if (arr.length === 0) {
    // 如果数组为空，可以根据需求返回 true 或抛出错误，这里假设空数组视为所有元素“相同”
    return true;
  }

  const firstElement = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] !== firstElement) {
      return false;
    }
  }
  return true;
};

const loadData = (val) => {
  loading.value = true;
  // if (toDay.value !== searchForm.value.date) searchForm.apply_project_id = '';

  if (val) searchForm.value = { ...searchForm.value, ...val };
  cashFlowForecast(searchForm.value)
    .then((res) => {
      // res = {
      //   available_fund: '691321894.17',
      //   drawdown_num: {
      //     '2025-02': 1,
      //     '2025-03': 1,
      //     '2025-04': 1,
      //     '2025-05': 1,
      //     '2025-06': 1,
      //     '2025-07': 1,
      //     '2025-08': 1,
      //     '2025-09': 1,
      //     '2025-10': 1,
      //     '2025-11': 1,
      //     '2025-12': 1
      //   },
      //   repayment_num: {
      //     '2025-02': 0,
      //     '2025-03': 0,
      //     '2025-04': 0,
      //     '2025-05': 0,
      //     '2025-06': 0,
      //     '2025-07': 0,
      //     '2025-08': 0,
      //     '2025-09': 0,
      //     '2025-10': 0,
      //     '2025-11': 0,
      //     '2025-12': 0
      //   },
      //   managers: [
      //     {
      //       id: 57,
      //       uuid: 'abb493be-2e1a-4549-9366-851da8e180b6',
      //       customId: '',
      //       dept_id: 0,
      //       firstName: 'san',
      //       middleName: '',
      //       lastName: 'zhang',
      //       gender: 1,
      //       avatar: '',
      //       pre: '86',
      //       mobile: '18888888883',
      //       mobile_ok: 0,
      //       email: 'zxm3@gmail.com',
      //       email_ok: 1,
      //       birthday: null,
      //       country_code: '',
      //       province_code: '3384',
      //       city_code: '0',
      //       district_code: '0',
      //       addr: '43A Carthew Street',
      //       address: '',
      //       suburb: '\u014ckato',
      //       postal: '4335',
      //       city: '',
      //       username: '59310184',
      //       password: '$2y$10$JcFOOKR6YyYNYqyJ13H6j.gH4WwbSKJnsV7I5MStTKwKQBVSLufNC',
      //       salt: '',
      //       status: 1,
      //       intro: '',
      //       note: '',
      //       sort: 0,
      //       login_num: 32,
      //       login_ip: '219.79.44.5',
      //       login_time: '2025-01-07 16:57:18',
      //       cuid: 0,
      //       create_user: 1,
      //       create_time: '2025-01-05 01:02:58',
      //       update_user: 0,
      //       update_time: '2025-01-07 16:57:18',
      //       deleted: 0,
      //       delete_time: null
      //     }
      //   ],
      //   data: [
      //     {
      //       name: 'Repayments',
      //       data: {
      //         '2025-02': '22637046.27',
      //         '2025-03': '400053978.81',
      //         '2025-04': '17371547.39',
      //         '2025-05': '37394505.34',
      //         '2025-06': '11420332.09',
      //         '2025-07': '18276048.70',
      //         '2025-08': '19744315.08',
      //         '2025-09': '12298415.63	',
      //         '2025-10': '1773539.59',
      //         '2025-11': '4550024.63',
      //         '2025-12': '2575274527.33'
      //       }
      //     },
      //     {
      //       name: 'Drawdowns',
      //       data: {
      //         '2025-02': 643639554.81,
      //         '2025-03': 166914270.07,
      //         '2025-04': 165064441.38,
      //         '2025-05': 161500414.06,
      //         '2025-06': 157498357.43,
      //         '2025-07': 157078037.63,
      //         '2025-08': 154508688.26,
      //         '2025-09': 153725011.62,
      //         '2025-10': 153478685.95,
      //         '2025-11': 153094070.55,
      //         '2025-12': '0.00'
      //       }
      //     },
      //     {
      //       name: 'Total',
      //       data: {
      //         '2025-02': -621002508.54,
      //         '2025-03': 233139708.74,
      //         '2025-04': -147692893.99,
      //         '2025-05': -124105908.72,
      //         '2025-06': -146078025.34,
      //         '2025-07': -138801988.93,
      //         '2025-08': -134764373.18,
      //         '2025-09': -141426595.99,
      //         '2025-10': -151705146.36,
      //         '2025-11': -148544045.92,
      //         '2025-12': 2575274527.33
      //       }
      //     },
      //     {
      //       name: 'Available fund',
      //       data: {
      //         '2025-02': 70319385.63,
      //         '2025-03': 303459094.37,
      //         '2025-04': 155766200.38,
      //         '2025-05': 31660291.66,
      //         '2025-06': -114417733.68,
      //         '2025-07': -253219722.61,
      //         '2025-08': -387984095.79,
      //         '2025-09': -529410691.78,
      //         '2025-10': -681115838.14,
      //         '2025-11': -829659884.06,
      //         '2025-12': 1745614643.27
      //       }
      //     }
      //   ]
      // };
      data.value = res;
      let chartData = [];
      dates.value = [];
      if (!res.data) return;
      Object.keys(res.data[0].data).forEach((item) => {
        dates.value.push(item);
        chartData.push(res.data[3].data[item]);
      });
      chartData = chartData.map((item) => {
        return 0 - item;
      });

      Max.value = chartData.reduce((a, b) => Math.max(a, b), -Infinity);
      Min.value = chartData.reduce((a, b) => Math.min(a, b), Infinity);

      if (Max.value < 0) {
        Max.value = 0;
      }
      if (Min.value > 0) {
        Min.value = 0;
      }
      minMax.value = Math.abs(Max.value) + Math.abs(Min.value);

      isAllElementsEqual.value = areAllElementsEqual(chartData);

      // 全是负数的情况
      if (Max.value == 0) {
        zeroLine.value = 0;
      } else if (Min.value == 0) {
        zeroLine.value = 100;
      } else {
        zeroLine.value = (Max.value / minMax.value) * 100;
      }
      option.value.series[0].data = chartData;
      option.value.yAxis.min = Min.value;
      option.value.yAxis.max = Max.value;

      // console.log('Max', Max.value);
      // console.log('Min', Min.value);
      // console.log('minMax', minMax.value);
      // console.log('zeroLine', zeroLine.value);
      // console.log(chartData);
    })
    .finally(() => {
      loading.value = false;
    });
};
const mouseX = ref(0);
const mouseY = ref(0);
const showTipCard = ref(false);
const mousemove = (e, index) => {
  mouseX.value = e.screenX;
  mouseY.value = e.screenY;
  hoverIndex.value = index;
  showTipCard.value = true;
};
const mouseout = () => {
  showTipCard.value = false;
};

//图案颜色体现出repayment.drawdown所占比例
const setBarHeight = (index) => {
  let all = Math.abs(data.value.data[0].data[dates.value[index]]) + Math.abs(data.value.data[1].data[dates.value[index]]);
  return (Math.abs(data.value.data[0].data[dates.value[index]]) / all) * 100 + '%';
};
onMounted(() => {
  loadData();
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.datePicker {
  visibility: hidden;
  height: 0;
  padding: 0;
  width: 0;
  position: absolute;
  left: 0;
  bottom: 0;
}

.ant-radio-group-small .ant-radio-button-wrapper:first-child {
  border-start-start-radius: 14px;
  border-end-start-radius: 14px;
}
.ant-radio-group-small .ant-radio-button-wrapper:last-child {
  border-start-end-radius: 14px;
  border-end-end-radius: 14px;
}
.ant-radio-group-small .ant-radio-button-wrapper {
  font-size: 12px;
}
.ant-radio-group-solid .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
  background: rgba(215, 178, 126, 0.2);
  border-color: rgba(215, 178, 126, 0.2);
  color: #bf9425;
}
.ant-radio-button-wrapper:hover {
  color: #bf9425;
}
.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled)::before {
  background: rgba(215, 178, 126, 0.2);
}

.CashflowForecastChart {
  min-height: 348px;
  border-bottom: 1px solid #e2e5e2;
  display: grid;
  gap: 32px;
  grid-template-columns: 1fr 5fr 1fr;
  margin-bottom: 48px;
  margin-top: 72px;
  padding-bottom: 48px;
  .iconfont {
    font-size: 36px;
    color: #b8cdcc;
  }
  .zeroWrapper {
    position: absolute;
    left: 0;
    right: 0;
    top: 60px;
    bottom: 60px;
    .zeroLine {
      border-bottom: 1px dashed #bfbfbf;
      position: absolute;
      width: 100%;
      z-index: 1;
    }
  }
  .chart-list {
    display: grid;
    gap: 14px;
    grid-template-columns: repeat(12, 1fr);
    height: 100%;
    left: 0;
    padding-left: 8px;
    padding-right: 8px;
    position: relative;
    .chart-list-item {
      background-color: #f7f9f8;
      border: 1px solid #e2e5e2;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding-bottom: 60px;
      padding-top: 60px;
      position: relative;
      overflow: hidden;
      &.hover {
        background: transparent;
        border: none;
      }
      .month {
        bottom: 6px;
        left: 0;
        right: 0;
        text-align: center;
        position: absolute;
        width: 100%;
        color: #b8cdcc;
        font-size: 12px;
        text-transform: uppercase;
      }
      .inner {
        top: 0;
        background-color: #eeefdd;
        border: 1px solid rgba(169, 173, 87, 0.3);
        border-bottom: none;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        left: -1px;
        position: absolute;
        width: calc(100% + 2px);
      }
    }
  }
}

.chartBox {
  position: absolute;
  inset: 0;
  top: 60px;
  bottom: 60px;
}
.tooltipBoxWrapper {
  // display: none;
  position: fixed;
  top: 100px;
  padding: 10px;
  background: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  z-index: 3;
}

.tooltipBox {
  text-align: right;
  font-size: 14px;
  .card {
    padding: 15px 20px;
  }
  .iconfont {
    font-size: 16px;
    color: #181818;
  }
  .available-fund-icon {
    font-size: 36px;
    color: #b8cdcc;
  }
}

:deep(.chartTooltip) {
  border-radius: 8px !important;
  padding: 0 !important;
}

.hoverBox {
  position: absolute !important;
  inset: 0;
  z-index: 3;
}

.fs_2xl {
  font-weight: 700;
}
</style>
