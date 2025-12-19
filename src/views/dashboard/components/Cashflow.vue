<template>
  <div class="flex title mb-10">
    <span class="fs_2xl">Cashflow</span>
    <SearchContent v-model:value="searchForm" :searchConfig="searchConfig" :open_hidden="true" downloadUrl="project/forecast/cashFlowListExport" @change="loadData"></SearchContent>
  </div>

  <a-spin :spinning="loading" size="large">
    <div class="flex items-center gap-10" style="line-height: 1.2">
      <div class="flex items-center gap-3">
        <i class="iconfont cashflow_icon">&#xe723;</i>
        <div>
          <vco-number :value="tool.plus(data.drawdown_amount, data.repayment_amount)" :precision="2" size="fs_2xl" v-if="tool.plus(data.drawdown_amount, data.repayment_amount) <= 0" prefix="$(" suffix=")"></vco-number>
          <vco-number :value="tool.plus(data.drawdown_amount, data.repayment_amount)" :precision="2" size="fs_2xl" v-else></vco-number>
          <p class="fs_xs color_grey">{{ tool.showDate(searchForm.start_date) }} - {{ tool.showDate(searchForm.end_date) }}</p>
        </div>
      </div>
      <div class="flex items-center flex-1 gap-5">
        <div class="text-right">
          <p class="fs_2xl color_coal flex items-center gap-2">
            <i class="iconfont fs_md">&#xe757;</i>
            <vco-number :value="data.drawdown_amount" :precision="2" size="fs_2xl" v-if="data.drawdown_amount <= 0" prefix="$(" suffix=")"></vco-number>
            <vco-number :value="data.drawdown_amount" :precision="2" size="fs_2xl" v-else></vco-number>
          </p>
          <p class="fs_xs color_grey">{{ data.drawdown_num }} drawdowns</p>
        </div>
        <div class="flex flex-col justify-between flex-1">
          <vco-meter size="medium" color="blacky" :value="(data.drawdown_amount / tool.plus(data.drawdown_amount, data.repayment_amount)) * 100" class="mb-3" />
        </div>
        <div class="">
          <p class="fs_2xl color_coal flex items-center gap-2">
            <i class="iconfont fs_md">&#xe755;</i>
            <vco-number :value="data.repayment_amount" :precision="2" size="fs_2xl" v-if="data.repayment_amount <= 0" prefix="$(" suffix=")"></vco-number>
            <vco-number :value="data.repayment_amount" :precision="2" size="fs_2xl" v-else></vco-number>
          </p>
          <p class="fs_xs color_grey">{{ data.repayment_num }} repayments</p>
        </div>
      </div>
    </div>
    <ForecastList :data="data" :total="total" @change="setPage"></ForecastList>
  </a-spin>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import dayjs from 'dayjs';
import ForecastList from './CashflowForecast/ForecastList.vue';
import SearchContent from './SearchContent/index.vue';
import { cashFlowList } from '@/api/project/forecast';
import useProductStore from '@/store/modules/product';

const { t } = useI18n();
const productStore = useProductStore();

const searchConfig = ref(['Time', 'Project', 'State']);
const searchForm = ref({
  start_date: dayjs().add(-7, 'd').format('YYYY-MM-DD'),
  end_date: dayjs().format('YYYY-MM-DD'),
  product_uuid: ''
});

const loading = ref(false);
const total = ref(0);

const pagination = ref({
  page: 1,
  limit: 10
});

const data = ref({});
const loadData = (val) => {
  if (!productStore.currentProduct) return;
  loading.value = true;
  if (val) searchForm.value = { ...searchForm.value, ...val };
  const params = { ...searchForm.value, ...pagination.value, product_uuid: productStore.currentProduct };
  cashFlowList(params)
    .then((res) => {
      total.value = res.count;
      data.value = res.data;
    })
    .finally(() => {
      loading.value = false;
    });
};

const setPage = (val) => {
  pagination.value = val;
  loadData();
};
onMounted(() => {
  loadData();
});

watch(
  () => productStore.currentProduct,
  (val) => {
    if (val) {
      searchForm.value.product_uuid = val;
      pagination.value.page = 1;
      loadData();
    }
  },
  { immediate: true }
);
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
