<template>
  <DrawdownAmount ref="DrawdownAmountRef" :uuid="currentId" :projectDetail="projectDetail" @change="update"></DrawdownAmount>
  <div class="table-content">
    <div class="col-item th">
      <div class="item uppercase"></div>
      <div class="item uppercase">{{ t('月份') }}</div>
      <div class="item uppercase">{{ t('预测类型') }}</div>
      <div class="item uppercase" v-show="false">{{ t('客户经理') }}</div>
      <div class="item uppercase">{{ t('实时预报') }}</div>
      <div class="item uppercase">{{ t('日期') }}</div>
      <div class="item uppercase">{{ t('借记/贷记') }}</div>
      <div class="item uppercase">{{ t('说明') }}</div>
      <div class="item uppercase history">{{ t('编辑') }}</div>
    </div>

    <div class="col-content">
      <div v-for="item in data" :key="item.id" class="col-item" :class="{ passed: item.status != 0 || item.first, yellow: item.type == 4 && item.first, red: item.is_hide }" @click="showEdit(item)">
        <div class="item flex items-center"><span class="circle" :style="{ background: item.status != 0 || item.first ? '#181818' : '#b4d8d8' }"></span></div>
        <div class="item">
          {{ tool.monthYear(item.ym) }}
        </div>
        <div class="item">{{ item.name }}</div>
        <div class="item flex items-center" v-show="false"><vco-avatar :size="30"></vco-avatar></div>
        <div class="item">
          <div class="flex items-center justify-between" v-if="item?.forecast_log?.length && item.status != 0">
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
          <p class="bold black text-ellipsis overflow-hidden text-nowrap" :title="item.note" style="width: 250px">{{ item.note }}</p>
        </div>
        <div class="item history cursor-pointer">
          <i class="iconfont color_coal" v-if="item.status != 0 || item.first">&#xe8cf;</i>
        </div>
      </div>
    </div>
  </div>
  <a-empty v-if="data === Array && !data.length" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { darwdownLog } from '@/api/project/tools';
import DrawdownAmount from '../drawdownAmount/index.vue';
const emits = defineEmits(['reload']);
const { t } = useI18n();
const props = defineProps({
  currentId: {
    type: [String, Number]
  },
  projectDetail: {
    type: Object
  }
});

const data = ref();
const loading = ref(false);

const loadData = () => {
  loading.value = true;
  darwdownLog({ uuid: props.currentId })
    .then((res) => {
      data.value = res;
    })
    .finally(() => {
      loading.value = false;
    });
};

const update = () => {
  emits('reload');
  loadData();
};

onMounted(() => {
  loadData();
});

const DrawdownAmountRef = ref();
const showEdit = (val) => {
  if (val.status != 0 || val.first) {
    DrawdownAmountRef.value.init(val);
  }
};
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.color_coal {
  color: @colorPrimary;
  font-size: 14px;
}
.table-content {
  min-height: 150px;
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
      &:nth-child(7) {
        text-align: center;
      }
      &:nth-child(8) {
        flex: 0 0 250px;
        text-align: center;
      }
      &:nth-child(9) {
        flex: 0 0 150px;
      }
      &:nth-child(10),
      &.history {
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
      &.opt {
        flex: 0 0 100px;
        align-items: center;
        flex-direction: row !important;
        justify-content: flex-end !important;
        i {
          cursor: pointer;
          color: @colorPrimary;
          display: inline-block;
          &.disabled {
            pointer-events: none;
            color: #999 !important;
          }
          &:hover {
            opacity: 0.8;
          }
          &:last-child {
            margin-left: 5px;
          }
        }
      }
    }
  }
  .col-content {
    margin-top: 10px;
    .col-item {
      padding: 6px 0;
      border-bottom: 1px solid #e2e5e2;
      cursor: pointer;
      &.item {
        cursor: default;
      }
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
        background-color: #ffa7a7 !important;
      }

      > .item {
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
    }
  }
}
</style>
