<template>
  <div>
    <vco-page-panel :isBack="true" :title="t('明细表')" v-if="showBack">
      <div class="flex">
        <FormModal :invest_id="invest_id" :use_date="statisticsData?.use_date" @update="getDataInfo">
          <a-button type="cyan" shape="round">{{ t('添加记录') }}</a-button>
        </FormModal>
        <vco-import type="file" :params="{ id: invest_id }" imporUrl="/invest/schedule/import" @change="getDataInfo">
          <a-button type="cyan" shape="round" class="ml-5">{{ t('导入') }}</a-button>
        </vco-import>
      </div>
    </vco-page-panel>
    <div class="flex justify-end" style="margin-top: -50px; margin-bottom: 20px; padding-right: 28px">
      <TableSearch @search="searchHandle"></TableSearch>
    </div>

    <a-spin :spinning="pageLoading" size="large">
      <div style="min-height: 200px">
        <div v-if="statisticsData" class="flex header-static">
          <div class="item-content">
            <div class="item">
              <div class="line one"></div>
              <div class="info-content">
                <p>{{ t('总计金额') }}</p>
                <vco-number class="num" :value="statisticsData?.amount" :precision="2" :end="true"></vco-number>
                <div>
                  <vco-number :value="statisticsData?.available" color="#666666" size="fs_xs" :precision="2" :end="true"></vco-number>
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
                <p>{{ t('已使用') }}</p>
                <vco-number class="num" :value="statisticsData.use_amount || 0" :precision="2" :end="true"></vco-number>
              </div>
            </div>
            <div class="chart-content">
              <v-chart :option="option" autoresize />
            </div>
            <div class="item">
              <div class="info-content">
                <p>{{ t('放款') }}</p>
                <vco-number class="num" :value="statisticsData?.drawdown" :precision="2" :end="true"></vco-number>
              </div>
              <div class="line two"></div>
            </div>
            <div class="item">
              <div class="info-content">
                <p>{{ t('还款') }}</p>
                <vco-number class="num" :value="Math.abs(statisticsData?.repayment)" :precision="2" :end="true"></vco-number>
              </div>
              <div class="line three"></div>
            </div>
          </div>

          <div class="flex flex-col items-center gap-6">
            <a-dropdown :trigger="['click']">
              <a-button :loading="downloading" type="dark" class="big shadow bold uppercase flex-button">
                {{ t('创建报告') }}
                <DownOutlined />
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item>
                    <div class="pt-2 pb-2" @click="downLoadExcel(1)">Notes register</div>
                  </a-menu-item>
                  <a-menu-item>
                    <div class="pt-2 pb-2" @click="downLoadExcel(2)">Monthly Fee</div>
                  </a-menu-item>
                  <a-menu-item>
                    <div class="pt-2 pb-2" @click="downLoadExcel(3)">Schedule</div>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
        <vco-popconfirm v-if="showBack" :formParams="{ invest_id: invest_id, ids: checkedIds }" url="invest/schedule/delete" :disabled="!checkedIds.length" :tip="t('确定删除吗？')" @update="getDataInfo()">
          <a-button :disabled="!checkedIds.length" class="mb-3">
            {{ t('删除') }}
          </a-button>
        </vco-popconfirm>
        <div v-if="tabData.length" class="table-content">
          <div class="col-item th">
            <div class="item about flex items-center" @click="checkedAllHandle">
              <a-checkbox v-if="showBack" :checked="Boolean(checkedAll)" :indeterminate="Boolean(indeterminate)"></a-checkbox>
            </div>
            <div class="item uppercase">{{ t('日期') }}</div>
            <div class="item uppercase">{{ t('类型') }}</div>
            <div class="item uppercase">{{ t('说明') }}</div>
            <div class="item uppercase">{{ t('利息、费用') }}</div>
            <div class="item uppercase">{{ t('放款') }}</div>
            <div class="item uppercase">{{ t('还款') }}</div>
            <div class="item uppercase balance">{{ t('余额') }}</div>
            <div class="item uppercase ops" v-if="showBack">Ops</div>
          </div>

          <div class="col-content">
            <div v-for="(_item, _index) in tabData" :key="_item.date" class="col-item">
              <div class="item about flex">
                <a-checkbox v-if="showBack" :checked="checkedIds.includes(_item.id)" @change="itemcheck(_item)"></a-checkbox>
                <span v-else class="circle"></span>
              </div>
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
              <div class="item">
                <vco-number v-if="_item.is_fee" :value="_item.amount" :precision="2" :end="true"></vco-number>
              </div>
              <div class="item drawdown">
                <vco-number v-if="_item.is_irr && _item.amount >= 0" :value="_item.amount" :precision="2" :end="true"></vco-number>
              </div>
              <div class="item">
                <vco-number v-if="_item.is_irr && _item.amount < 0" :value="_item.amount" :precision="2" :end="true"></vco-number>
              </div>
              <div class="item balance">
                <vco-number :value="_item.balance" :precision="2" :end="true"></vco-number>
              </div>
              <div class="item ops cursor-pointer" v-if="showBack">
                <!--  v-if="dayjs(_item.date).isAfter(statisticsData.use_date, 'day')" -->
                <vco-popconfirm :formParams="{ invest_id: invest_id, ids: [_item.id] }" url="invest/schedule/delete" :tip="t('确定删除吗？')" @update="getDataInfo()">
                  <i class="iconfont">&#xe8c1;</i>
                </vco-popconfirm>
              </div>
            </div>
          </div>
        </div>
      </div>

      <a-empty v-if="!tabData.length && !pageLoading" />
      <div v-if="statisticsData" class="static-block flex">
        <div class="item">
          <p>
            {{ t('目前总计') }}
          </p>
          <h3>{{ t('{0}天', [statisticsData.daysDiff]) }}</h3>
        </div>
        <div class="item">
          <p>interest & Line fee</p>
          <div class="flex justify-center">
            <vco-number :value="statisticsData.interest" color="#ffffff" size="fs_md" :precision="2" :end="true"></vco-number>
            <span class="mx-3"></span>
            <vco-number :value="statisticsData.linefee" color="#ffffff" size="fs_md" :precision="2" :end="true"></vco-number>
          </div>
        </div>
        <div class="item">
          <p>{{ t('提现') }}</p>
          <vco-number :value="statisticsData.drawdown" color="#ffffff" size="fs_md" :precision="2" :end="true"></vco-number>
        </div>
        <div class="item">
          <p>{{ t('已偿还') }}</p>
          <vco-number :value="Math.abs(statisticsData.repayment)" color="#ffffff" size="fs_md" :precision="2" :end="true"></vco-number>
        </div>
        <div class="item">
          <p>{{ t('已使用') }}</p>
          <div class="flex justify-end items-center gap-1">
            <vco-number :value="statisticsData.use_amount" color="#ffffff" size="fs_xl" :precision="2" :end="true"></vco-number>
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import { DownOutlined, RightOutlined } from '@ant-design/icons-vue';
import tool, { selectDateFormat } from '@/utils/tool';
import FormModal from './components/FormModal.vue';
import TableSearch from './components/TableSearch.vue';
import { scheduleList, scheduleStatistics, scheduleExportExcel, userProject } from '@/api/invest/index';
import { useRoute } from 'vue-router';
const route = useRoute();

const props = defineProps({});

const { t } = useI18n();

const pageLoading = ref(false);
const tabData = ref([]);
const statisticsData = ref(null);
const invest_id = ref();

const checkedList = ref([]); // 原始数据
const checkedIds = ref([]); // uuid

// 全选状态
const checkedAll = computed(() => {
  const currentIds = tabData.value.map((item) => item.id);
  const currentCheckIds = checkedIds.value.filter((item) => currentIds.includes(item));
  return currentCheckIds.length && currentCheckIds.length == currentIds.length;
});

// 半选状态
const indeterminate = computed(() => {
  const currentIds = tabData.value.map((item) => item.id);
  const currentCheckIds = checkedIds.value.filter((item) => currentIds.includes(item));
  return currentCheckIds.length && currentCheckIds.length !== currentIds.length;
});
// 单个复选
const itemcheck = (item) => {
  let index = checkedIds.value.indexOf(item.id);
  if (index < 0) {
    checkedIds.value.push(item.id);
    checkedList.value.push(item);
  } else {
    checkedIds.value.splice(index, 1);
    checkedList.value.splice(index, 1);
  }
};
// 全选
const checkedAllHandle = (val) => {
  const isCheck = !checkedAll.value;
  tabData.value.map((item) => {
    let index = checkedIds.value.indexOf(item.id);
    if (!isCheck) {
      if (index !== -1) {
        checkedIds.value.splice(index, 1);
        checkedList.value.splice(index, 1);
      }
    } else {
      if (index == -1) {
        checkedIds.value.push(item.id);
        checkedList.value.push(item);
      }
    }
  });
};

const searchForm = ref({});

const getDataInfo = (val) => {
  pageLoading.value = true;

  if (val) {
    searchForm.value = val;
  }
  let params = {
    invest_id: invest_id.value
  };
  if (val) {
    params = {
      invest_id: invest_id.value,
      ...val
    };
  }

  scheduleList(params)
    .then((res) => {
      tabData.value = res.data || [];
      console.log(tabData.value);
      pageLoading.value = false;
    })
    .catch(() => {
      pageLoading.value = false;
    });

  scheduleStatistics(params).then((res) => {
    if (res) {
      statisticsData.value = res;
      option.value.series[0].data[0].value = tool.minus(res.amount || 0, res.available || 0);
      option.value.series[0].data[1].value = res.available || 0;
    }
  });
};

const downloading = ref(false);
const downLoadExcel = (type) => {
  downloading.value = true;
  scheduleExportExcel({ invest_id: invest_id.value, type: type, ...searchForm.value })
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
const searchHandle = (data = {}) => {
  const params = {
    ...data
  };
  getDataInfo(params);
};

const showBack = ref(false);
onMounted(() => {
  if (route.query.uuid) {
    invest_id.value = route.query.uuid;
    getDataInfo();
  } else {
    userProject().then((res) => {
      if (res && res.length) {
        invest_id.value = res[0].id;
        getDataInfo();
      }
    });
  }

  if (window.location.pathname.includes('Investment/schedule')) {
    showBack.value = true;
  }
});
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.header-static {
  align-items: center;
  margin-bottom: 40px;
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
      font-weight: bold;
      font-size: 10px;
      color: #888;
    }
    > .item {
      padding: 0 15px;
      &:nth-child(1) {
        width: 0;
        &.about {
          width: 40px;
        }
      }
      &:nth-child(2) {
        width: 120px;
      }
      &:nth-child(3) {
        width: 180px;
        word-break: break-all;
      }
      &:nth-child(4) {
        // width: 220px;
        flex: 1;
      }
      &:nth-child(5),
      &:nth-child(6),
      &:nth-child(7) {
        width: 170px;
        text-align: center;
      }
      &.balance {
        width: 200px;
        text-align: right;
      }
      &.ops {
        width: 50px;
        text-align: center;
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
        &.ops {
          width: 50px;
          text-align: center;
          .iconfont {
            color: @color_red-error;
          }
        }
        :deep(.ant-statistic-content) {
          font-weight: 500 !important;
          font-size: 16px !important;
          line-height: 26px;
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
  padding: 20px 0;
  border-radius: 12px;
  margin-top: 10px;
  font-weight: 500;
  > .item {
    padding: 0 15px;
    &:last-child {
      flex: 1;
      text-align: right;
    }
    &:first-child {
      width: 610px;
    }
    &:nth-last-child(2),
    &:nth-last-child(3),
    &:nth-last-child(4) {
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
    .day-box {
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

.circle {
  background-color: #b4d8d8;
  border: 1px solid;
  border-radius: 4px;
  display: inline-block;
  height: 8px;
  width: 8px;
  background-color: #181818;
}
</style>
