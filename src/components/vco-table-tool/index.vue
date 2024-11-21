<template>
  <div class="table-tool">
    <div class="left">
      <slot name="left"></slot>
    </div>
    <div class="right">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<style lang="less" scoped>
  .table-tool {
    display: flex;
    align-items: center;
    justify-content: space-between;
    > div {
      display: flex;
      align-items: center;
      gap: 30px;
      &.left {
        gap: 20px;
      }
    }
  }
</style>