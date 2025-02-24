<template>
  <a-spin :spinning="loading" size="large">
  <div class="indicatorsGrid">
    <div class="MeterStat MeterStat_type_charcoal">
      <div class="MeterStat-Meter"></div>
      <div>
        <p>
          {{ t('未解押') }}
          <span>({{ statistics.unreleased_total }})</span>
        </p>
        <vco-number :bold="true" :value="statistics.unreleased_money" :precision="2" style="margin-bottom: 2px"></vco-number>
        <div class="info-txt">
          <p class="flex items-center gap-2">
            <span>{{ t('土地总额') }}</span>
            <vco-number :value="statistics.unreleased_land_amount" :precision="2" :end="true"></vco-number>
          </p>
          <p class="flex items-center gap-2">
            <span>{{ t('建筑总额') }}</span>
            <vco-number :value="statistics.unreleased_build_amount" :precision="2" :end="true"></vco-number>
          </p>
        </div>
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
        <p>
          {{ t('已解押') }}
          <span>({{ statistics.released_total }})</span>
        </p>
        <vco-number :bold="true" :value="statistics.released_money" :precision="2" style="margin-bottom: 2px"></vco-number>
        <div class="info-txt">
          <p class="flex items-center gap-2">
            <span>{{ t('土地总额') }}</span>
            <vco-number :value="statistics.released_land_amount" :precision="2" :end="true"></vco-number>
          </p>
          <p class="flex items-center gap-2">
            <span>{{ t('建筑总额') }}</span>
            <vco-number :value="statistics.released_build_amount" :precision="2" :end="true"></vco-number>
          </p>
        </div>
      </div>
    </div>

    <div class="chart">
      <v-chart class="chart2" :option="option" autoresize />
    </div>

    <div class="MeterStat MeterStat_type_transparent text-right">
      <div>
        <p>
          {{ t('抵押物') }}
          <span>({{ statistics.all_total }})</span>
        </p>
        <vco-number :bold="true" :value="statistics.all_money" :precision="2" style="margin-bottom: 2px"></vco-number>
        <div class="info-txt">
          <p class="flex items-center gap-2 justify-end">
            <vco-number :value="statistics.all_land_amount" :precision="2" :end="true"></vco-number>
            <span>{{ t('土地总额') }}</span>
            
          </p>
          <p class="flex items-center gap-2 justify-end">
            <vco-number :value="statistics.all_build_amount" :precision="2" :end="true"></vco-number>
            <span>{{ t('建筑总额') }}</span>
          </p>
        </div>
      </div>
      <div class="MeterStat-Meter"></div>
    </div>
  </div>
  </a-spin>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { journalStatistics } from '@/api/project/journal';

const { t } = useI18n();

const props = defineProps({
  uuid: {
    type: String
  },
  projectDetail: {
    type: Object
  }
});

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
      color: ['rgba(169, 173, 87, 0.7)', '#f3ede5'],
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

const statistics = ref({
    "unreleased_total": 0,
    "unreleased_insurance_value": 0,
    "unreleased_money": 0,
    "unreleased_build_amount": 0,
    "unreleased_land_amount": 0,
    "released_total": 0,
    "released_insurance_value": 0,
    "released_money": 0,
    "released_build_amount": 0,
    "released_land_amount": 0,
    "all_total": 0,
    "all_insurance_value": 0,
    "all_money": 0,
    "all_build_amount": 0,
    "all_land_amount": 0
  });

const loadData = () => {
  loading.value = true
  journalStatistics({ uuid: props.uuid }).then((res) => {
    statistics.value = res
    const unreleased_total = statistics.value.all_total ? statistics.value.unreleased_total : 1
    option.value.series[0].data = [{ value: statistics.value.released_total }, { value: unreleased_total }]
  }).finally(_ => {
    loading.value = false
  });
}

onMounted(() => {
  loadData()
});

// 暴露方法给父组件
defineExpose({
  loadData
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.indicatorsGrid {
  align-items: center;
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  margin-bottom: 40px;
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
.MeterStat_type_transparent > .MeterStat-Meter {
  background-color: #f3ede5;
  border-color: hsla(200, 9%, 66%, 0.5);
}
.MeterStat_type_charcoal > .MeterStat-Meter {
  background-color: #272727;
  border-color: #272727;
}
.MeterStat-Dots {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.MeterStat-Dot {
  background-color: rgba(169, 173, 87, 0.7);
  border: 1px solid rgba(109, 123, 31, 0.5);
  border-radius: 3px;
  height: 6px;
  width: 6px;
}
.chart {
  height: 180px;
  width: 180px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
  border-radius: 50%;
}

.info-txt {
  font-size: 12px;
  font-weight: normal;
  color: #888;
  text-align: right;
  :deep(.ant-statistic-content) {
    font-size: 12px !important;
    font-weight: normal !important;
    color: #333 !important;
  }
}
</style>
