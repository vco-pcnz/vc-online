<template>
  <a-spin :spinning="loading" size="large">
    <div class="title">
      <div class="bold fs_2xl">{{ t('统计') }}</div>
    </div>
    <div class="flex header-static mt-10">
      <div class="item-content">
        <div class="item">
          <div class="line one"></div>
          <div class="info-content">
            <p>{{ t('总计金额') }}</p>
            <vco-number class="num" :value="statisticsData?.amount" :precision="2" :end="true"></vco-number>
          </div>
        </div>
        <div class="item">
          <div class="line-content">
            <div class="round"></div>
            <div class="round"></div>
            <div class="round"></div>
            <div class="round"></div>
          </div>
          <div class="info-content">
            <p>{{ t('可用余额1') }}</p>
            <vco-number class="num" :value="statisticsData?.available" :precision="2" :end="true"></vco-number>
          </div>
        </div>
        <div class="item">
          <div class="line two"></div>
          <div class="info-content">
            <p>{{ t('已使用') }}</p>
            <vco-number class="num" :value="tool.minus(statisticsData.amount || 0, statisticsData.available || 0)" :precision="2" :end="true"></vco-number>
          </div>
        </div>
        <div class="chart-content">
          <v-chart :option="option" autoresize />
        </div>
      </div>
      <a-row :gutter="16" class="income">
        <a-col :span="6">
          <p class="color_grey fs_xs">Interest ({{ statisticsData.rate || 0 }}%)</p>
          <p class="value">{{ tool.formatMoney(statisticsData.interest) }}</p>
        </a-col>
        <a-col :span="6" class="">
          <p class="color_grey fs_xs">Line fee ({{ statisticsData.linFeeRate || 0 }}%)</p>
          <p class="value">{{ tool.formatMoney(statisticsData.linefee) }}</p>
        </a-col>
        <a-col :span="6">
          <p class="color_grey fs_xs">Upfront fee</p>
          <p class="value">{{ tool.formatMoney(statisticsData.upfrontfee || 0) }}</p>
        </a-col>
        <a-col :span="6">
          <p class="color_grey fs_xs">Average LVR</p>
          <p class="value">{{ statisticsData.lvr || 0 }}%</p>
        </a-col>
        <a-col :span="6">
          <p class="color_grey fs_xs">Average LTC</p>
          <p class="value">{{ statisticsData.ltc || 0 }}%</p>
        </a-col>
      </a-row>
    </div>
  </a-spin>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { scheduleStatistics, userProject } from '@/api/invest/index';
const { t } = useI18n();

const statisticsData = ref({
  total: '0',
  available: '0',
  used: '0',
  interestRate: '10',
  interest: '3649635',
  linFeeRate: '10',
  lineFee: '3649635',
  upfrontfee: '3649635',
  lvr: '10',
  ltc: '3',
  irr: '10'
});

const option = ref({
  series: [
    {
      type: 'pie',
      center: ['50%', '50%'],
      radius: '100%',
      color: ['#272727', '#f4eee8'],
      label: {
        show: false
      },
      silent: true,
      data: [{ value: 1 }, { value: 1 }],
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
      }
    }
  ]
});

const loading = ref(false);
const data = ref({});

const loadData = (val) => {
  loading.value = true;
  scheduleStatistics({ invest_id: invest_id.value })
    .then((res) => {
      statisticsData.value = res;
      option.value.series[0].data[0].value = tool.minus(res.amount || 0, res.available || 0);
      option.value.series[0].data[1].value = res.available || 0;
    })
    .finally(() => {
      loading.value = false;
    });
};

const invest_id = ref('');

onMounted(() => {
  userProject().then((res) => {
    if (res && res.length) {
      invest_id.value = res[0].id;
      loadData();
    }
  });
});
</script>

<style lang="less" scoped>
.header-static {
  margin-bottom: 60px;
  align-items: center;
  .item-content {
    display: flex;
    flex: 1;
    gap: 45px;
    align-items: center;
    > .item {
      display: flex;
      gap: 15px;
      min-height: 75px;
      min-width: 15%;
      flex: 1;
      > .line {
        border-radius: 4px;
        width: 6px;
        &.one {
          background-color: rgba(169, 173, 87, 0.7);
          border: 1px solid rgba(109, 123, 31, 0.5);
        }
        &.two {
          background-color: #272727;
          border-color: #272727;
        }
        &.three {
          background-color: #6d7b1f;
        }
      }
      > .line-content {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        > .round {
          background-color: rgba(169, 173, 87, 0.7);
          border: 1px solid rgba(109, 123, 31, 0.5);
          border-radius: 3px;
          height: 6px;
          width: 6px;
        }
      }
      > .info-content {
        > p {
          font-size: 14px;
          font-weight: 500;
        }
        .vco-number.num {
          font-weight: 500;
          :deep(.ant-statistic-content) {
            font-size: 16px !important;
          }
        }
        > div {
          display: flex;
          align-items: center;
          color: #666;
          > span {
            font-size: 11px;
            padding-left: 5px;
          }
        }
      }
    }
    .chart-content {
      width: 160px;
      height: 160px;
      position: relative;
      &::after {
        content: '';
        display: block;
        width: 160px;
        height: 160px;
        border-radius: 50%;
        background-color: transparent;
        box-shadow: 0 5px 24px rgba(169, 173, 87, 0.5);
        position: absolute;
        top: 0;
        left: 0;
      }
    }
  }
}

:deep(.income) {
  .ant-col {
    height: 60px;
    margin-left: 46px;
  }
  .value {
    font-size: 16px;
  }
}
</style>
