<template>
  <div>
    <a-spin :spinning="pageLoading" size="large">
      <div style="min-height: 200px">
        <div v-if="statisticsData && tabData.length" class="flex header-static">
          <div class="item-content">
            <div class="item">
              <div class="line one"></div>
              <div class="info-content">
                <p>{{ t('当前余额') }}</p>
                <vco-number class="num" :value="statisticsData.currentBalance" :precision="2" :end="true"></vco-number>
                <div>
                  <vco-number :value="statisticsData.available" color="#666666" size="fs_xs" :precision="2" :end="true"></vco-number>
                  <span>{{ t('可用余额') }}</span>
                </div>
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
                <p>{{ t('应计利息') }}</p>
                <vco-number class="num" :value="statisticsData.accruedInterest" :precision="2" :end="true"></vco-number>
              </div>
            </div>
            <div class="chart-content">
              <v-chart :option="option" autoresize />
            </div>
            <div class="item">
              <div class="info-content">
                <p>{{ 'Facility limit 2' }}</p>
                <vco-number class="num" :value="statisticsData.forecastFC2" :precision="2" :end="true"></vco-number>
                <div>
                  <span>{{ t('包括利息和费用') }}</span>
                </div>
              </div>
              <div class="line two"></div>
            </div>
            <div class="item">
              <div class="info-content">
                <p>{{ t('还款') }}</p>
                <vco-number class="num" :value="statisticsData.repayments" :precision="2" :end="true"></vco-number>
                <div>
                  {{ statisticsData.repaid }}%
                  <span>{{ t('已偿还') }}</span>
                </div>
              </div>
              <div class="line three"></div>
            </div>
          </div>

          <a-dropdown :trigger="['click']">
            <a-button :loading="downloading" type="dark" class="big shadow bold uppercase flex-button">
              {{ t('创建报告') }}
              <DownOutlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item>
                  <div class="pt-2 pb-2" @click="downLoadExcel(1)">{{ t('预测放款时间表') }}</div>
                </a-menu-item>
                <a-menu-item>
                  <div class="pt-2 pb-2" @click="downLoadExcel(2)">{{ t('放款时间表') }}</div>
                </a-menu-item>
                <a-menu-item>
                  <div class="pt-2 pb-2" @click="downLoadExcel(0)">{{ t('额度费用计算时间表') }}</div>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>

        <div v-if="tabData.length" class="table-content">
          <div class="col-item th">
            <div class="item uppercase">{{ t('日期') }}</div>
            <div class="item uppercase">{{ t('类型') }}</div>
            <div class="item uppercase">{{ t('说明') }}</div>
            <div class="item uppercase">{{ t('利息、费用') }}</div>
            <div class="item uppercase">{{ t('放款') }}</div>
            <div class="item uppercase">{{ t('还款') }}</div>
            <div class="item uppercase">{{ t('余额') }}</div>
          </div>

          <div class="col-content">
            <div v-for="(item, index) in tabData" :key="index" class="col-block" :class="{ passed: item.passed }">
              <div v-for="(_item, _index) in item.list" :key="_item.date" class="col-item">
                <div class="item">{{ tool.showDate(_item.date) }}</div>
                <div class="item type">
                  <div v-if="[2, 4].includes(_item.type)">
                    <i v-if="_item.type === 2" class="iconfont">&#xe755;</i>
                    <i v-if="_item.type === 4" class="iconfont">&#xe757;</i>
                    <span>{{ _item.name }}</span>
                  </div>
                  <p v-else>{{ _item.name }}</p>
                </div>
                <div class="item">
                  <p class="note">{{ _item.note }}</p>
                </div>
                <div class="item">{{ _item.fee }}</div>
                <div class="item drawdown">{{ _item.drawdown }}</div>
                <div class="item">{{ _item.repayment }}</div>
                <div class="item">
                  <vco-number :value="_item.balance" :precision="2" :end="true"></vco-number>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="statisticsData && tabData.length" class="static-block flex">
          <div class="item flex-1">
            <p>
              {{ t('目前总计') }}
              <span>{{ statisticsData.now.day }}</span>
            </p>
            <h3>{{ t('还有{0}天开放', [statisticsData.now.days]) }}</h3>
          </div>
          <div class="item">
            <p>{{ t('利息及费用') }}</p>
            <vco-number :value="statisticsData.now.interestFees" color="#ffffff" size="fs_md" :precision="2" :end="true"></vco-number>
          </div>
          <div class="item">
            <p>{{ t('提现') }}</p>
            <vco-number :value="statisticsData.now.withdrawn" color="#ffffff" size="fs_md" :precision="2" :end="true"></vco-number>
          </div>
          <div class="item">
            <p>{{ t('已偿还') }}</p>
            <vco-number :value="statisticsData.now.repaid" color="#ffffff" size="fs_md" :precision="2" :end="true"></vco-number>
          </div>
          <div class="item">
            <p>{{ t('余额') }}</p>
            <div class="flex justify-end items-center gap-1">
              <i class="iconfont" style="color: #a9ad57">&#xe767;</i>
              <vco-number :value="statisticsData.now.balance" color="#ffffff" size="fs_xl" :precision="2" :end="true"></vco-number>
            </div>
          </div>
        </div>

        <div v-if="statisticsData && tabData.length" class="static-block flex">
          <div class="item">
            <p>{{ t('估计总数') }}</p>
            <h3>{{ t('{0}天', [statisticsData.last.days]) }}</h3>
            <div class="info">
              {{ t('到期日') }}
              <span v-if="statisticsData.last.day">{{ dayjs(statisticsData.last.day).format('DD/MM/YYYY') }}</span>
            </div>
          </div>
          <div class="flex-1 flex gap-4 justify-end pr-2">
            <div class="sec-item mr-5">
              <p class="item-title">{{ t('总内部收益率') }}</p>
              <div class="flex justify-end items-center gap-1">
                <i class="iconfont" style="color: #b8cdcc">&#xe761;</i>
                <h3 class="white">{{ statisticsData.last.irr }}%</h3>
              </div>
            </div>
            <div class="sec-item">
              <p class="item-title">{{ t('利息') }}</p>
              <h3>{{ statisticsData.last.interestRate || 0 }}%</h3>
              <vco-number :value="statisticsData.last.interest || 0" color="#ffffff" size="fs_xs" :precision="2" :end="true"></vco-number>
            </div>
            <div class="line"></div>
            <div class="sec-item">
              <p class="item-title">{{ t('费率') }}</p>
              <h3>{{ statisticsData.last.feesRate || 0 }}%</h3>
              <vco-number :value="statisticsData.last.fees || 0" color="#ffffff" size="fs_xs" :precision="2" :end="true"></vco-number>
            </div>
          </div>
          <div class="item">
            <p>{{ t('利息及费用') }}</p>
            <vco-number :value="statisticsData.last.interestFees || 0" color="#ffffff" size="fs_md" :precision="2" :end="true"></vco-number>
          </div>
          <div class="item">
            <p>{{ t('提现') }}</p>
            <vco-number :value="statisticsData.last.withdrawn" color="#ffffff" size="fs_md" :precision="2" :end="true"></vco-number>
            <div class="tips">
              <p>{{ t('facility limit {0}', [1]) }}</p>
              <vco-number :value="statisticsData.last.FC1 || 0" color="#ffffff" size="fs_xs" :precision="2" :end="true"></vco-number>
            </div>
          </div>
          <div class="item">
            <p>{{ t('已偿还') }}</p>
            <vco-number :value="statisticsData.last.repaid" color="#ffffff" size="fs_md" :precision="2" :end="true"></vco-number>
          </div>
          <div class="item">
            <p>{{ t('余额') }}</p>
            <div class="flex justify-end items-center gap-1">
              <i class="iconfont" style="color: #a9ad57">&#xe767;</i>
              <vco-number :value="statisticsData.last.balance || 0" color="#ffffff" size="fs_xl" :precision="2" :end="true"></vco-number>
            </div>
            <div class="tips">
              <p>{{ t('facility limit {0}', [2]) }}</p>
              <vco-number :value="statisticsData.last.FC2 || 0" color="#ffffff" size="fs_xs" :precision="2" :end="true"></vco-number>
            </div>
          </div>
        </div>

        <a-empty v-if="!statisticsData && !tabData.length && !pageLoading" />
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { DownOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import tool from '@/utils/tool';
import { projectForecastIndex, projectDetailForecastList, projectForecastExportExcel, projectForecastStatistics } from '@/api/process';

const props = defineProps({
  currentId: {
    type: [String, Number],
    default: '',
  },
  isDetails: {
    type: Boolean,
    default: false
  }
});

const { t } = useI18n();

const pageLoading = ref(false);
const tabData = ref([]);
const currentMonth = dayjs();
const statisticsData = ref(null);

const getDataInfo = () => {
  pageLoading.value = true;

  const ajaxFn = props.isDetails ? projectDetailForecastList : projectForecastIndex

  ajaxFn({
    uuid: props.currentId,
    limit: 5000,
  })
    .then((res) => {
      const dataArr = [];
      const data = res.data || {};

      if (Object.keys(data).length) {
        for (const key in data) {
          const targetDate = dayjs(key);

          const itemData = data[key];
          itemData.forEach((item, index) => {
            if (item.type === 2) {
              item.drawdown = tool.formatMoney(item.amount);
            } else if (item.type === 4) {
              item.repayment = tool.formatMoney(item.amount);
            } else {
              if (item.type === 0) {
                if (!index) {
                  item.fee = tool.formatMoney(item.amount);
                } else {
                  if (Number(item.amount) > 0) {
                    item.drawdown = tool.formatMoney(item.amount);
                  } else {
                    item.repayment = tool.formatMoney(item.amount);
                  }
                }
              } else {
                item.fee = tool.formatMoney(item.amount);
              }
            }
          });

          const obj = {
            list: itemData,
            passed: targetDate.isBefore(currentMonth, 'month') || targetDate.isSame(currentMonth, 'month'),
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
    uuid: props.currentId,
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
    uuid: props.currentId,
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
        show: false,
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
          textBorderWidth: 0, // 取消描边
        },
      },
    },
  ],
});

onMounted(() => {
  if (props.currentId) {
    getDataInfo();
  }
});
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.header-static {
  margin-bottom: 60px;
  gap: 80px;
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
      > .line {
        border-radius: 4px;
        width: 6px;
        &.one {
          background-color: rgba(169, 173, 87, 0.7);
          border: 1px solid rgba(109, 123, 31, 0.5);
        }
        &.two {
          background-color: #f7f9f8;
          border: 1px solid #e2e5e2;
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
            font-size: 22px !important;
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

.table-content {
  margin-bottom: 20px;
  min-height: 300px;
  border-top: 1px solid #808080;
  padding-top: 15px;
  .col-item {
    width: 100%;
    display: flex;
    &.th {
      font-weight: 500;
    }
    > .item {
      padding: 0 15px;
      &:nth-child(1) {
        width: 150px;
      }
      &:nth-child(2) {
        width: 160px;
      }
      &:nth-child(3) {
        width: 280px;
      }
      &:nth-child(4),
      &:nth-child(5),
      &:nth-child(6) {
        width: 170px;
        text-align: center;
      }
      &:last-child {
        flex: 1;
        text-align: right;
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
    &:last-child {
      width: 215px;
      text-align: right;
    }
    &:nth-last-child(2),
    &:nth-last-child(3),
    &:nth-last-child(4) {
      width: 170px;
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
</style>
