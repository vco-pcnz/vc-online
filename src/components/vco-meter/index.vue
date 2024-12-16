<template>
  <div
    :class="['Meter', `Meter_color_${color}`, `Meter_size_${size}`]"
    :style="{ width: width || undefined }"
  >
    <div class="Meter-Line"></div>
    <div
      class="Meter-Line Meter-Line_fill"
      :class="{ 'Meter-Line_fill': !value }"
      :style="{ width: `${value < 100 ? value : 100}%` }"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  color: {
    type: String,
    default: 'default',
  },
  size: {
    type: String,
    default: 'medium',
  },
  width: {
    type: Number,
  },
  value: {
    type: Number,
  },
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.Meter {
  width: 100%;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}

.Meter-Line {
  border-radius: 12px;
  border: 1px solid;
  border-color: rgba(@color_grey-third, 0.7);
  background-color: rgba(@color_grey-fourth, 0.7);
  .Meter_color_greeny > & {
    border-color: @color_green-light_70;
    background-color: @color_green-light_50;
  }
  .Meter_color_blacky > & {
    border-color: rgba(@color_coal, 0.7);
    background-color: @color_grayer;
  }
  &_fill {
    position: absolute;
    left: 0;
    top: 0;
    border: 1px solid;
    transition: all @duration_slow @ease_out;
    .Meter_color_default > & {
      border-color: @color_green-light_85;
      background-color: @color_green-light_70;
    }
    .Meter_color_green > &,
    .Meter_color_greeny > & {
      border-color: @color_green-light_70;
      background-color: @color_green-light_50;
    }
    .Meter_color_black > &,
    .Meter_color_blacky > & {
      border-color: @color_coal;
      background-color: @color_coal_70;
    }
    .Meter_color_turquoize > & {
      border-color: @color_turquoize-deep;
      background-color: @color_turquoize;
    }
    .Meter_color_coal > & {
      border-color: @color_coal;
      background-color: @color_coal_70;
    }
  }
  &_fillEmpty {
    border: none;
  }
  .Meter_size_small > & {
    height: 7px;
  }
  .Meter_size_medium > & {
    height: 13px;
  }
}
</style>
