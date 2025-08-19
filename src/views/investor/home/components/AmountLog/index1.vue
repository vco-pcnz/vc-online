<template>
  <a-spin :spinning="loading" size="large">
    <div class="flex title items-center gap-5">
      <div class="bold fs_2xl">{{ t('金额日志') }}</div>
      <SearchContent v-model:value="searchForm" :searchConfig="searchConfig" :open_hidden="true" :showPresets="false" downloadUrl="project/forecast/briefExport" @change="loadData"></SearchContent>
    </div>
    <div style="height: 350px" class="mt-10">
      <v-chart class="chart2" :option="option" autoresize />
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

const option = ref({
  grid: {
    left: 70,
    right: 50,
    bottom: 50,
    top: 50
  },
  color: ['#8eafad', '#e3edea'],
  legend: {},
  xAxis: {
    type: 'category',
    data: []
  },
  yAxis: {
    type: 'value',
    splitLine: {
      show: true, // 显示分割线
      lineStyle: {
        type: 'dashed', // 设置为虚线
        color: '#e1eded' // 设置颜色为红色
      }
    }
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    },
    formatter: function (params) {
      console.log(params);
      // 定义 tooltip 的 HTML 样式

      const bodyStyle = 'font-family: Aeonik, Arial, Helvetica, sans-serif;';

      let result = `<div style="color: #333;">${params[0].axisValue}</div>`; // 标题
      params.forEach((item) => {
        if (item.componentSubType === 'bar') {
          result += `
          <div style="${bodyStyle} margin-top: 4px;">
            ${item.marker} 
            <span style="">${item.seriesName}:</span> 
            <span style="color: #333;font-weight: bold;">${tool.formatMoney(item.value)}</span>
          </div>
        `;
        }
      });
      return result;
    }
  },
  series: []
});

const loading = ref(false);
const data = ref({});

const loadData = (val) => {
  loading.value = true;
  dashboard(searchForm.value)
    .then((res) => {
      res.data = {
        bar: [
          {
            name: t('可用余额1'),
            type: 'bar',
            data: ['244047.57', 0, '-765.75', '243809.28', '244056.65', '244059.47', '244059.47', '244059.47']
          },
          {
            name: t('已使用'),
            type: 'bar',
            data: ['237120.16', 0, '817.56', '236661.39', '236661.39', '237963.91', '237963.91', '237963.91']
          }
        ],
        time: ['2025-08-11', '2025-08-12', '2025-08-13', '2025-08-14', '2025-08-15', '2025-08-16', '2025-08-17', '2025-08-18']
      };
      option.value.xAxis.data = res.data.time.map((item) => {
        if (item.length == '7') {
          return tool.monthYear(item);
        }
        if (item.length == '10') {
          return tool.showDate(item);
        }
      });
      // let lineArr = cloneDeep(res.data.bar);
      // lineArr.map((item) => {
      //   item.type = 'line';
      //   item['smooth'] = true;
      // });
      option.value.series = [...res.data.bar];
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
