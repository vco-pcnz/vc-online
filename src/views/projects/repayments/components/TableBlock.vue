<template>
  <div class="table-block text-center">
    <ul class="table-col header" :class="{ isVsl: isVSL }">
      <li></li>
      <li class="text-left" ref="title">{{ t('还款') }}</li>
      <li v-if="isVSL">{{ t('贷款方') }}</li>
      <li>{{ t('请求数据1') }}</li>
      <li class="status">{{ t('状态t') }}</li>
      <li>{{ t('已批准') }}</li>
      <li>{{ t('创建日期') }}</li>
      <li>{{ isExternalUser ? t('已支付') : t('对账') }}</li>
    </ul>
    <div v-if="tableData.length" class="table-body">
      <template v-for="(item, index) in tableData" :key="item.id">
        <ul class="table-col tr all-repayment" :class="{ active: active_id == item.id, declined: item.status_name === 'DECLINED REPAYMENT', isVsl: isVSL }" @click="viewDetail(item)">
          <li><div class="circle" :class="{ done: item.status === 2 }"></div></li>
          <li class="text-left">
            <p class="bold black text-ellipsis overflow-hidden text-nowrap" :title="item.name" :style="{ width: isVSL ? '164px' : '210px' }">
              <span class="index-num">{{ total - (pagination.page - 1) * pagination.limit - index }}</span>
              {{ item.name }}
            </p>
          </li>
          <li v-if="isVSL">{{ item.source ? (item.source > 0 ? 'BOC' : '') : 'VS' }}</li>
          <li>
            <vco-number :value="item.apply_amount" :precision="2" size="fs_md" :end="true"></vco-number>
            <p class="fs_xs color_grey" v-if="item.apply_date">{{ tool.showDate(item.apply_date) }}</p>
          </li>
          <li class="status" :style="{ color: setStatusColor(item) }">
            {{ item.state === 1000 && item.status > 1 ? 'REPAID' : item.status_name }}
          </li>
          <li>
            <vco-number :value="item.amount" :precision="2" size="fs_xs"></vco-number>
            <p class="fs_xs color_grey" v-if="item.date">{{ tool.showDate(item.date) }}</p>
          </li>
          <li>
            <p class="fs_xs color_grey">{{ tool.showDate(item.create_time) }}</p>
          </li>
          <li>
            <vco-number :value="Math.abs(item.open_amount)" :precision="2" size="fs_xs"></vco-number>
            <p class="fs_xs color_grey" v-if="item.open_date">{{ tool.showDate(item.open_date) }}</p>
          </li>
          <div class="tipWrapper" v-if="item.all_repayment || (item.status == 2 && item.reconcile_date != null && isExternalUser)">
            <div v-if="item.all_repayment" class="tips normal-back">{{ t('全额还款') }}</div>
            <div v-if="item.status == 2 && item.reconcile_date != null" class="tips">{{ t('手动对账') }}</div>
          </div>
          <div v-if="item.all_repayment && Number(item.do_edit) === 1" class="tips edit-back">{{ t('编辑') }}</div>
          <div v-if="item.all_repayment && Number(item.do_cancel) === 1" class="tips edit-back cancel">{{ t('取消') }}</div>
        </ul>
      </template>
    </div>
    <a-empty v-else />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/store';
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
  projectDetail: {
    type: Object
  },
  total: {
    type: Number,
    default: 0
  }
});

const { t } = useI18n();
const userStore = useUserStore();
// isNormalUser 为真表示外部用户
const isExternalUser = computed(() => !!userStore.isNormalUser);

const active_id = ref('');

const viewDetail = (val) => {
  active_id.value = val.id;
  emit('change', val);
};

const setStatusColor = (val) => {
  if (val.state == 1000 && val.status > 1) {
    return '#272727';
  } else if (val.state == -900) {
    return '#ff7875';
  } else {
    return '#d3a631';
  }
};

const isVSL = computed(() => {
  return props.projectDetail?.product?.code === 'vsl';
});

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
  grid-template-columns: 0.15fr 2fr 1.2fr 2fr 1.2fr 1fr 1.2fr;
  padding: 12px 24px;
  font-size: 14px;
  color: @color_coal;
  &.isVsl {
    grid-template-columns: 0.15fr 1.6fr 0.6fr 1.2fr 2fr 1.2fr 1fr 1.2fr;
  }

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
        padding: 1px 5px;
        &.edit-back {
          padding: 0;
          position: absolute;
          top: 0;
          width: 20px;
          height: 100%;
          overflow: hidden;
          left: 0;
          border-top-left-radius: 12px;
          border-bottom-left-radius: 12px;
          writing-mode: vertical-rl;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #1b79f9;
          color: #fff;
          &.cancel {
            padding: 0;
            background-color: #f45954;
          }
        }
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

    &.status {
      font-weight: 500;
      text-transform: uppercase;
    }
  }
}

.index-num {
  margin-right: 5px;
  color: #888;
  font-size: 12px;
}

.tipWrapper {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  padding: 2px 15px;
  background-color: @colorPrimary;
  font-size: 10px;
  border-bottom-left-radius: 12px;
  border-top-right-radius: 12px;
  line-height: 1;
  .tips:not(:last-child) {
    border-right: 1px solid #f8f8f8;
  }
}
</style>
