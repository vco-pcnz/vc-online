<template>
  <div class="flex items-center gap-2">
    <slot></slot>
    <div class="efSGMs">
      <i class="iconfont">&#xe6b3;</i>
      <div class="tips" :style="{ width: w }">
        <p>{{ tip }} </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const props = defineProps({
  tip: {
    type: String,
    default: ''
  },
  w: {
    type: String,
    default: '250px'
  }
});
</script>

<style scoped lang="less">
.efSGMs {
  position: relative;
  cursor: pointer;
  color: rgba(24, 24, 24, 0.5);
  .tips {
    position: absolute;
    top: 0px;
    left: 50%;
    right: auto;
    transform: translateY(calc(-100% - 4px));
    width: 280px;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid rgba(24, 24, 24, 0.2);
    background: rgb(255, 255, 255);
    box-shadow: rgba(0, 0, 0, 0.25) 0px 4px 4px 0px;
    color: rgba(24, 24, 24, 0.5);
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: 1.5;
    display: none;
  }
  .iconfont {
    
    color: #F19915;
    font-size: 14px;
  }
  &:hover {
    .tips {
      display: block;
    }
  }
}
</style>
