<template>
  <div class="flex-1">
    <div class="flex title mb-10">
      <span class="fs_2xl">Transactions</span>
      <SearchContent v-model:value="searchForm" :searchConfig="searchConfig" downloadUrl1="project/forecast/transactionsExport" @change="loadData"></SearchContent>
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
            <a-button class="iconBox ml-5" :disabled="!item.download" @click="report(item.uuid)">
              <i class="iconfont" :class="{ disabled: !item.download }">&#xe773;</i>
            </a-button>
          </div>
        </li>
      </ul>
    </a-spin>
    <div class="flex items-center justify-end gap-5 my-5">
      <i class="iconfont" style="font-size: 38px; color: #b8cdcc">&#xe78f;</i>
      <div>
        <vco-number :value="data?.total_amount" :precision="2" :bold="true"></vco-number>
        <p class="color_grey fs_xs">Total for {{ tool.showDate(searchForm.start_date) }} - {{ tool.showDate(searchForm.end_date) }}</p>
      </div>
      <a-button type="cyan" size="large" :loading="downloading" class="" @click="report">Create report</a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { transactions, transactionsExport } from '@/api/project/forecast';
import dayjs from 'dayjs';
import SearchContent from './SearchContent/index.vue';
import useProductStore from '@/store/modules/product';

const { t } = useI18n();
const productStore = useProductStore();

const data = ref();

const searchConfig = ref(['Time', 'Type']);
const searchForm = ref({
  start_date: dayjs().add(-7, 'd').format('YYYY-MM-DD'),
  end_date: dayjs().format('YYYY-MM-DD'),
  type: '2',
  product_uuid: ''
});

const downloading = ref(false);
const report = (uuid) => {
  if (!productStore.currentProduct) return;
  const params = { ...searchForm.value, lm_uuids: uuid, product_uuid: productStore.currentProduct };
  searchForm.value = { ...params };
  downloading.value = !uuid;
  transactionsExport(params)
    .then((res) => {
      window.open(res);
    })
    .finally(() => {
      downloading.value = false;
    });
};

const loading = ref(false);
const loadData = (val) => {
  if (!productStore.currentProduct) return;
  const params = { ...searchForm.value, ...(val || {}), product_uuid: productStore.currentProduct };
  searchForm.value = { ...params };
  loading.value = true;
  transactions(params)
    .then((res) => {
      data.value = res;
    })
    .finally(() => {
      loading.value = false;
    });
};

watch(
  () => productStore.currentProduct,
  (val) => {
    if (val) {
      loadData();
    }
  },
  { immediate: true }
);
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
        background-color: #181818;
        border-color: hsla(0, 0%, 9%, 0.7);
        box-shadow: 0 3px 6px -4px hsla(0, 0%, 9%, 0.24), 0 6px 16px 0 hsla(0, 0%, 9%, 0.16), 0 9px 28px 8px hsla(0, 0%, 9%, 0.1);
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
