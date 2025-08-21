<template>
  <div class="flex items-end title mt-10">
    <div class="flex items-center gap-5">
      <div v-if="showArrow" class="flex-1 fs_2xl cursor-pointer" @click="navigationTo('/dashboard/income')">{{ t('收入') }} <i class="iconfont">&#xe794;</i></div>
      <div v-else class="flex-1 fs_2xl cursor-pointer" @click="goBack()"><i class="iconfont" style="rotate: 180deg; display: inline-block">&#xe794;</i>{{ t('收入') }}</div>

      <div>
        <span v-if="updateTime">{{ tool.showTime(updateTime) }}</span>
        <a-button type="cyan" class="ml-3" :loading="updateLoading" @click="update">{{ t('更新') }}</a-button>
      </div>
    </div>

    <SearchContent v-model:value="searchForm" :searchConfig="searchConfig" downloadUrl="project/forecast/profitStaExport" @change="loadData"></SearchContent>
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
import { profitSta, profitUpd } from '@/api/project/forecast';
import { cloneDeep } from 'lodash';

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
  color: ['#f1e4b4', '#98c2db', '#d3bcbd', '#bad7d5', '#e3edea'],
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

const loadData = (val) => {
  let params = searchForm.value;
  if (val) params = { ...searchForm.value, ...val };
  loading.value = true;
  profitSta(params)
    .then((res) => {
      option.value.xAxis.data = res.data.time.map((item) => {
        if (item.length == '7') {
          return tool.monthYear(item);
        }
        if (item.length == '10') {
          return tool.showDate(item);
        }
        if (item.length == '4') {
          return item;
        }
      });
      // let lineArr = cloneDeep(res.data.bar);
      // lineArr.map((item) => {
      //   item.type = 'line';
      //   item['smooth'] = true;
      // });
      option.value.series = [...res.data.bar];
      updateTime.value = res.otherInfo;
    })
    .finally(() => {
      loading.value = false;
    });
};

const updateTime = ref('');
const updateLoading = ref(false);
const update = () => {
  updateLoading.value = true;
  profitUpd()
    .then((res) => {
      loadData();
    })
    .finally(() => {
      updateLoading.value = false;
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
  margin-top: 15px;
}
</style>
