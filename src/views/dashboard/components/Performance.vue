<template>
  <div class="flex items-end justify-between mb-10">
    <div class="flex title flex-1 mr-4">
      <span class="fs_2xl">Forecast performance</span>
      <DropdownList :type="1" label="managers" labelKey="user_name" v-model:value="managersIds" @change="loadData()"></DropdownList>
    </div>
    <a-button type="cyan" size="small" shape="round" :loading="loading" @click="report">Create report</a-button>
  </div>
  <a-spin :spinning="loading" size="large">
    <div class="chart">
      <v-chart class="chart2" :option="option" autoresize />
    </div>
  </a-spin>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import DropdownList from './CashflowForecast/chooseList.vue';
import { forecastPerformance, transactionsExport } from '@/api/project/forecast';
import tool from '@/utils/tool';

const { t } = useI18n();

const props = defineProps([]);

const managersIds = ref('');
const loading = ref(false);
const option = ref({
  grid: {
    left: 50,
    right: 50,
    bottom: 50,
    top: 50
  },
  color: ['#b4d8d8'],
  legend: {},
  xAxis: {
    type: 'category',
    data: []
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: '{value}%' // 在 y 轴数值后添加 %
    },
    min: 0,
    max: 100,
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
    }
  },
  series: [
    {
      type: 'bar',
      barWidth: 50,
      data: []
    }
  ]
});

const loadData = () => {
  loading.value = true;
  forecastPerformance({ uid: managersIds.value })
    .then((res) => {
      option.value.series[0].data = res.data;
      option.value.xAxis.data = res.date.map((item) => {
        return tool.monthYear(item);
      });
    })
    .finally(() => {
      loading.value = false;
    });
};

const downloading = ref(false);
const report = () => {
  return
  downloading.value = true;
  transactionsExport({ uid: managersIds.value })
    .then((res) => {
      window.open(res);
    })
    .finally(() => {
      downloading.value = false;
    });
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.chart {
  height: 400px;
}
</style>
