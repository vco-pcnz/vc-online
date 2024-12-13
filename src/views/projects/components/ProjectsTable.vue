<template>
  <div class="table-content">
    <div class="table-block">
      <ul class="table-col header">
        <li>{{ t('项目•类型') }}</li>
        <li>{{ t('借款人•贷款经理') }}</li>
        <li>{{ t('到期') }}</li>
        <li>{{ t('IRR预测') }}</li>
        <li>{{ t('收入') }}</li>
        <li>{{ t('待提取') }}</li>
        <li>{{ t('贷款余额') }}</li>
        <li>{{ t('FC2') }}</li>
        <li>{{ t('UPD') }}</li>
      </ul>
      <div v-if="tableData.length" class="table-body">
        <template v-for="item in tableData" :key="item.id">
          <ul class="table-col tr">
            <li>
              <a-space>
                <vco-avatar
                  :src="item.avatar"
                  :radius="true"
                  :round="true"
                  :size="32"
                />
                <div>
                  <p class="black_blod_text">{{ item.project }}</p>
                  <span class="replenish_text">Construction • Buying land</span>
                </div>
              </a-space>
            </li>
            <li>
              <a-space>
                <a-avatar-group>
                  <vco-avatar
                    :src="item.avatar"
                    :radius="true"
                    :round="true"
                    :size="22"
                  />
                </a-avatar-group>
                <div>
                  <span>
                    {{ item.borrower.name }}
                  </span>
                  <br />
                  <span class="replenish_text">
                    <i class="iconfont relevance_icon">&#xe720;</i>
                    Herry
                  </span>
                </div>
              </a-space>
            </li>
            <li>
              <p class="black_blod_text">{{ tool.showDate(item.maturity) }}</p>
              <span class="replenish_text">326 days left</span>
            </li>
            <li>
              <p class="black_blod_text">
                <i class="iconfont" style="color: #67837e">&#xe761;</i>
                {{ item.irr }}
              </p>
              <span class="replenish_text">0% · 8.98%</span>
            </li>
            <li>
              <p>{{ tool.formatMoney(item.income) }}</p>
            </li>
            <li>
              <p>{{ tool.formatMoney(item.undrawn) }}</p>
            </li>
            <li>
              <p>
                <i class="iconfont" style="color: #a9ad57">&#xe75b;</i>
                {{ tool.formatMoney(item.balance) }}
              </p>
            </li>
            <li>
              <p>{{ tool.formatMoney(item.facility2) }}</p>
            </li>
            <li>
              <p class="count" v-if="item.upd">{{ item.upd }}</p>
            </li>
          </ul>
        </template>
      </div>
      <a-empty v-else :image="simpleImage" />
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { Empty } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';

const props = defineProps({
  tableData: {
    type: Array,
    default: () => [],
  },
});

const { t } = useI18n();
const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;
const tableData = reactive([
  {
    project: '项目1',
    borrower: {
      avatar: '',
      name: '张三',
    },
    maturity: '2022-01-01',
    irr: '5.5%',
    income: '1820000',
    undrawn: '434422',
    balance: '1538764',
    facility2: '1820000',
    upd: '11',
  },
  {
    project: 'TEST 0315',
    borrower: {
      avatar: '',
      name: 'vicensh',
    },
    maturity: '2022-01-01',
    irr: '5.5%',
    income: '13600',
    undrawn: '85685',
    balance: '45822',
    facility2: '325500',
  },
]);
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.table-content {
  border-top: 1px solid #808080;
  padding-top: 5px;
}

.table-col {
  display: flex;
  font-size: 14px;
  border-radius: 8px;

  &.header {
    font-weight: bold;
    font-size: 12px;
    text-transform: uppercase;
    padding: 8px 24px;
    color: #888;
  }
  &.tr {
    background-color: #f0f0f0;
    border: 1px solid #e2e5e2;
    margin-top: 6px;
    transition: all 0.3s ease;
    padding: 12px 24px;
    color: #666;
    &:hover {
      border-color: @colorPrimary;
    }
  }
  > li {
    line-height: 21px;
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;

    :deep(.ant-statistic-content) {
      font-size: 15px;
    }
    // &:nth-child(1) {
    //   flex: 0 auto;
    // }
    &:nth-child(2) {
      flex: 0 auto;
      width: 180px;
    }
    &:nth-child(3) {
      flex: 0 auto;
      width: 160px;
    }
    &:nth-child(4) {
      flex: 0 auto;
      width: 100px;
    }
    &:nth-child(5) {
      flex: 0 auto;
      width: 120px;
    }
    &:nth-child(6) {
      flex: 0 auto;
      width: 100px;
    }
    &:nth-child(7) {
      flex: 0 auto;
      width: 220px;
    }
    &:nth-child(8) {
      flex: 0 auto;
      width: 100px;
    }
    &:nth-child(9) {
      flex: 0 auto;
      width: 60px;
    }
    > p {
      width: 100%;
      word-break: break-all;
    }

    .black_blod_text {
      font-weight: 500;
      color: @clr_charcoal;
    }

    .replenish_text {
      font-size: 12px;
    }

    .count {
      display: inline-block;
      width: 24px;
      height: 24px;
      line-height: 24px;
      background-color: @color_coal;
      color: @color_white;
      font-size: @fs_2xs;
      font-weight: bold;
      text-align: center;
      border-radius: 6px;
    }

    .relevance_icon {
      font-size: 7px;
    }
  }
}
</style>
