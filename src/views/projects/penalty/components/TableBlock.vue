<template>
  <div class="table-block">
    <ul class="table-col header">
      <li></li>
      <li class="date">{{ t('开始时间') }}</li>
      <li>{{ t('开始状态') }}</li>
      <li class="date">{{ t('结束时间') }}</li>
      <li>{{ t('结束状态') }}</li>
      <li class="rate">{{ t('利率') }}</li>
      <li class="date">{{ t('创建时间') }}</li>
    </ul>
    <div v-if="tableData.length" class="table-body">
      <template v-for="item in tableData" :key="item.id">
        <ul class="table-col tr" :class="{ active: active_id == item.id, declined: item.state2 === 1000 }" @click="viewDetail(item)">
          <li><div class="circle" :class="{ done: item.status === 1 }"></div></li>
          <li class="date">
            <span class="fs_xs color_grey" v-if="item.start_date">{{ tool.showDate(item.start_date) }}</span>
          </li>
          <li :style="{ color: colors[item.start_status_name] }">
            {{ item.start_status_name }}
          </li>
          <li class="date">
            <span class="fs_xs color_grey" v-if="item.end_date">{{ tool.showDate(item.end_date) }}</span>
          </li>
          <li :style="{ color: colors[item.end_status_name] }">
            {{ item.end_status_name }}
          </li>
          <li class="rate">{{ item.rate }}%</li>
          <li class="date">
            <span class="fs_xs color_grey">{{ tool.showDate(item.create_time) }}</span>
          </li>
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
  }
});

const { t } = useI18n();
const colors = ref({
  'FC REVIEW': '#d3a631',
  'FC PENDING REVIEW': '#d3a631',
  'PENDING APPLY': '#d3a631',
  'DIRECTOR PENDING REVIEW': '#d3a631'
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
  justify-content: space-between;

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
  }
  > li {
    flex: 1;
    line-height: 21px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 43px;
    text-align: center;

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
    &:first-child {
      flex: 0 0 30px;
    }
    &.date {
      flex: 0 0 100px;
      text-align: center;
    }

    &.rate {
      flex: 0 0 100px;
      text-align: center;
    }
  }
}
</style>
