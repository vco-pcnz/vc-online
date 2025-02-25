<template>
  <div class="table-block">
    <ul class="table-col header">
      <li></li>
      <li>{{ t('类型') }}</li>
      <li>{{ t('方法') }}</li>
      <li>{{ t('金额') }}</li>
      <li>{{ t('状态') }}</li>
      <li>{{ t('创建时间') }}</li>
    </ul>
    <div v-if="tableData.length" class="table-body">
      <template v-for="item in tableData" :key="item.id">
        <ul class="table-col tr" :class="{ active: active_id == item.id, declined: item.state === -900 }" @click="viewDetail(item)">
          <li><div class="circle" :class="{ done: item.status === 1 }"></div></li>
          <li>{{ item.type_name }}</li>
          <li>{{ item.addsub == 1 ? t('增加') : t('减少') }}</li>
          <!-- <li>
            <p class="bold black text-ellipsis overflow-hidden text-nowrap" :title="item.security_name" style="width: 140px">{{ item.security_name }}</p>
          </li> -->
          <!-- <li>{{ item.card_no }}</li> -->
          <li>
            <vco-number :value="item.amount" :precision="2" size="fs_md" :end="true"></vco-number>
          </li>
          <li :style="{ color: colors[item.status_name] }">{{ item.status_name }}</li>
          <li>
            <p class="fs_xs color_grey">{{ tool.showDate(item.create_time) }}</p>
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
        return item.uuid;
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
      width: 100px;
      text-align: center;
    }
    &:nth-child(4) {
      text-align: center;
      width: 90px;
    }
    &:nth-child(5) {
      width: 160px;
      text-align: center;
    }
    &:nth-child(6),
    &:nth-child(7) {
      width: 155px;
      text-align: center;
    }
  }
}
</style>
