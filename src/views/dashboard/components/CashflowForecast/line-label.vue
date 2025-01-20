<template>
  <div class="label-wrapper">
    <template v-if="preValue - value >= 0">
      <div
        style="border-color: #6d7b1f"
        class="line"
        :style="{
          top: 'calc(' + getPosition(preValue) + '% + 6px)',
          bottom: 'calc(' + (100 - getPosition(value)) + '%)'
        }"
      ></div>

      <div class="value" :style="{ top: 'calc(' + getPosition(preValue) + '% + -20px)' }">
        <vco-number
          :bold="true"
          color="#6d7b1f"
          prefix=""
          :value="Math.round(Math.round(amount / 10) / 100)"
          suffix="k"
          :precision="2"
          size="fs_xs"
        ></vco-number>
      </div>
    </template>
    <template v-else>
      <div
        class="line"
        :style="{
          top: 'calc(' + getPosition(value) + '% + 6px)',
          bottom: 'calc(' + (100 - getPosition(preValue)) + '% - 6px)'
        }"
      ></div>
      <div class="value" :style="{ top: 'calc(' + getPosition(preValue) + '%)' }">
        <vco-number :bold="true" prefix="" :value="Math.round(Math.round(amount / 10) / 100)" suffix="k" :precision="2" size="fs_xs"></vco-number>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  value: {
    type: [String, Number]
  },
  preValue: {
    type: [String, Number]
  },
  amount: {
    type: [String, Number]
  },
  zeroLine: {
    type: Number
  },
  Min: {
    type: Number
  },
  Max: {
    type: Number
  }
});

const getPosition = (val) => {
  const minMax = Math.abs(props.Max) + Math.abs(props.Min);
  if (val > 0) {
    return ((props.Max - val) / minMax) * 100;
  } else if (val < 0) {
    return ((Math.abs(props.Max) + Math.abs(val)) / minMax) * 100;
  } else {
    return zeroLine;
  }
};
</script>
<style lang="less" scoped>
.value {
  position: absolute;
  z-index: 2;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
}
.line {
  position: absolute;
  left: 50%;
  border-right: 1.5px dashed #181818;
}
.label-wrapper {
  position: absolute;
  // background: red;
  top: 5px;
  bottom: 5px;
  width: 100%;
}
</style>
