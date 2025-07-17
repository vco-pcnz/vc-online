<template>
  <div class="flex items-end title mt-10">
    <div class="flex items-center gap-5">
      <div v-if="showArrow" class="flex-1 fs_2xl cursor-pointer" @click="navigationTo('/dashboard/income')">{{ t('收入') }} <i class="iconfont">&#xe794;</i></div>
      <div v-else class="flex-1 fs_2xl cursor-pointer" @click="goBack()"><i class="iconfont" style="rotate: 180deg; display: inline-block">&#xe794;</i>{{ t('收入') }}</div>

      <div>
        {{ t('数据更新时间') }}: {{ tool.showTime('2025-07-17') }}
        <a-button type="cyan" class="ml-3">{{ t('更新') }}</a-button>
      </div>
    </div>

    <SearchContent v-model:value="searchForm" :searchConfig="searchConfig" downloadUrl="project/forecast/cashFlowForecastExport" @change="loadData"></SearchContent>
  </div>
  <a-spin :spinning="loading" size="large">
    <div class="chart" @click="navigationTo('/dashboard/income')">
      <v-chart class="chart2" :option="option" autoresize />
    </div>
  </a-spin>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import tool, { goBack, navigationTo } from '@/utils/tool';
import SearchContent from './SearchContent/index.vue';
import dayjs from 'dayjs';
import { profitSta } from '@/api/project/forecast';

const { t } = useI18n();

const props = defineProps({
  showArrow: {
    type: Boolean,
    default: false
  }
});

const loading = ref(false);

const searchConfig = ref(['Time', 'LM', 'Project']);
const searchForm = ref({
  start_date: dayjs().add(-7, 'd').format('YYYY-MM-DD'),
  end_date: dayjs().format('YYYY-MM-DD'),
  search: 'open' //approve
});

const option = ref({
  grid: {
    left: 70,
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
    // axisLabel: {
    //   formatter: '{value}%' // 在 y 轴数值后添加 %
    // },
    // min: 0,
    // max: 100,
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
      type: 'bar', //line
      barWidth: 50,
      data: []
    }
  ]
});

const loadData = (val) => {
  let params = searchForm.value;
  if (val) params = { ...searchForm.value, ...val };
  loading.value = true;
  profitSta(params)
    .then((res) => {
      if (res && res.length) {
        option.value.series[0].data = res.map((item) => item.amount);
        option.value.xAxis.data = res.map((item) => {
          if (item.time.length == '7') {
            return tool.monthYear(item.time);
          }
          if (item.time.length == '10') {
            return tool.showDate(item.time);
          }
        });
      }
    })
    .finally(() => {
      loading.value = false;
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
