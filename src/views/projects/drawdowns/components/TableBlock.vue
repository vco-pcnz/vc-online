<template>
  <div class="table-block">
    <ul class="table-col header">
      <li></li>
      <li>{{ t('放款') }}</li>
      <li>{{ t('请求数据') }}</li>
      <li>{{ t('状态t') }}</li>
      <li>{{ t('已批准') }}</li>
      <li>{{ t('创建时间') }}</li>
      <li>{{ t('对账') }}</li>
    </ul>
    <div v-if="tableData.length" class="table-body">
      <template v-for="(item, index) in tableData" :key="item.id">
        <ul class="table-col tr" :class="{ active: active_id == item.id, declined: item.status_name === 'DECLINED DRAWDOWN', 'all-overdue': isOverdue(item) }" @click="viewDetail(item)">
          <li><div class="circle" :class="{ solid: item.status == 2 }"></div></li>
          <li>
            <p class="bold black text-ellipsis overflow-hidden text-nowrap" :title="item.name" style="width: 200px">
              <span class="index-num">{{ total - (pagination.page - 1) * pagination.limit - index }}</span
              >{{ item.name }}
            </p>
          </li>
          <li>
            <vco-number :value="item.apply_amount > 0 ? item.apply_amount : item.vip_amount" :precision="2" size="fs_xs" :end="true"></vco-number>
            <p class="fs_xs color_grey" v-if="item.apply_date">{{ tool.showDate(item.apply_date) }}</p>
          </li>
          <li :style="{ color: setStatusColor(item) }">
            <template v-if="item.state == 1000 && item.status > 1">
              <p class="fs_xs bold" style="color: #181818">PAID</p>
            </template>
            <p v-else>{{ item.status_name }}</p>
          </li>
          <li>
            <vco-number :value="item.amount" :precision="2" size="fs_xs"></vco-number>
            <p class="fs_xs color_grey" v-if="item.date">{{ tool.showDate(item.date) }}</p>
          </li>
          <li>
            <p class="fs_xs color_grey">
              {{ tool.showDate(item.create_time) }}
            </p>
          </li>
          <li>
            <vco-number :value="item.open_amount" :precision="2" size="fs_xs"></vco-number>
            <p class="fs_xs color_grey" v-if="item.open_date">{{ tool.showDate(item.open_date) }}</p>
          </li>
          <div v-if="isOverdue(item)" class="tips">{{ t('超时放款') }}</div>
        </ul>
      </template>
    </div>
    <a-empty v-else />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Empty } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import dayjs from 'dayjs';

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
  projectDetail: {
    type: Object
  },
  total: {
    type: Number,
    default: 0
  }
});

const { t } = useI18n();

const setStatusColor = (val) => {
  if (val.state == 1000 && val.status > 1) {
    return '#272727';
  } else if (val.state == -900) {
    return '#ff7875';
  } else {
    return '#d3a631';
  }
};

const active_id = ref('');

const viewDetail = (val) => {
  active_id.value = val.id;
  emit('change', val);
};

// 是不是 超时放款
const isOverdue = (val) => {
  let date = val.open_date || val.date || val.apply_date;
  if (dayjs(props.projectDetail?.loan?.end_date).isBefore(date)) {
    return true;
  }
  return false;
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
  display: grid;
  grid-template-columns: 0.15fr 1.5fr 0.6fr 2.2fr 0.6fr 0.6fr 0.15fr;
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

    &.all-overdue {
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
      }
    }
  }
  > li {
    line-height: 21px;
    display: flex;
    flex: 1;
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

      &.solid {
        background: #181818;
      }
    }

    &:nth-child(1) {
      text-align: center;
    }
    &:nth-child(2) {
      width: 200px;
    }
    &:nth-child(3) {
      width: 120px;
      text-align: center;
    }
    &:nth-child(4) {
      text-align: center;
      font-weight: 500;
      text-transform: uppercase;
      width: 200px;
    }
    &:nth-child(6) {
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
