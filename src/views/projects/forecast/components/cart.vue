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
        <v-chart class="chart2" :option="option" autoresize />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

// 初始化图表
const option = ref({
  title: {
    text: 'Forecast Drawdowns',
    left: 'center'
  },
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
    data: ["Jan'25", "Feb'25", "Mar'25", "Apr'25", "May'25", "Jun'25", "Jul'25", "Aug'25", "Sep'25", "Oct'25", "Nov'25", "Dec'25"]
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: '{value}k'
    }
  },
  series: [
    {
      name: 'Drawdowns',
      type: 'bar',
      data: [0, 6, 12, 6, 0, 0, 0, 0, 0, 0, 0, 0], // 示例数据，根据实际情况调整
      markPoint: {
        data: [
          { type: 'max', name: 'Max' },
          { type: 'min', name: 'Min' }
        ]
      },
      markLine: {
        data: [{ type: 'average', name: 'Average' }]
      }
    }
  ]
});
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
</style>
