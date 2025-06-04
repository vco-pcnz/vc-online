<template>
  <div class="flex items-end">
    <div class="flex title flex-1 gap-3">
      <span class="fs_2xl bold">Cashflow forecast</span>
      <a-button type="brown" size="small" :class="['picker-btn', { open: isOpen }]" shape="round" @click="isOpen = true">
        {{ tool.showDate(searchForm.date) }} <DownOutlined class="DropdownIcon" />
        <a-date-picker
          class="datePicker"
          inputReadOnly
          :open="isOpen"
          :disabledDate="disabledDateFormat"
          v-model:value="searchForm.date"
          :format="selectDateFormat()"
          valueFormat="YYYY-MM-DD"
          :showToday="false"
          @change="loadData()"
          @openChange="(val) => (isOpen = val)"
        />
      </a-button>
      <!-- {{ userStore.userInfo }} -->
      <DropdownList v-if="toDay === searchForm.date" :type="2" label="requests" labelKey="project_name" searchKey="project_name" v-model:value="searchForm.apply_project_id" @change="loadData()"></DropdownList>

      <a-button type="brown" size="small" shape="round" @click="setSearchFormSearch">for {{ searchForm.search }}</a-button>
    </div>

    <a-button type="cyan" size="small" class="ml-3" shape="round" @click="report" :loading="downloading">Create report</a-button>
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
  <Forecast :date="dates[hoverIndex]" v-model:visible="visible_forecast"></Forecast>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import tool, { selectDateFormat } from '@/utils/tool';
import { DownOutlined } from '@ant-design/icons-vue';
import dayjs, { Dayjs } from 'dayjs';
import TableBlock from './TableBlock.vue';
import { cashFlowForecast, cashFlowForecastExport } from '@/api/project/forecast';
import DropdownList from './chooseList.vue';
import Forecast from './ForecastModal.vue';
import VcoNumberNew from './vco-number-new.vue';
import LineLabel from './line-label.vue';
import { useUserStore } from '@/store';

const { t } = useI18n();
const userStore = useUserStore();

const props = defineProps([]);

const isOpen = ref(false);

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

const disabledDateFormat = (current) => {
  const endDate = new Date();
  if (current && current.isAfter(endDate, 'day')) {
    return true;
  }

  return false;
};

const data = ref(null);
const zeroLine = ref(0);
const Min = ref(0);
const Max = ref(0);
const minMax = ref(0);
const dates = ref([]);
const loading = ref(false);
const toDay = ref(dayjs().format('YYYY-MM-DD'));
const searchForm = ref({
  date: dayjs().format('YYYY-MM-DD'),
  uid: '',
  apply_project_id: '',
  search: 'open' //approve
});

const downloading = ref(false);
const report = () => {
  downloading.value = true;
  cashFlowForecastExport(searchForm.value)
    .then((res) => {
      window.open(res);
    })
    .finally(() => {
      downloading.value = false;
    });
};

const setSearchFormSearch = () => {
  searchForm.value.search = searchForm.value.search == 'open' ? 'approve' : 'open';
  loadData();
};

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

const loadData = () => {
  loading.value = true;
  if (toDay.value !== searchForm.value.date) searchForm.apply_project_id = '';
  cashFlowForecast(searchForm.value)
    .then((res) => {
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
  mouseX.value = e.clientX;
  mouseY.value = e.clientY + 90;
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
  margin-top: 12px;
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
      // overflow: hidden;
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
</style>
