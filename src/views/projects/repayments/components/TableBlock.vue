<template>
  <div class="table-block">
    <ul class="table-col header">
      <li></li>
      <li>{{ t('还款') }}</li>
      <li>{{ t('请求数据') }}</li>
      <li>{{ t('状态t') }}</li>
      <li>{{ t('已批准') }}</li>
      <li>{{ t('创建日期') }}</li>
      <li>{{ t('对账') }}</li>
    </ul>
    <div v-if="tableData.length" class="table-body">
      <template v-for="(item, index) in tableData" :key="item.id">
        <ul class="table-col tr" :class="{ active: active_id == item.id, declined: item.status_name === 'DECLINED REPAYMENT', 'all-repayment': item.all_repayment }" @click="viewDetail(item)">
          <li><div class="circle" :class="{ done: item.status === 2 }"></div></li>
          <li>
            <p class="bold black text-ellipsis overflow-hidden text-nowrap" :title="item.name" style="width: 200px">
              <span class="index-num">{{ total - (pagination.page - 1) * pagination.limit - index }}</span>
              {{ item.name }}
            </p>
          </li>
          <li>
            <vco-number :value="item.apply_amount" :precision="2" size="fs_md" :end="true"></vco-number>
            <p class="fs_xs color_grey" v-if="item.apply_date">{{ tool.showDate(item.apply_date) }}</p>
          </li>
          <li :style="{ color: colors[item.status_name] }">
            {{ item.state === 1000 ? 'REPAID' : item.status_name }}
          </li>
          <li>
            <vco-number :value="item.amount" :precision="2" size="fs_xs"></vco-number>
            <p class="fs_xs color_grey" v-if="item.date">{{ tool.showDate(item.date) }}</p>
          </li>
          <li>
            <p class="fs_xs color_grey">{{ tool.showDate(item.create_time) }}</p>
          </li>
          <li>
            <vco-number :value="item.open_amount" :precision="2" size="fs_xs"></vco-number>
            <p class="fs_xs color_grey" v-if="item.open_date">{{ tool.showDate(item.open_date) }}</p>
          </li>
          <div v-if="item.all_repayment" class="tips">{{ t('全额还款') }}</div>
        </ul>
      </template>
    </div>
    <a-empty v-else />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';

const emit = defineEmits(['change']);
const props = defineProps({
  tableData: {
    type: Array,
    default: () => []
  },
  pagination: {
    type: Object,
    default: () => {
      return {
        page: 1,
        limit: 5
      };
    }
  },
  total: {
    type: Number,
    default: 0
  }
});

const { t } = useI18n();
const colors = ref({
  'REPAYMENT CONFIRM': '#a9ad57',
  'LM REVIEW': '#d3a631',
  'LM PENDING REVIEW': '#d3a631',
  'FC REVIEW': '#d3a631',
  'PENDING APPROVAL…': '#d3a631',
  'FC PENDING REVIEW': '#d3a631'
});

const active_id = ref('');

const viewDetail = (val) => {
  active_id.value = val.id;
  emit('change', val);
};

watch(
  () => props.tableData,
  (val) => {
    if (val && val.length) {
      let ids = val.map((item) => {
        return item.id;
      });
      if (!ids.includes(active_id.value)) {
        viewDetail(val[0]);
      } else {
        viewDetail(val[ids.indexOf(active_id.value)]);
      }
    } else {
      viewDetail({ id: '' });
    }
  }
);
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.table-col {
  display: flex;
  padding: 12px 24px;
  font-size: 14px;
  color: @color_coal;

  &.header {
    font-weight: bold;
    font-size: 10px;
    text-transform: uppercase;
    padding: 8px 24px;
    color: #888;
  }
  &.tr {
    border: 1px solid #e2e5e2;
    margin-top: 6px;
    transition: all 0.3s ease;
    padding: 12px 24px;
    background-color: #f0f0f0;
    border-radius: 12px;
    cursor: pointer;
    &:hover {
      border-color: @colorPrimary;
    }
    &.active {
      background-color: transparent;
      position: relative;
      &::after {
        display: inline-block;
        content: ' ';
        width: 38px;
        position: absolute;
        right: -38px;
        top: 50%;
        border-bottom: 1px solid #e2e5e2;
      }
    }

    &.declined {
      opacity: 0.5;
    }

    &.all-repayment {
      position: relative;
      .tips {
        position: absolute;
        background-color: @colorPrimary;
        font-size: 11px;
        padding: 2px 20px;
        top: 0;
        right: 0;
        border-bottom-left-radius: 12px;
        border-top-right-radius: 12px;
      }
    }

    > li {
      &:nth-child(4) {
        color: #272727;
        font-weight: 500;
        text-transform: uppercase;
      }
    }
  }
  > li {
    line-height: 21px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 43px;

    .circle {
      border-radius: 4px;
      display: inline-block;
      height: 8px;
      width: 8px;
      background-color: transparent;
      border: 2px solid;
      border-color: #181818;
      &.done {
        background-color: #181818;
      }
    }
    &:nth-child(1) {
      text-align: center;
      width: 40px;
    }
    &:nth-child(2) {
      flex: 1;
    }
    &:nth-child(3) {
      width: 120px;
      text-align: center;
    }
    &:nth-child(4) {
      text-align: center;
      width: 210px;
    }
    &:nth-child(6){
      text-align: center;
      width: 100px;
    }
    &:nth-child(5),
    &:nth-child(7) {
      text-align: center;
      width: 120px;
    }
  }
}

.index-num {
  margin-right: 5px;
  color: #888;
  font-size: 12px;
}
</style>
