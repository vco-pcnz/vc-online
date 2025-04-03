<template>
  <div class="grid">
    <div>
      <p>Last forecast updated 9 Feb 2025 by System User</p>

      <div>
        <i class="iconfont">&#xe744;</i>
        <p class="color_grey fs_xl"><span class="fs_3xl bold color_coal">0</span> 0% variance</p>
        <p class="color_grey fs_xs">Project points for forecast performance</p>
      </div>
    </div>
    <div>
      <div style="height: 200px">
        <div class="flex gap-5 chart-head">
          <div class="item"><span class="Dot"></span>Est. Drawdown</div>
          <div class="item"><span class="Dot"></span>Drawdown</div>
          <div class="item"><span class="Dot"></span>Est. Repayments</div>
          <div class="item"><span class="Dot"></span>Repayments</div>
        </div>
        <v-chart class="chart2" v-if="option" :option="option" autoresize />
      </div>
    </div>
  </div>
</template>

<script setup>
import { forIn } from 'lodash';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { color } from 'echarts';

const props = defineProps({
  uuid: {
    type: [String, Number],
    default: ''
  },
  data: {
    type: Object
  }
});
// 初始化图表
const option = ref({
  grid: {
    bottom: 40,
    left: 40,
    right: 40,
    top: 40
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: []
  },
  color: ['#569695', '#181818', '#181818', '#181818', '#181818', '#181818'],
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: '{value}k'
    }
  },
  series: []
});

const init = () => {
  let date = [];
  let series = [
    {
      name: 'Direct',
      type: 'bar',
      barWidth: '12px',
      itemStyle: {
        borderRadius: 12
      },
      data: [320, 332, 301, 334, 390, 330, 320]
    },
    {
      name: 'drawdown',
      type: 'bar',
      stack: 'drawdown',
      barWidth: '12px',
      itemStyle: {
        borderRadius: 12
      },
      data: [120, 132, 101, 134, 90, 230, 210]
    },
    {
      name: 'drawdown',
      type: 'bar',
      stack: 'drawdown',
      barWidth: '12px',
      itemStyle: {
        borderRadius: 12
      },
      data: [220, 182, 191, 234, 290, 330, 310]
    },
    {
      name: 'drawdown',
      type: 'bar',
      stack: 'drawdown',
      barWidth: '12px',
      itemStyle: {
        borderRadius: 12
      },
      data: [120, 232, 201, 124, 190, 330, 410]
    }
  ];
  // let drawdown = []
  let drawdown = [];
  // type 2 Drawdown
  // type 4 Repayments
  //item?.forecast_log?.length && item.status != 0 => item.forecast_log[item.forecast_log.length - 1].amount
  if (props.data?.list) {
    for (let key in props.data.list) {
      date.push(tool.monthYear(key));
      props.data.list[key].map((item) => {});
    }
  }
  option.value.xAxis.data = date;
  option.value.series = series;
};

watch(
  () => props.data,
  (val) => {
    if (val) {
      init();
    }
  },
  {
    immediate: true
  }
);
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
.grid {
  display: grid;
  gap: 36px;
  grid-template-columns: 2fr 8fr;
  .iconfont {
    color: #569695;
    font-size: 48px;
  }
}

.chart-head {
  .item {
    display: flex;
    gap: 4px;
    align-items: center;

    .Dot {
      border-radius: 4px;
      display: inline-block;
      height: 8px;
      width: 8px;
    }
    &:nth-child(1) .Dot {
      background: rgb(24, 24, 24);
    }
    &:nth-child(2) .Dot {
      background: red;
    }
    &:nth-child(3) .Dot {
      background: rgb(214, 169, 31);
    }
    &:nth-child(4) .Dot {
      background: red;
    }
  }
}
</style>
