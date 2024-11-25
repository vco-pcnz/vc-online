<template>
  <div class="search-item-content">
    <p v-if="title">{{ title }}</p>
    <div class="info-content" :style="{'width': String(width).indexOf('%') > -1 ? width : width + 'px'}">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  width: {
    type: [String, Number],
    default: 160
  }
})
</script>

<style lang="less" scoped>
  @import "@/styles/variables.less";
  .search-item-content {
    > p {
      margin-bottom: 5px;
      height: 21px;
      line-height: 21px;
      color: #888;
      font-size: 13px;
    }
    > .info-content {
      :deep(.ant-select) {
        width: 100%;
      }

      :deep(.ant-select-selector) {
        box-shadow: none !important;
      }

      :deep(.ant-input),
      :deep(.ant-picker),
      // :deep(.ant-btn),
      :deep(.ant-select-selector) {
        border-color: #000 !important;
      }
      :deep(.ant-select-arrow) {
        color: #000 !important;
      }
      :deep(.ant-input:focus),
      :deep(.ant-picker-focused),
      :deep(.ant-select-open) .ant-select-selector {
        box-shadow: 0 0 0 2px rgba(0, 0, 0, .1) !important;
      }
      :deep(.ant-picker-active-bar) {
        background-color: #000;
      }
      :deep(.ant-btn) {
        .iconfont {
          font-size: 14px;
          margin-right: 5px;
        }
      }
    }
  }
</style>