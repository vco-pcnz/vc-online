<template>
  <a-spin :spinning="pageLoading" size="large">
    <div class="main-info-container">
      <vco-page-panel :title="t('还款计划')" @back="goBack">
        <div>fdsa</div>
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
    </div>
  </a-spin>
</template>


<script setup>
  import { ref, onMounted, computed } from "vue";
  import { useRoute } from "vue-router";
  import { useI18n } from "vue-i18n";
  import dayjs from "dayjs";
  import tool, { goBack } from "@/utils/tool"
  import { projectForecastIndex } from "@/api/process"
  
  const { t } = useI18n();
  const route = useRoute();

  const pageLoading = ref(false)
  const tabData = ref([])
  const currentId = ref()
  const currentMonth = dayjs();

  const getDataInfo = () => {
    pageLoading.value = true

    projectForecastIndex({
      uuid: currentId.value,
      limit: 5000
    }).then(res => {
      console.log(res)
      const dataArr = []
      const data = res.data.list || {}

      if (Object.keys(data).length) {
        for (const key in data) {
          const targetDate = dayjs(key)

          console.log('targetDate', targetDate)

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
          
          console.log('key', obj)
          dataArr.push(obj)
        }
      }

      tabData.value = dataArr
      pageLoading.value = false
    }).catch(() => {
      pageLoading.value = false
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
          &:last-child {
            :deep(.ant-statistic-content) {
              font-weight: 500;
              font-size: 16px;
            }
          }
        }
      }
    }
  }
</style>