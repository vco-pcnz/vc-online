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
        <v-chart class="chart2" v-if="option" :option="option" autoresize />
      </div>
    </div>
  </div>
</template>

<script setup>
import { forIn } from 'lodash';
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';

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

const init = () => {
  let date = [];
  if (props.data?.list) {
    for (let key in props.data.list) {
      date.push(tool.monthYear(key));
    }
  }
  option.value.xAxis.data = date;
};

onMounted(() => {
  init();
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
