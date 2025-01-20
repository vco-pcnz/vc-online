<template>
  <div class="label-wrapper">
    <template v-if="isAdd">
      <template v-if="value > 0">
        <div
          class="line"
          :style="{
            top: 'calc(' + (zeroLine - (zeroLine * value) / Max) + '% + 20px)',
            bottom: 'calc( 100% - ' + (zeroLine - (zeroLine * value) / Max) + '% - 35px)'
          }"
        ></div>
        <div class="value" :style="{ top: 'calc(' + (zeroLine - (zeroLine * value) / Max) + '% + 30px)' }">
          <vco-number :bold="true" prefix="" :value="Math.round(Math.round(amount / 10) / 100)" suffix="k" :precision="2" size="fs_xs"></vco-number>
        </div>
      </template>
      <template v-else>
        <template v-if="zeroLine !== 0">
          <div
            class="line"
            :style="{
              top: 'calc(' + (zeroLine - (zeroLine * value) / Max) + '% + 5px)',
              bottom: 'calc( 100% - ' + (zeroLine - (zeroLine * value) / Max) + '% - 20px)'
            }"
          ></div>

          <div class="value" :style="{ top: 'calc(' + (zeroLine - (zeroLine * value) / Max) + '% + 20px)' }">
            <vco-number :bold="true" prefix="" :value="Math.round(amount / 10) / 100" suffix="k" :precision="2" size="fs_xs"></vco-number>
          </div>
        </template>
      </template>
    </template>
    <template v-else>
      <div
        class="line"
        style="border-color: #6d7b1f"
        :style="{
          top: 'calc(' + (zeroLine - (zeroLine * value) / Min) + '%)',
          bottom: 'calc(' + (100 - (zeroLine + ((100 - zeroLine) * value) / Min)) + '% + 10px)'
        }"
      ></div>
      <div class="value" :style="{ top: 'calc(' + (zeroLine - (zeroLine * value) / Min) + '% - 20px)' }">
        <vco-number :bold="true" color="#6d7b1f" prefix="" suffix="k" :value="Math.round(amount / 10) / 100" :precision="2" size="fs_xs"></vco-number>
      </div>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  value: {
    type: [String, Number]
  },
  amount: {
    type: [String, Number]
  },
  isAdd: {
    type: Boolean
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
  left: calc(50% + 2px);
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
