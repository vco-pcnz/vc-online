<template>
  <product-tab v-model:current="pageStore.product_uuid" @change="tabChange"></product-tab>
  <vco-page-tab class="mt-5" :tabData="tabData" v-model:current="pageStore.sta" @change="tabChange"></vco-page-tab>

  <div class="dDggoj" v-if="false">
    <ChartOne></ChartOne>
    <div class="hRgViQ number">
      <p class="title">Total IRR Forecast</p>
      <div>
        <p class="value">0%</p>
        <div class="br"></div>
        <p class="more">&nbsp;</p>
        <p class="more">&nbsp;</p>
      </div>
    </div>
    <div class="hRgViQ number">
      <p class="title">Total Balance</p>
      <div>
        <div class="value"><vco-number :value="1727622378.6" :precision="2"></vco-number></div>
        <div class="br"></div>
        <p class="more">
          <vco-number :value="4367369555.11" :precision="2" color="rgba(39, 39, 39, 0.467)" size="fs_md"></vco-number>
        </p>
        <p class="more">Total Current FC2&nbsp;</p>
      </div>
    </div>
    <ChartTwo></ChartTwo>
  </div>

  <div class="flex justify-between items-center">
    <TableSearch ref="tableSearchRef" :type="pageStore.sta == 1 ? 'open' : 'closed'"></TableSearch>
  </div>
  <a-spin :spinning="pageStore.loading" size="large">
    <div class="table-content">
      <table-block :table-data="pageStore.list" :type="pageStore.sta == 1 ? 'current' : 'closed'"></table-block>
    </div>
    <div class="mt-5" v-if="pageStore.total">
      <a-pagination
        size="small"
        :total="pageStore.total"
        :pageSize="pageStore.pagination.limit"
        :current="pageStore.pagination.page"
        show-size-changer
        show-quick-jumper
        :show-total="(total) => t('共{0}条', [total])"
        @change="pageStore.setPaginate"
      />
    </div>
  </a-spin>
</template>

<script setup name="Projects">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import TableSearch from '../components/TableSearch.vue';
import TableBlock from '../components/TableBlock.vue';
import { useProjectsStore } from '@/store';
import ChartOne from './components/ChartOne.vue';
import ChartTwo from './components/ChartTwo.vue';
import ProductTab from '../components/productTab.vue';

const { t } = useI18n();
const pageStore = useProjectsStore();

const tabData = ref([
  {
    label: t('当前项目'),
    value: 1,
    num: 0
  },
  {
    label: t('已关闭的项目'),
    value: 2,
    num: 0
  }
]);

const tableSearchRef = ref();

const tabChange = () => {
  pageStore.pagination.page = 1;
  if (tableSearchRef.value) {
    tableSearchRef.value.searchHandle(true);
  } else {
    pageStore.getList();
  }
};

onMounted(() => {});
</script>

<style lang="less" scoped>
.dDggoj {
  height: 400px;
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr 1.3fr 2fr;
  gap: 12px;
  margin-top: 32px;
  font-weight: 500;
  .hRgViQ {
    flex: 1 1 0%;
    min-width: 208px;
    padding: 32px 20px 20px;
    border-radius: 16px;
    background-color: rgb(240, 240, 240);
    color: rgb(39, 39, 39);
    font-size: 14px;
    font-weight: 500;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .select {
      height: 32px;
      width: 120px;
      border-radius: 18px;
      background-color: rgb(39, 39, 39);
      display: flex;
      justify-content: center;
      select {
        border: none;
        height: 100%;
        border-radius: 18px;
        font-size: 14px;
        font-weight: 500;
        color: rgb(251, 251, 251);
        background-color: rgb(39, 39, 39);
        &:focus-visible {
          outline: none;
        }
      }
    }
    &.chart {
      .title {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .row-bars {
        flex: 1 1 0%;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 24px;
        .ehsbrV {
          position: relative;
          height: 100%;
          width: 100%;
          background-color: transparent;
        }

        .cHGikM {
          width: 100%;
          background-color: rgb(229, 224, 215);
          position: absolute;
          bottom: 0px;
          left: 0;
          right: auto;
          label {
            position: absolute;
            top: 0px;
            left: 0;
            right: 0;
            transform: translate(0, -100%);
            text-align: center;
            &::after {
              content: '';
              display: block;
              position: absolute;
              bottom: -6px;
              width: 100%;
              height: 6px;
              background-color: rgb(39, 39, 39);
            }
          }
        }
      }
      .dDGtFy {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .jQJCwP {
          height: 1px;
          flex: 1 1 0%;
          border-bottom: 1px dotted rgb(39, 39, 39);
        }
        .value {
          padding: 0.2rem 0.4rem;
          background-color: white;
        }
      }
    }

    &.number {
      .value :deep(.ant-statistic-content),
      .value {
        font-size: 30px !important;
      }
      .more {
        color: rgba(39, 39, 39, 0.467);
      }
    }
  }
}
</style>
