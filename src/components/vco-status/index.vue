<template>
  <div
    class="vco-status"
    :class="type"
    :style="{'fontSize': size + 'px'}"
  >{{ title }}</div>
</template>

<script setup>
  const props = defineProps({
    title: {
      type: String,
      default: 'Title'
    },
    // primary | success | error | grey | blue | cyan | green
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

  .vco-status {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #282828;
    &::before {
      content: '';
      display: block;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: #282828;
    }
    &.primary {
      color: @colorPrimary;
      &::before {
        background-color: @colorPrimary;
      }
    }
    &.success {
      color: #3fdea4;
      &::before {
        background-color: #3fdea4;
      }
    }
    &.error {
      color: #ff4d4f;
      &::before {
        background-color: #ff4d4f;
      }
    }
    &.grey {
      color: grey;
      &::before {
        background-color: grey;
      }
    }
    &.blue {
      color: #1890ff;
      &::before {
        background-color: #1890ff;
      }
    }
    &.cyan {
      color: #13c2c2;
      &::before {
        background-color: #13c2c2;
      }
    }
    &.green {
      color: #52c41a;
      &::before {
        background-color: #52c41a;
      }
    }
  }
</style>