<template>
  <a-spin :spinning="loading" size="large">
    <div class="title">
      <div class="bold fs_2xl">{{ t('贷款概览') }}</div>
    </div>
    <div class="flex header-static mt-10">
      <div class="item-content">
        <div class="item">
          <div class="line one"></div>
          <div class="info-content">
            <p>{{ t('总计金额') }}</p>
            <vco-number class="num" :value="statisticsData?.amount" :precision="2" :end="true"></vco-number>
            <div><vco-number class="num" :value="statisticsData?.boc_amount" :precision="2" :end="true"></vco-number><span class="bocLabel">(Boc)</span></div>
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
            <vco-number class="num" :value="statisticsData?.available_amount" :precision="2" :end="true"></vco-number>
            <div><vco-number class="num" :value="statisticsData?.boc_amount" :precision="2" :end="true"></vco-number><span class="bocLabel">(Boc)</span></div>
          </div>
        </div>
        <div class="item">
          <div class="line two"></div>
          <div class="info-content">
            <p>{{ t('已使用') }}</p>
            <vco-number class="num" :value="statisticsData?.use_amount" :precision="2" :end="true"></vco-number>
            <div><vco-number class="num" :value="statisticsData?.boc_amount" :precision="2" :end="true"></vco-number><span class="bocLabel">(Boc)</span></div>
          </div>
        </div>
        <div class="chart-content">
          <v-chart :option="option" autoresize />
        </div>
      </div>
      <a-row :gutter="16" class="income">
        <a-col :span="6">
          <p class="color_grey fs_xs">Interest</p>
          <p class="value"><vco-number class="num" :value="statisticsData?.Interest" :precision="2" :end="true"></vco-number></p>
          <div class="flex items-center"><vco-number class="num" :value="statisticsData?.boc_amount" :precision="2" :end="true"></vco-number><span class="bocLabel">(Boc)</span></div>
        </a-col>
        <a-col :span="6">
          <p class="color_grey fs_xs">{{t('建立费')}}</p>
          <p class="value"><vco-number class="num" :value="statisticsData?.Upfront" :precision="2" :end="true"></vco-number></p>
          <div class="flex items-center"><vco-number class="num" :value="statisticsData?.boc_amount" :precision="2" :end="true"></vco-number><span class="bocLabel">(Boc)</span></div>
        </a-col>
      </a-row>
    </div>
  </a-spin>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { userProject, statistics } from '@/api/invest/index';
const { t } = useI18n();

const props = defineProps({
  invest_id: {
    type: String
  }
});

const statisticsData = ref({});

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
          if (params.dataIndex !== 0) return '';
          const data = option.value.series[0].data || [];
          const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0);
          if (!total) return '0%';

          // 保留两位小数并截断，不进行四舍五入
          const rawPercent = (Number(params.value || 0) / total) * 100;
          const percent = Math.floor(rawPercent * 100) / 100;
          return `${percent}%`;
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

const loadData = (val) => {
  loading.value = true;
  statistics({ uuid: props.invest_id })
    .then((res) => {
      statisticsData.value = res;
      option.value.series[0].data[0].value = res.use_amount || 0;
      option.value.series[0].data[1].value = res.available_amount || 0;
    })
    .finally(() => {
      loading.value = false;
    });
};

watch(
  () => props.invest_id,
  (val) => {
    if (val) {
      loadData();
    }
  },
  {
    immediate: true
  }
);
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
  flex: 0 0 450px;
  .ant-col {
    margin-left: 46px;
    .vco-number.num {
      font-weight: 500;
      .ant-statistic-content {
        font-size: 16px !important;
      }
    }
  }
  
  .value {
    font-size: 16px;
  }
}

.bocLabel {
    font-size: 11px;
    padding-left: 5px;
    color: #666;
}
</style>
