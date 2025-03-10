<template>
  <div>
    <div class="table-content">
      <div class="col-item th">
        <div class="item uppercase"></div>
        <div class="item uppercase">{{ t('月份') }}</div>
        <div class="item uppercase">{{ t('预测类型') }}</div>
        <div class="item uppercase">{{ t('客户经理') }}</div>
        <div class="item uppercase">{{ t('实时预报') }}</div>
        <div class="item uppercase">{{ t('日期') }}</div>
        <div class="item uppercase">{{ t('借记/贷记') }}</div>
        <div class="item uppercase">{{ t('绩效指标预测') }}</div>
        <div class="item uppercase">{{ t('说明') }}</div>
        <div class="item uppercase">{{ t('历史') }}</div>
      </div>

      <div class="col-content">
        <template v-for="(_item, key) in data?.list">
          <div v-for="(item, index) in data?.list[key]" :key="item.id" class="col-item" :class="{ passed: item.status != 0 || item.first, yellow: item.type == 4 && item.first, red: item.is_hide }" @click="showLog(item)">
            <div class="item flex items-center"><span class="circle" :style="{ background: item.status != 0 || item.first ? '#181818' : '#b4d8d8' }"></span></div>
            <div class="item">
              <template v-if="!index"> {{ tool.monthYear(item.ym) }}</template>
            </div>
            <div class="item">{{ item.name }}</div>
            <div class="item flex items-center"><vco-avatar :size="30"></vco-avatar></div>
            <div class="item">
              <div class="flex items-center justify-between" v-if="item.forecast_log.length && item.status != 0">
                <span class="mr-3 color_grey fs_xs">{{ tool.showDate(item.forecast_log[item.forecast_log.length - 1].create_time, 'DD/MM') }}</span>
                <vco-number :value="item.forecast_log[item.forecast_log.length - 1].amount" :precision="2" size="fs_md" prefix="" suffix=""></vco-number>
              </div>

              <div class="flex items-center justify-between" v-else>
                <span class="mr-3 color_grey fs_xs">{{ tool.showDate(item.date, 'DD/MM') }}</span>
                <template v-if="item.status != 0 || item.first">
                  <vco-number :value="item.amount" color="#181818" :bold="false" :precision="2" size="fs_md" prefix="" suffix=""></vco-number>
                </template>
                <template v-else-if="item.type == 2">
                  <vco-number :value="item.amount" color="#569695" :bold="true" :precision="2" size="fs_md" prefix="" suffix=""></vco-number>
                </template>
                <template v-else>
                  <vco-number :value="item.amount" color="#d6a91f" :bold="true" :precision="2" size="fs_md" prefix="" suffix=""></vco-number>
                </template>
                <!-- <vco-number :value="item.amount" :color="item.status != 0 || item.first ? '#181818' : '#569695'" :bold="item.status != 0 || item.first ? false : true" :precision="2" size="fs_md" prefix="" suffix=""></vco-number> -->
              </div>
            </div>
            <div class="item">
              <div v-if="item.status != 0 || item.first" style="color: #181818">
                {{ tool.showDate(item.date) }}
              </div>
              <div v-else-if="item.type == 2" style="color: #569695">
                {{ tool.showDate(item.date) }}
              </div>
              <div v-else style="color: #d6a91f">
                {{ tool.showDate(item.date) }}
              </div>
            </div>
            <div class="item">
              <vco-number v-if="item.status != 0 || item.first" :value="item.amount" :bold="true" :precision="2" size="fs_md" prefix="" suffix=""></vco-number>
            </div>
            <div class="item">
              <div class="flex items-center">
                <!-- <span class="mr-3 color_grey fs_xs">12/12</span>
                <vco-number :value="76923076.92" :precision="2" size="fs_xs" prefix="" suffix=""></vco-number> -->
              </div>
            </div>
            <div class="item">
              <p class="bold black text-ellipsis overflow-hidden text-nowrap" :title="item.note" style="width: 130px">{{ item.note }}</p>
            </div>
            <div class="item"><i class="iconfont nav-icon" v-if="!item.first">&#xe794;</i></div>
          </div>
        </template>
      </div>
    </div>

    <a-empty v-if="!data?.list" />
    <div class="flex justify-center pb-8" v-if="!projectDetail?.base?.is_close">
      <Add :uuid="uuid" :projectDetail="projectDetail" @update="update"> <a-button type="brown" shape="round" size="small">add forecast</a-button></Add>
    </div>
    <div class="static-block">
      <div class="item">
        <p>period</p>
        <h3>{{ data?.period1 }} months</h3>
        <div class="info">{{ data?.period2 }} months</div>
      </div>
      <div class="item sec-item ml-10">
        <p class="item-title">drawdowns</p>
        <h3>{{ data?.drawdowns1 }} drawdowns</h3>
        <div class="info">{{ data?.drawdowns2 }} drawdowns</div>
      </div>
      <div class="item sec-item mr-5">
        <p class="item-title">estimated drawdowns</p>
        <div class="flex justify-end items-center gap-1">
          <!-- <i class="iconfont" style="color: #7dc1c1">&#xe78b;</i> -->
          <vco-number :value="data?.estimated1 || 0" color="#7dc1c1" size="fs_xl" :precision="2"></vco-number>
        </div>
        <div class="info flex items-center justify-end"><vco-number :value="data?.estimated2 || 0" color="#fff" size="fs_xs" :precision="2" class="mr-3"></vco-number> available</div>
      </div>
      <div class="item sec-item mr-5">
        <p class="item-title">estimated repayments</p>
        <div class="flex justify-end items-center gap-1">
          <!-- <i class="iconfont" style="color: #7dc1c1">&#xe78b;</i> -->
          <vco-number :value="Math.abs(data?.payment) || 0" color="#d6a91f" size="fs_xl" :precision="2"></vco-number>
        </div>
        <!-- <div class="info flex items-center justify-end"><vco-number :value="data?.estimated2 || 0" color="#fff" size="fs_xs" :precision="2" class="mr-3"></vco-number> available</div> -->
      </div>
      <div class="item sec-item">
        <p class="item-title">actual loan withdrawn</p>
        <vco-number :value="data?.withdrawn1 || 0" color="#ffffff" size="fs_xl" :precision="2"></vco-number>
        <div class="info">{{ data?.withdrawn2 || 0 }}% from loan</div>
      </div>
      <!-- <div class="item sec-item">
        <p class="item-title">forecasted withdrawn</p>
        <vco-number :value="data?.withdrawn1 || 0" color="#ffffff" size="fs_xl" :precision="2"></vco-number>
        <div class="info">forecasted {{ data?.withdrawn2 || 0 }}% loan</div>
      </div> -->

      <div class="item">
        <p>variance</p>
        <!-- <div class="fs_xl" style="color: hsla(0, 0%, 100%, 0.5)">{{ data?.period1 || 0 }}%</div> -->
      </div>

      <div class="item">
        <p>points</p>
        <!-- <div class="fs_xl">{{ data?.period2 || 0 }}%</div> -->
      </div>
    </div>
  </div>

  <Log :uuid="uuid" :projectDetail="projectDetail" :logList="logList" :itemDate="itemDate" ref="logRef" @update="update"></Log>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { DownOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import tool from '@/utils/tool';
import { projectDetailForecastList, projectForecastExportExcel, projectForecastStatistics } from '@/api/process';
import Add from './add.vue';
import Log from './log.vue';

const props = defineProps({
  uuid: {
    type: [String, Number],
    default: ''
  },
  data: {
    type: Object
  },
  projectDetail: {
    type: Object
  }
});

const emits = defineEmits(['update']);
const { t } = useI18n();

const statisticsData = ref(null);

const downloading = ref(false);
const downLoadExcel = (type) => {
  const params = {
    type,
    uuid: props.uuid
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

const logRef = ref();
const logList = ref([]);
const itemDate = ref();
const showLog = (val) => {
  if (val.first) return;
  logList.value = val.forecast_log;
  itemDate.value = val;
  logRef.value.init();
};

const update = () => {
  emits('update');
};
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
    margin: 5px 0;
    &.th {
      font-weight: bold;
      color: @color_grey;
      font-size: 10px;
    }
    > .item {
      padding: 0 15px;
      flex: 1;
      &:nth-child(1) {
        flex: 0 0 60px;
      }
      &:nth-child(2) {
        flex: 0 0 100px;
      }
      &:nth-child(4) {
        flex: 0 0 100px;
        text-align: center;
      }
      &:nth-child(6) {
        flex: 0 0 110px;
        text-align: center;
      }
      &:nth-child(5),
      &:nth-child(7),
      &:nth-child(8) {
        text-align: center;
      }
      &:nth-child(9) {
        flex: 0 0 150px;
      }
      &:nth-child(10) {
        flex: 0 0 100px;
        text-align: right;
      }
      &:nth-child(2) {
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
    .col-item {
      padding: 6px 0;
      border-bottom: 1px solid #e2e5e2;
      cursor: pointer;
      .item {
        &:nth-child(6) {
          color: #569695;
          position: relative;
          &::after {
            display: inline-block;
            content: '';
            position: absolute;
            left: 0;
            top: 8px;
            height: 15px;
            border-left: 1px solid #888;
          }
        }
      }
      &.passed {
        background-color: #f0f0f0 !important;
        border-radius: 10px;
        border-bottom: none;
        cursor: auto;
        .item {
          &:nth-child(6) {
            color: #181818;
          }
        }
      }
      &.yellow {
        background-color: #f19915 !important;
      }
      
      &.red {
        background-color: #f3e8ea !important;
      }

      > .item {
        display: flex;
        flex-direction: column;
        justify-content: center;
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
    text-align: right;

    &:nth-child(1),
    &:nth-child(2) {
      text-align: left;
    }
    &:nth-child(3) {
      flex: 1;
    }
    &:nth-child(4),
    &:nth-child(5) {
      width: 300px;
    }
    &:nth-child(6),
    &:nth-child(7) {
      width: 100px;
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
  }
  .sec-item {
    text-align: right;
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
  top: 20px;
  position: relative;
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
