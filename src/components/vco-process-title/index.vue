<template>
  <div class="process-title">
    <div class="title">{{ title }}</div>
    <div>
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    title: {
      type: String,
      default: 'Title'
    },
    // primary | success | error | grey
    type: {
      type: String,
      default: ''
    },
    size: {
      type: [String, Number],
      default: 14
    }
  })
</script>

<style lang="less" scoped>
  @import "@/styles/variables.less";

  .process-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #808080;
    padding-bottom: 15px;
    min-height: 48px;
    > .title {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #666;
      font-weight: 500;
      gap: 6px;
      &::before {
        content: '';
        display: block;
        width: 3px;
        height: 18px;
        border-radius: 3px;
        background-color: @colorPrimary;
      }
    }
  }
</style>