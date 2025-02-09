<template>
  <a-spin :spinning="loading" size="large">
  <div class="indicatorsGrid">
    <div class="MeterStat MeterStat_type_charcoal">
      <div class="MeterStat-Meter"></div>
      <div>
        <p>Current balance</p>
        <vco-number :bold="true" :value="statistics?.loanWithdrawal" :precision="2" style="margin-bottom: 2px"></vco-number>
        <p class="color_grey flex">
          <vco-number :value="statistics?.available" :precision="2" size="fs_xs" color="#888" class="mr-2"></vco-number> available</p>
      </div>
    </div>
    <div class="MeterStat MeterStat_type_dotsBlack">
      <div class="MeterStat-Dots">
        <div class="MeterStat-Dot"></div>
        <div class="MeterStat-Dot"></div>
        <div class="MeterStat-Dot"></div>
        <div class="MeterStat-Dot"></div>
      </div>
      <div>
        <p class="color_grey" style="margin-bottom: 2px">Pending drawdown</p>
        <vco-number :bold="true" :value="statistics?.pendingDrawdown" :precision="2"></vco-number>
        <p style="opacity: 0">.</p>
      </div>
    </div>
    <div class="chart">
      <v-chart class="chart2" :option="option" autoresize />
    </div>
    <div class="MeterStat MeterStat_type_transparent text-right">
      <div>
        <p>Loan</p>
        <vco-number :bold="true" :value="statistics?.loan" :precision="2"></vco-number>
        <p class="color_grey">excluding interest & fees</p>
      </div>
      <div class="MeterStat-Meter"></div>
    </div>
  </div>
  </a-spin>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { loanDstatistics } from '@/api/project/loan';

const { t } = useI18n();

const props = defineProps(['uuid']);
const loading = ref(false)
// 初始化图表
const option = ref({
  autoFit: false,
  legend: false,
  tooltip: false,

  series: [
    {
      type: 'pie',
      center: ['50%', '50%'],
      radius: '100%',
      color: ['#181818', 'rgba(169, 173, 87, 0.7)', '#fff'],
      label: {
        show: false
      },
      label: {
        show: true, // 显示标签
        position: 'inside', // 标签位置：扇区内部
        formatter: function (params) {
          // 仅显示第一个数据项的百分比
          return params.dataIndex === 0 ? `{d}%`.replace('{d}', params.percent) : '';
        },
        textStyle: {
          color: '#fff', // 文本颜色
          fontWeight: 'bold',
          fontSize: 14,
          textBorderWidth: 0 // 取消描边
        }
      },
      silent: true,
      data: []
    }
  ]
});

const statistics = ref();

onMounted(() => {
  loading.value = true
  loanDstatistics({ uuid: props.uuid }).then((res) => {
    statistics.value = res;
    option.value.series[0].data = [{ value: statistics.value.loanWithdrawal }, { value: statistics.value.pendingDrawdown }, { value: statistics.value.loan }]
  }).finally(_ => {
    loading.value = false
  });
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.indicatorsGrid {
  align-items: center;
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr 1fr 1fr;
}

.MeterStat-row {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.MeterStat {
  display: flex;
  font-weight: 500;
  gap: 24px;
  flex: 1;
}
.MeterStat-Meter {
  border: 1px solid;
  border-radius: 4px;
  width: 6px;
}
.MeterStat_type_stone3 > .MeterStat-Meter {
  background-color: #f3ede5;
  border-color: #f3ede5;
}
.MeterStat_type_transparent > .MeterStat-Meter {
  background-color: transparent;
  border-color: hsla(200, 9%, 66%, 0.5);
}
.MeterStat_type_charcoal > .MeterStat-Meter {
  background-color: #272727;
  border-color: #272727;
}
.MeterStat-Dots {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}
.MeterStat-Dot {
  background-color: rgba(169, 173, 87, 0.7);
  border: 1px solid rgba(109, 123, 31, 0.5);
  border-radius: 3px;
  height: 6px;
  width: 6px;
}
.MeterStat_type_cyan > .MeterStat-Meter {
  background-color: #b4f1db;
  border-color: #b4f1db;
}
.MeterStat_type_dotsYellow .MeterStat-Dot {
  background-color: #f19915;
  border-color: #f19915;
}
.chart {
  height: 180px;
  width: 180px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  border-radius: 50%;
}
</style>
