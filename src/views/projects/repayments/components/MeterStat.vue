<template>
  <a-spin :spinning="loading" size="large">
  <div class="indicatorsGrid" :class="{ 'indicatorsGrid-compact': isNormalUser }">
    <div class="MeterStat MeterStat_type_charcoal">
      <div class="MeterStat-Meter"></div>
      <div>
        <p>{{ isNormalUser ? t('当前余额') : t('还款1') }}</p>
        <vco-number :bold="true" :value="isNormalUser? statistics?.currentBalance : statistics?.loanRepaid" :precision="2" style="margin-bottom: 2px"></vco-number>
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
        <p class="color_grey" style="margin-bottom: 2px">{{ isNormalUser ? t('应计利息') : t('待还款') }}</p>
        <vco-number :bold="true" :value="isNormalUser? statistics?.accruedInterest : statistics?.pendingRepayment" :precision="2"></vco-number>
        <p style="opacity: 0">.</p>
      </div>
    </div>
    <div class="chart">
      <v-chart class="chart2" :option="option" autoresize />
    </div>
    <div class="MeterStat MeterStat_type_transparent text-right">
      <div>
        <div>
          <p>{{ isNormalUser ? t('预计还款今天') : t('贷款余额1') }}</p>
          <vco-number :bold="true" :value="isNormalUser ? estPayoffToday : statistics?.loanBalance" :precision="2"></vco-number>
          <p v-if="!isNormalUser" class="color_grey">{{ t('包括利息和费用') }}</p>
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
import { loanRstatistics } from '@/api/project/loan';
import useUserStore from '@/store/modules/user';
import tool from '@/utils/tool';

const { t } = useI18n();
const userStore = useUserStore();
// isNormalUser 为真表示外部用户
const isNormalUser = computed(() => userStore.isNormalUser);

// 外部用户预计还款金额 = 当前余额 + 应计利息
const estPayoffToday = computed(() => {
  return tool.plus(statistics.value?.currentBalance || 0, statistics.value?.accruedInterest || 0);
});

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

const statistics = ref();

const totalLoan = computed(() => {
  const money = props.projectDetail?.loan?.loan_money || 0
  return money
})

const loadData = () => {
  loading.value = true
  loanRstatistics({ uuid: props.uuid }).then((res) => {
    statistics.value = res;

    const num = 100
    let rate = res.rate || 0

    // 外部用户：rate = currentBalance / estPayoffToday * 100
    if (isNormalUser.value) {
      const currentBalance = res.currentBalance || 0
      const accruedInterest = res.accruedInterest || 0
      const payoff = tool.plus(currentBalance, accruedInterest) // estPayoffToday
      if (Number(payoff) > 0) {
        rate = Number(tool.times(tool.div(currentBalance, payoff), 100))
      } else {
        rate = 0
      }
    }

    option.value.series[0].data = [{ value: rate }, { value: num - rate }]
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
.indicatorsGrid-compact .MeterStat-Meter {
  height: 58px;
}
.indicatorsGrid-compact .MeterStat-Dots {
  height: 58px;
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
  justify-content: space-around;
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
</style>
