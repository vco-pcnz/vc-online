<template>
  <div class="flex-1">
    <div class="flex title mb-10">
      <span class="fs_2xl">Forecast</span>
      <SelectDate :list="dates" @change="setDate"></SelectDate>
      <a-button type="brown" size="small" shape="round" @click="change">{{ type ? 'for repayments' : 'for drawdowns' }}</a-button>
    </div>

    <a-spin :spinning="loading" size="large">
      <ul class="CashflowMiniStat_list">
        <li class="item flex items-center" v-for="item in data?.list" :key="item.uuid">
          <div class="flex items-center gap-3">
            <vco-avatar :src="item.avatar" :radius="true" :size="36"></vco-avatar>
            <span class="bold">{{ item.user_name }}</span>
          </div>
          <div class="flex-1 font-bold flex items-center">
            <span class="text-right mr-2" style="width: 50px">{{ item.amount_percent }}</span>
            <div class="flex-1">
              <div class="progress">
                <div class="value" :style="{ width: item.amount_percent }"></div>
              </div>
            </div>
          </div>
          <div class="flex justify-end">
            <div class="text-right">
              <p class="color_grey fs_xs">Statements total</p>
              <vco-number :value="item.amount" :precision="2" size="fs_2xl"></vco-number>
            </div>
            <a-button class="iconBox ml-5" :disabled="item.disabled">
              <i class="iconfont" :class="{ disabled: item.disabled }">&#xe773;</i>
            </a-button>
          </div>
        </li>
      </ul>
    </a-spin>
    <div class="flex items-center justify-end gap-5 my-5">
      <i class="iconfont" style="font-size: 38px; color: #b8cdcc">&#xe721;</i>
      <div>
        <vco-number :value="data?.total_amount" :precision="2" :bold="true"></vco-number>
        <p class="color_grey fs_xs">Total for {{ tool.showDate(data?.period.start_date) }} - {{ tool.showDate(data?.period.end_date) }}</p>
      </div>
      <a-button type="dark" size="large" :loading="downloading" class="" @click="report">Create report</a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import SelectDate from './SelectDate.vue';
import tool from '@/utils/tool';
import { forecast, cashFlowListExport } from '@/api/project/forecast';

const { t } = useI18n();

const data = ref();

const dates = ref([
  { name: 'Upcoming week', code: 'upcoming_week' },
  { name: 'Upcoming month', code: 'upcoming_month' },
  { name: 'Upcoming 2 months', code: 'upcoming_two_month' }
]);

const type = ref(2);
const change = () => {
  type.value = type.value == 2 ? 4 : 2;
  loadData();
};

const downloading = ref(false);
const report = () => {
  return
  downloading.value = true;
  cashFlowListExport({ search_key: search_key.value, type: type.value })
    .then((res) => {
      window.open(res);
    })
    .finally(() => {
      downloading.value = false;
    });
};

const loading = ref(false);
const search_key = ref();
const loadData = () => {
  loading.value = true;
  forecast({ search_key: search_key.value, type: type.value })
    .then((res) => {
      data.value = res.data;
    })
    .finally(() => {
      loading.value = false;
    });
};

const setDate = (val) => {
  search_key.value = val || '';
  loadData();
};
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.CashflowMiniStat_list {
  .item {
    display: grid;
    gap: 24px;
    grid-template-columns: 1.2fr 2fr 1.78fr;
    height: 84px;
    padding-left: 24px;
    padding-right: 24px;
    border: 1px solid #e2e5e2;
    box-shadow: 2px 2px 4px 0 hsla(120, 5%, 89%, 0.15), 5px 5px 7px 0 hsla(0, 0%, 53%, 0.1);
    margin-bottom: 6px;
    border-radius: 12px;

    .iconfont {
      color: #bf9425;
      font-size: 22px;
      &.disabled {
        color: rgba(0, 0, 0, 0.25);
      }
    }
    .iconBox {
      background: transparent;
      width: auto;
      padding: 0;
      height: auto;
      border: none;
    }

    .progress {
      background-color: #f7f9f8;
      border: 1px solid #e2e5e2;
      border-radius: 4px;
      height: 24px;
      .value {
        background-color: #b4d8d8;
        border-color: #569695;
        box-shadow: 0 3px 6px -4px rgba(86, 150, 149, 0.36), 0 6px 16px 0 rgba(86, 150, 149, 0.24), 0 9px 28px 8px rgba(86, 150, 149, 0.15);
        border-radius: 4px;
        height: 24px;
      }
    }
  }
}
:deep(.ant-btn-lg) {
  font-size: 16px;
  height: 48px;
  padding: 6.428571428571429px 15px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  border-radius: 6px;

  &[disabled],
  &[disabled]:hover {
    background-color: #181818;
    color: hsla(0, 0%, 100%, 0.5);
  }
}
</style>
