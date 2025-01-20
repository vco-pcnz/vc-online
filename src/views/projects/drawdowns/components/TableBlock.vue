<template>
  <div class="table-block">
    <ul class="table-col header">
      <li></li>
      <li>{{ t('放款') }}</li>
      <li>{{ t('请求数据') }}</li>
      <li>{{ t('状态t') }}</li>
      <li>{{ t('已批准') }}</li>
    </ul>
    <div v-if="tableData.length" class="table-body">
      <template v-for="item in tableData" :key="item.id">
        <ul class="table-col tr" :class="{ active: active_id == item.id }" @click="viewDetail(item.id)">
          <li><div class="circle"></div></li>
          <li>{{ item.name }}</li>
          <li>
            <vco-number :value="item.apply_amount" :precision="2" size="fs_xs" :end="true"></vco-number>
            <p class="fs_xs color_grey">{{ tool.showDate(item.create_time) }}</p>
          </li>
          <li>
            <!-- {{item.status}} -->
          </li>
          <li>
            <vco-number :value="item.amount" :precision="2" size="fs_xs"></vco-number>
          </li>
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

const emit = defineEmits(['change']);
const props = defineProps({
  tableData: {
    type: Array,
    default: () => []
  }
});

const { t } = useI18n();

const active_id = ref('');

const viewDetail = (id) => {
  active_id.value = id;
  emit('change', id);
};

watch(
  () => props.tableData,
  (val) => {
    if (val && val.length) {
      viewDetail(val[0].id);
    } else {
      viewDetail('');
    }
  }
);
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.table-col {
  display: grid;
  grid-template-columns: 0.15fr 1.8fr 0.6fr 2.2fr 0.6fr 0.15fr;
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
  }
  > li {
    line-height: 21px;
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;

    .circle {
      border-radius: 4px;
      display: inline-block;
      height: 8px;
      width: 8px;
      background-color: transparent;
      border: 2px solid;
      border-color: #181818;
    }
    &:nth-child(1) {
      text-align: center;
    }
    &:nth-child(3) {
      text-align: right;
    }
    &:nth-child(4) {
      text-align: center;
      color: #272727;
      font-weight: 500;
      text-transform: uppercase;
    }
    &:nth-child(5) {
      text-align: right;
    }
  }
}
</style>
