<template>
  <a-spin :spinning="pageLoading" size="large">
    <div class="main-info-container">
      <vco-page-panel :title="t('放款计划')" @back="goBack">
        <a-dropdown :trigger="['click']">
          <a-button
            :loading="downloading"
            type="dark" class="big shadow bold uppercase flex-button"
          >
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
      </vco-page-panel>

      <div class="table-content">
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
          <div v-for="(item, index) in tabData" :key="index" class="col-block" :class="{'passed': item.passed}">
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
          <p>{{ t('目前总计') }}<span>{{ nowDate }}</span></p>
          <h3>{{ t('还有{0}天开放', [statisticsData.sdaysDiff]) }}</h3>
        </div>
        <div class="item">
          <p>{{ t('利息及费用') }}</p>
          <vco-number :value="0" color="#ffffff" size="fs_md" :precision="2" :end="true"></vco-number>
        </div>
        <div class="item">
          <p>{{ t('提现') }}</p>
          <vco-number :value="0" color="#ffffff" size="fs_md" :precision="2" :end="true"></vco-number>
        </div>
        <div class="item">
          <p>{{ t('已偿还') }}</p>
          <vco-number :value="0" color="#ffffff" size="fs_md" :precision="2" :end="true"></vco-number>
        </div>
        <div class="item">
          <p>{{ t('余额') }}</p>
          <div class="flex justify-end items-center gap-1">
            <i class="iconfont" style="color: #a9ad57;">&#xe767;</i>
            <vco-number :value="0" color="#ffffff" size="fs_xl" :precision="2" :end="true"></vco-number>
          </div>
        </div>
      </div>

      <div v-if="statisticsData && tabData.length" class="static-block flex">
        <div class="item">
          <p>{{ t('估计总数') }}</p>
          <h3>{{ t('{0}天', [statisticsData.edaysDiff]) }}</h3>
          <div class="info">{{ t('到期日') }}<span v-if="statisticsData.end_date">{{ dayjs(statisticsData.end_date).format('DD/MM/YYYY') }}</span></div>
        </div>
        <div class="flex-1 flex gap-4 justify-end pr-2">
          <div class="sec-item mr-5">
            <p class="item-title">{{ t('总内部收益率') }}</p>
            <div class="flex justify-end items-center gap-1">
              <i class="iconfont" style="color: #b8cdcc;">&#xe761;</i>
              <h3 class="white">0.00%</h3>
            </div>
          </div>
          <div class="sec-item">
            <p class="item-title">{{ t('利息') }}</p>
            <h3>{{ statisticsData.interestRate || 0 }}%</h3>
            <vco-number :value="statisticsData.interestMoney || 0" color="#ffffff" size="fs_xs" :precision="2" :end="true"></vco-number>
          </div>
          <div class="line"></div>
          <div class="sec-item">
            <p class="item-title">{{ t('费率') }}</p>
            <h3>{{ statisticsData.lineFeeRate || 0 }}%</h3>
            <vco-number :value="statisticsData.lineFeeMoney || 0" color="#ffffff" size="fs_xs" :precision="2" :end="true"></vco-number>
          </div>
        </div>
        <div class="item">
          <p>{{ t('利息及费用') }}</p>
          <vco-number :value="statisticsData.interestFees || 0" color="#ffffff" size="fs_md" :precision="2" :end="true"></vco-number>
        </div>
        <div class="item">
          <p>{{ t('提现') }}</p>
          <vco-number :value="0" color="#ffffff" size="fs_md" :precision="2" :end="true"></vco-number>
          <div class="tips">
            <p>{{ t('facility limit {0}', [1]) }}</p>
            <vco-number :value="statisticsData.FC1 || 0" color="#ffffff" size="fs_xs" :precision="2" :end="true"></vco-number>
          </div>
        </div>
        <div class="item">
          <p>{{ t('已偿还') }}</p>
          <vco-number :value="0" color="#ffffff" size="fs_md" :precision="2" :end="true"></vco-number>
        </div>
        <div class="item">
          <p>{{ t('余额') }}</p>
          <div class="flex justify-end items-center gap-1">
            <i class="iconfont" style="color: #a9ad57;">&#xe767;</i>
            <vco-number :value="statisticsData.lastBalance || 0" color="#ffffff" size="fs_xl" :precision="2" :end="true"></vco-number>
          </div>
          <div class="tips">
            <p>{{ t('facility limit {0}', [2]) }}</p>
            <vco-number :value="statisticsData.FC2 || 0" color="#ffffff" size="fs_xs" :precision="2" :end="true"></vco-number>
          </div>
        </div>
      </div>
    </div>
  </a-spin>
</template>


<script setup>
  import { ref, onMounted, computed } from "vue";
  import { DownOutlined } from '@ant-design/icons-vue';
  import { useRoute } from "vue-router";
  import { useI18n } from "vue-i18n";
  import dayjs from "dayjs";
  import tool, { goBack } from "@/utils/tool"
  import { projectForecastIndex, projectForecastExportExcel, projectForecastStatistics } from "@/api/process"
  
  const { t } = useI18n();
  const route = useRoute();

  const pageLoading = ref(false)
  const tabData = ref([])
  const currentId = ref()
  const currentMonth = dayjs();

  const statisticsData = ref(null)

  const nowDate = computed(() => {
    return dayjs(new Date()).format('DD/MM/YYYY')
  })

  const getDataInfo = () => {
    pageLoading.value = true

    projectForecastIndex({
      uuid: currentId.value,
      limit: 5000
    }).then(res => {
      const dataArr = []
      const data = res.data.list || {}

      if (Object.keys(data).length) {
        for (const key in data) {
          const targetDate = dayjs(key)

          const itemData = data[key]
          itemData.forEach(item => {
            if (item.type === 2) {
              item.drawdown = tool.formatMoney(item.amount)
            } else if (item.type === 4) {
              item.repayment = tool.formatMoney(item.amount)
            } else {
              item.fee = tool.formatMoney(item.amount)
            }
          })

          const obj = {
            list: itemData,
            passed: targetDate.isBefore(currentMonth, 'month') || targetDate.isSame(currentMonth, 'month')
          }
          
          dataArr.push(obj)
        }
      }

      tabData.value = dataArr
      pageLoading.value = false
    }).catch(() => {
      pageLoading.value = false
    })

    projectForecastStatistics({
      uuid: currentId.value
    }).then(res => {
      statisticsData.value = res
    })
  }

  const downloading = ref(false)
  const downLoadExcel = (type) => {
    const params = {
      type,
      uuid: currentId.value
    }
    downloading.value = true
    projectForecastExportExcel(params).then(res => {
      downloading.value = false
      window.open(res)
    }).catch(() => {
      downloading.value = false
    })
  }

  onMounted(() => {
    const { uuid_info } = route.query;
    if (uuid_info) {
      currentId.value = uuid_info
      getDataInfo()
    } else {
      pageLoading.value = false
    }
  })
</script>

<style lang="less" scoped>
  @import '@/styles/variables.less';

  .table-content {
    margin-bottom: 20px;
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
        color: hsla(0, 0%, 100%, .5);
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
        color: hsla(0, 0%, 100%, .5);
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
      background-color: hsla(200, 9%, 66%, .3);
      margin: 0 8px;
    }
  }
</style>