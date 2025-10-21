<template>
  <div class="data-type">
    <template v-for="item in tabData" :key="item.value">
      <a-button :class="{ active: item.value === current }" v-if="!item.hide" @click="tabChange(item)" shape="round">
        {{ item.label }}
        <span v-if="item.num" class="num">({{ item.num }})</span>
      </a-button>
    </template>
  </div>
</template>

<script setup>
const emits = defineEmits(['update:current', 'change']);
const props = defineProps({
  tabData: {
    type: Array,
    default: () => []
  },
  current: {
    type: [String, Number],
    default: ''
  }
});

const tabChange = (data) => {
  if (data.value !== props.current) {
    emits('update:current', data.value);
    emits('change', data);
  }
};
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
.data-type {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 15px;
  :deep(.ant-btn) {
    padding: 4px 20px;
    height: auto;
    // font-weight: bold;
    color: #666;
    &:hover {
      color: #282828;
    }
    &.active {
      border-color: @colorPrimary !important;
      color: #282828;
    }
    .num {
      padding-left: 2px;
    }
  }
}
</style>
