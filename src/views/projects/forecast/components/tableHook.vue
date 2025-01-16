<template>
  <div>
    <a-spin :spinning="pageLoading" size="large">
      <div v-if="tabData.length" class="table-content">
        <div class="col-item th">
          <div class="item uppercase"></div>
          <div class="item uppercase">{{ t('月份') }}</div>
          <div class="item uppercase">{{ t('预测类型') }}</div>
          <div class="item uppercase">{{ t('客户经理') }}</div>
          <div class="item uppercase">{{ t('实时预报') }}</div>
          <div class="item uppercase">{{ t('日期') }}</div>
          <div class="item uppercase">{{ t('借记/贷记') }}</div>
          <div class="item uppercase">{{ t('绩效指标预测') }}</div>
          <div class="item uppercase">% var.</div>
          <div class="item uppercase">{{ t('绩效') }}</div>
          <div class="item uppercase">{{ t('历史') }}</div>
        </div>

        <div class="col-content">
          <div v-for="(item, index) in tabData" :key="index" class="col-block" :class="{ passed: item.passed }">
            <div v-for="(_item, _index) in item.list" :key="_item.date" class="col-item">
              <div class="item flex items-center"><span class="circle"></span></div>
              <div class="item">Nov ‘24</div>
              <div class="item">Initial drawdown</div>
              <div class="item flex items-center"><vco-avatar :size="30"></vco-avatar></div>
              <div class="item">
                <div class="flex items-center">
                  <span class="mr-3 color_grey fs_xs">12/12</span>
                  <vco-number :value="76923076.92" :precision="2" size="fs_xs" prefix="" suffix=""></vco-number>
                </div>
              </div>
              <div class="item">30 Nov ‘24</div>
              <div class="item">
                <vco-number :value="76923076.92" :precision="2" size="fs_xs" prefix="" suffix=""></vco-number>
              </div>
              <div class="item">
                <div class="flex items-center">
                  <span class="mr-3 color_grey fs_xs">12/12</span>
                  <vco-number :value="76923076.92" :precision="2" size="fs_xs" prefix="" suffix=""></vco-number>
                </div>
              </div>
              <div class="item"></div>
              <div class="item"></div>
              <div class="item"><i class="iconfont nav-icon">&#xe794;</i></div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="statisticsData && tabData.length" class="static-block flex">
        <div class="item">
          <p>{{ t('时期') }}</p>
          <h3>{{ t('{0}月', [statisticsData.last.days]) }}</h3>
          <div class="info">12 {{ t('月') }}</div>
        </div>
        <div class="sec-item mr-5">
          <p class="item-title">{{ t('提款') }}</p>
          <h3 class="white">{{ statisticsData.last.irr }}%</h3>
          <div class="info">12 Est. {{ t('提款') }}</div>
        </div>

        <div class="item">
          <p>{{ t('预计回撤') }}</p>
          <div class="flex justify-end items-center gap-1">
            <i class="iconfont" style="color: #a9ad57">&#xe767;</i>
            <vco-number :value="statisticsData.last.balance || 0" color="#ffffff" size="fs_xl" :precision="2" :end="true"></vco-number>
          </div>
          <div class="tips">
            <vco-number :value="statisticsData.last.FC2 || 0" color="#ffffff" size="fs_xs" :precision="2" :end="true"></vco-number>
            {{ t('可用余额') }}
          </div>
        </div>

        <div class="item">
          <p>{{ t('实际提取贷款') }}</p>
          <vco-number :value="statisticsData.last.withdrawn" color="#ffffff" size="fs_md" :precision="2" :end="true"></vco-number>
          <div class="tips">
            <vco-number :value="statisticsData.last.FC1 || 0" color="#ffffff" size="fs_xs" :precision="2" :end="true"></vco-number>
          </div>
        </div>
        <div class="item">
          <p>{{ t('预测撤回') }}</p>
          <vco-number :value="statisticsData.last.withdrawn" color="#ffffff" size="fs_md" :precision="2" :end="true"></vco-number>
          <div class="tips">
            <vco-number :value="statisticsData.last.FC1 || 0" color="#ffffff" size="fs_xs" :precision="2" :end="true"></vco-number>
          </div>
        </div>

        <div class="item">
          <p>{{ t('方差') }}</p>
          <h3 class="text-right">0%</h3>
        </div>

        <div class="item text-right">
          <p>{{ t('积分') }}</p>
          <h3>0</h3>
        </div>
      </div>

      <a-empty v-if="!statisticsData && !tabData.length && !pageLoading" />
    </a-spin>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { DownOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import tool from '@/utils/tool';
import { projectForecastIndex, projectForecastExportExcel, projectForecastStatistics } from '@/api/process';

const props = defineProps({
  currentId: {
    type: [String, Number],
    default: ''
  }
});

const { t } = useI18n();

const pageLoading = ref(false);
const tabData = ref([]);
const currentMonth = dayjs();
const statisticsData = ref(null);

const getDataInfo = () => {
  pageLoading.value = true;

  projectForecastIndex({
    uuid: props.currentId,
    limit: 5000
  })
    .then((res) => {
      const dataArr = [];
      const data = res.data.list || {};

      if (Object.keys(data).length) {
        for (const key in data) {
          const targetDate = dayjs(key);

          const itemData = data[key];
          itemData.forEach((item) => {
            if (item.type === 2) {
              item.drawdown = tool.formatMoney(item.amount);
            } else if (item.type === 4) {
              item.repayment = tool.formatMoney(item.amount);
            } else {
              item.fee = tool.formatMoney(item.amount);
            }
          });

          const obj = {
            list: itemData,
            passed: targetDate.isBefore(currentMonth, 'month') || targetDate.isSame(currentMonth, 'month')
          };

          dataArr.push(obj);
        }
      }

      tabData.value = dataArr;
      pageLoading.value = false;
    })
    .catch(() => {
      pageLoading.value = false;
    });

  projectForecastStatistics({
    uuid: props.currentId
  }).then((res) => {
    statisticsData.value = res;
    option.value.series[0].data[0].value = res.repayments || 0;
    option.value.series[0].data[1].value = res.pendingRepayment || 0;
  });
};

const downloading = ref(false);
const downLoadExcel = (type) => {
  const params = {
    type,
    uuid: props.currentId
  };
  downloading.value = true;
  projectForecastExportExcel(params)
    .then((res) => {
      downloading.value = false;
      window.open(res);
    })
    .catch(() => {
      downloading.value = false;
    });
};

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
      data: [{ value: 0 }, { value: 1 }],
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

onMounted(() => {
  if (props.currentId) {
    getDataInfo();
  }
});
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.table-content {
  margin-bottom: 20px;
  min-height: 300px;
  padding-top: 15px;
  .col-item {
    width: 100%;
    display: flex;
    &.th {
      font-weight: 500;
      color: @color_grey;
      font-size: 10px;
    }
    > .item {
      padding: 0 15px;
      &:nth-child(1) {
        width: 60px;
      }
      &:nth-child(2) {
        width: 80px;
      }
      &:nth-child(4) {
        width: 80px;
        text-align: center;
      }
      &:nth-child(6) {
        width: 100px;
        text-align: center;
      }
      &:nth-child(5),
      &:nth-child(7),
      &:nth-child(8) {
        width: 180px;
        text-align: center;
      }
      &:nth-child(9),
      &:nth-child(10),
      &:nth-child(11) {
        width: 100px;
        text-align: center;
      }
      &:nth-child(2) {
        flex: 1;
        text-align: left;
      }
      .note {
        font-size: 12px;
        color: #666;
      }
      .iconfont {
        font-size: 14px;
        margin-right: 5px;
      }
    }
  }
  .col-content {
    margin-top: 10px;
    .col-block {
      border-bottom: 1px solid #e2e5e2;
      padding: 5px 0;
      margin-top: 5px;
      &:last-child {
        border-bottom: none;
      }
      &.passed {
        background-color: #f0f0f0 !important;
        border: 1px solid #e2e5e2 !important;
        border-radius: 10px;
        .drawdown {
          color: #282828;
        }
      }
      .drawdown {
        color: @colorPrimary;
      }
      .type {
        span,
        p {
          font-weight: 500;
        }
      }
    }
    .col-item {
      padding: 6px 0;
      > .item {
        display: flex;
        flex-direction: column;
        justify-content: center;
        &:last-child {
          :deep(.ant-statistic-content) {
            font-weight: 500 !important;
            font-size: 16px !important;
            line-height: 26px;
          }
        }
      }
    }
  }
}

.static-block {
  background-color: #181818;
  color: #fff;
  align-items: flex-start;
  display: flex;
  padding: 20px 15px;
  border-radius: 12px;
  margin-top: 10px;
  font-weight: 500;
  > .item {
    &:nth-child(3){
      flex: 1;
      text-align: right;
    }
    &:nth-child(4),
    &:nth-child(5) {
      width: 300px;
      text-align: center;
    }
    > p {
      color: hsla(0, 0%, 100%, 0.5);
      font-size: 12px;
      font-weight: 400;
      margin-bottom: 6px;
      > span {
        padding-left: 5px;
      }
    }
    > h3 {
      font-size: 18px;
      line-height: 1.2;
    }
    > .info {
      font-size: 12px;
      > span {
        padding-left: 5px;
      }
    }
    > .tips {
      font-size: 11px;
    }
  }
  .sec-item {
    text-align: center;
    > p {
      color: hsla(0, 0%, 100%, 0.5);
      font-size: 12px;
      font-weight: 400;
      margin-bottom: 6px;
    }
    h3 {
      color: #b4d8d8;
      font-size: 14px;
      &.white {
        color: #fff;
        font-size: 16px;
      }
    }
  }
  .line {
    width: 1px;
    background-color: hsla(200, 9%, 66%, 0.3);
    margin: 0 8px;
  }
}

.nav-icon {
  transform: rotate(-45deg);
  color: #bf9425;
  font-size: 10px !important;
}

.circle {
  background-color: #b4d8d8;
  border: 1px solid;
  border-radius: 4px;
  display: inline-block;
  height: 8px;
  width: 8px;
}
</style>
