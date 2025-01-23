<template>
  <div class="flex title mb-10">
    <span class="fs_2xl">Cashflow</span>
    <SelectDate @change="loadData"></SelectDate>
  </div>

  <a-spin :spinning="loading" size="large">
    <div class="flex items-center gap-10" style="line-height: 1.2">
      <div class="flex items-center gap-3">
        <i class="iconfont cashflow_icon">&#xe723;</i>
        <div>
          <vco-number
            :value="tool.plus(data.drawdown_amount, data.repayment_amount)"
            :precision="2"
            size="fs_2xl"
            v-if="tool.plus(data.drawdown_amount, data.repayment_amount) <= 0"
            prefix="$("
            suffix=")"
          ></vco-number>
          <vco-number :value="tool.plus(data.drawdown_amount, data.repayment_amount)" :precision="2" size="fs_2xl" v-else></vco-number>
          <p class="fs_xs color_grey">{{ tool.showDate(data.period.start_date) }} - {{ tool.showDate(data.period.end_date) }}</p>
        </div>
      </div>
      <div class="flex items-center flex-1 gap-5">
        <div class="text-right">
          <p class="fs_2xl color_coal flex items-center gap-2">
            <i class="iconfont fs_md">&#xe757;</i>
            <vco-number
              :value="data.drawdown_amount"
              :precision="2"
              size="fs_2xl"
              v-if="data.drawdown_amount <= 0"
              prefix="$("
              suffix=")"
            ></vco-number>
            <vco-number :value="data.drawdown_amount" :precision="2" size="fs_2xl" v-else></vco-number>
          </p>
          <p class="fs_xs color_grey">{{ data.drawdown_num }} drawdowns</p>
        </div>
        <div class="flex flex-col justify-between flex-1">
          <vco-meter
            size="medium"
            color="blacky"
            :value="(data.drawdown_amount / tool.plus(data.drawdown_amount, data.repayment_amount)) * 100"
            class="mb-3"
          />
          <!-- <vco-meter size="medium" color="greeny" :value="51.5" /> -->
        </div>
        <div class="">
          <p class="fs_2xl color_coal flex items-center gap-2">
            <i class="iconfont fs_md">&#xe755;</i>
            <vco-number
              :value="data.repayment_amount"
              :precision="2"
              size="fs_2xl"
              v-if="data.repayment_amount <= 0"
              prefix="$("
              suffix=")"
            ></vco-number>
            <vco-number :value="data.repayment_amount" :precision="2" size="fs_2xl" v-else></vco-number>
          </p>
          <p class="fs_xs color_grey">{{ data.repayment_num }} repayments</p>
        </div>
      </div>
      <a-button type="cyan" size="small" shape="round" @click="report" :loading="downloading">Document</a-button>
    </div>
    <ForecastList :data="data" :total="total" @change="setPage" v-if="show"></ForecastList>
  </a-spin>
  <div class="more" @click="show = true" :class="{ moreShow: show }">
    <a-button type="brown" shape="round" size="small" v-if="show" @click.stop="show = false">Hide</a-button>
    <i v-if="!show" class="iconfont">&#xe77f;</i>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import SelectDate from './SelectDate.vue';
import { cashFlowList, cashFlowListExport } from '@/api/project/forecast';
import ForecastList from './CashflowForecast/ForecastList.vue';
const { t } = useI18n();

const props = defineProps([]);

const show = ref(false);
const loading = ref(false);
const total = ref(0);

const data = ref({
  period: {
    start_date: '',
    end_date: ''
  }
});
const downloading = ref(false);
const report = () => {
  downloading.value = true;
  cashFlowListExport(search_key.value)
    .then((res) => {
      window.open(res);
    })
    .finally(() => {
      downloading.value = false;
    });
};

const search_key = ref();
const loadData = (val, pagination) => {
  loading.value = false;
  pagination = pagination ? pagination : { page: 1, limit: 10 };
  search_key.value = val || '';
  cashFlowList({ search_key: search_key.value, ...pagination })
    .then((res) => {
      total.value = res.count;
      data.value = res.data;
    })
    .finally(() => {
      loading.value = false;
    });
};

const setPage = (pagination) => {
  loadData(search_key.value, pagination);
};
onMounted(() => {});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.more {
  background-color: #f7f9f8;
  height: 36px;
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  color: #bf9425;
  position: relative;
  left: -30px;
  width: calc(100% + 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-top: 40px;
  &:hover {
    background-color: hsla(35, 53%, 67%, 0.2);
  }
  .iconfont {
    display: inline-block;
    transform: rotate(90deg);
  }
  &.moreShow {
    background-color: #fff;
  }
}

.cashflow_icon {
  font-size: 34px;
  color: #b8cdcc;
}
</style>
