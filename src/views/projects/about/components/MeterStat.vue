<template>
  <div class="indicatorsGrid">
    <div class="chart">
      <v-chart :option="option" autoresize />
      <v-chart class="chart2" :option="option2" autoresize />
    </div>
    <div class="MeterStat-row">
      <div class="MeterStat MeterStat_type_stone3">
        <div class="MeterStat-Meter"></div>
        <div>
          <p>Facility limit 2</p>
          <div class="fs_3xl bold">$0.00</div>
        </div>
      </div>
      <div class="MeterStat MeterStat_type_charcoal">
        <div class="MeterStat-Meter"></div>
        <div>
          <p>Current balance</p>
          <div class="fs_3xl bold" style="margin-bottom: 2px">$1,826,948.34</div>
          <p class="color_grey">$0.00 available</p>
        </div>
      </div>
      <div class="MeterStat MeterStat_type_dotsYellow">
        <div class="MeterStat-Dots">
          <div class="MeterStat-Dot"></div>
          <div class="MeterStat-Dot"></div>
          <div class="MeterStat-Dot"></div>
          <div class="MeterStat-Dot"></div>
        </div>
        <div>
          <p class="color_grey" style="margin-bottom: 2px">Accrued interest</p>
          <div class="fs_3xl bold">$8,509.07</div>
        </div>
      </div>
    </div>
    <div class="MeterStat-row">
      <div class="MeterStat MeterStat_type_transparent">
        <div class="MeterStat-Meter"></div>
        <div>
          <p>Facility limit 1</p>
          <div class="fs_3xl bold">$0.00</div>
        </div>
      </div>
      <div class="MeterStat MeterStat_type_cyan">
        <div class="MeterStat-Meter"></div>
        <div>
          <p>Drawn amount</p>
          <div class="fs_3xl bold" style="margin-bottom: 2px">$1,257,347.95</div>
          <p class="color_grey">$0.00 available</p>
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
          <div class="fs_3xl bold">$0.00</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps([]);

const option = ref({
  series: [
    {
      type: 'pie',
      center: ['50%', '50%'],
      radius: '100%',
      color: ['#272727', '#f3ede5'],
      label: {
        show: false
      },
      silent: true,
      data: [{ value: 20 }, { value: 80 }]
    }
  ]
});
// 初始化图表
const option2 = ref({
  autoFit: false,
  legend: false,
  tooltip: false,

  series: [
    {
      type: 'pie',
      center: ['50%', '50%'],
      radius: '100%',
      color: ['#b4f1db', '#fff'],
      label: {
        show: false
      },
      silent: true,
      data: [
        { value: 30 },
        {
          value: 80
        }
      ]
    }
  ]
});

// const data = [
//   {
//     type: 'withdrawal',
//     value: 213
//   },
//   {
//     type: 'pending',
//     value: 122
//   },
//   {
//     type: 'loan',
//     value: 523
//   }
// ];
// const options2 = ref( {
//         // 这里放置你的 ECharts 配置
//         theme: {
//           styleSheet: {
//             fontFamily: 'Aeonik, sans-serif'
//           }
//         },
//         series: [
//           {
//             type: 'pie',
//             radius: '99.5%',
//             silent: true,
//             autoFit: false, // 注意：autoFit 通常是容器或组件级别的设置，而不是 series 级别的
//             legend: { show: false }, // 注意：legend 通常也是组件级别的设置，但可以在 series 中覆盖
//             tooltip: { show: false }, // 同上
//             data: [
//               // 这里应该放置你的数据，例如：
//               { value: 100, name: 'withdrawal', type: 'withdrawal' },
//               { value: 200, name: 'loan', type: 'loan' },
//               { value: 300, name: 'pending', type: 'pending' },
//               // ...
//             ],
//             angleField: 'value',
//             colorField: 'type',
//             color: ['#B4F1DB', '#FBFBFB', '#FBFBFB'], // 注意：这里可能需要根据你的数据中的 type 数量来调整颜色数量
//             label: {
//               autoRotate: false,
//               position: 'inside', // 注意：ECharts 中使用 position 而不是 type
//               offset: ['0', '-50%'], // 注意：offset 通常是一个数组，包含水平和垂直偏移
//               formatter: ({ type, percent }) => {
//                 if (type === 'withdrawal') {
//                   return `${(percent * 100).toFixed(1)}%`;
//                 }
//                 // 可以添加其他类型的格式化逻辑
//                 return ''; // 如果没有匹配到类型，则不显示标签
//               },
//               rich: {
//                 // 如果需要更复杂的样式，可以使用 rich 字段定义
//                 boldLabel: {
//                   fontSize: 14,
//                   fontWeight: 'bold',
//                   align: 'center' // 注意：ECharts 中使用 align 而不是 textAlign
//                 }
//               },
//               // 如果不使用 rich，则直接在 style 中设置样式
//               style: {
//                 fontSize: 14,
//                 fontWeight: 'bold',
//                 textAlign: 'center' // 但实际上应该使用 align
//               }
//               // 注意：如果使用了 rich，则 style 字段将不会生效，样式应该在 rich 中定义
//             },
//             itemStyle: {
//               borderColor: ({ data }) => {
//                 // 注意：这里的数据访问方式可能需要根据实际情况调整
//                 // ECharts 中没有直接的 pieStyle 字段，但可以通过 itemStyle 或 emphasis.itemStyle 来设置
//                 return data.type === 'withdrawal' ? '#B4F1DB' :
//                        data.type === 'loan' ? '#FBFBFB' :
//                        undefined;
//               }
//             },
//             // ECharts 没有直接的 pattern 字段用于 pie 系列，但可以通过 itemStyle 的其他属性（如 fillPatternImage）来设置填充模式
//             // 如果需要自定义填充模式，你可能需要使用图形元素（如 graphic）或 SVG 图案作为背景
//           }
//         ]
//       })

</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.indicatorsGrid {
  align-items: center;
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr 1fr;
  margin-bottom: 40px;
}

.chart {
  position: relative;
  height: 100%;
  .chart2 {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 170px;
    height: 170px;
    border-radius: 50%;
    box-shadow: 0 3px 6px -4px hsla(0, 0%, 9%, 0.24), 0 6px 16px 0 hsla(0, 0%, 9%, 0.16), 0 9px 28px 8px hsla(0, 0%, 9%, 0.1);
  }
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
</style>
