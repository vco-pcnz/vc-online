<template>
  <template v-if="type == 1">
    <vco-number :value="value" :precision="precision" :size="size" :bold="true" v-if="value > 0"></vco-number>
    <vco-number :value="value" :precision="precision" :size="size" :bold="true" prefix="$(" suffix=")" v-else></vco-number>
  </template>
  <template v-if="type == 2">
    <vco-number v-if="value < 0" :bold="true" :value="value" color=" #6d7b1f" prefix="$(" suffix=")" :precision="precision" :size="size"></vco-number>
    <vco-number v-else :bold="true" :value="value" :precision="precision" :size="size"></vco-number>
  </template>
  <template v-if="type == 3">
    <vco-number v-if="value < 0" :bold="true" :value="value" color=" #6d7b1f" prefix="(" suffix=")" :precision="precision" :size="size"></vco-number>
    <vco-number v-else :bold="true" :value="value" :precision="precision" prefix="" :size="size"></vco-number>
  </template>
  <template v-if="type == 4">
    <vco-number v-if="value < 0" :bold="true" :value="value" prefix="(" suffix=")" :precision="precision" :size="size"></vco-number>
    <vco-number v-else :bold="true" :value="value" :precision="precision" prefix="" :size="size"></vco-number>
  </template>
</template>

<script setup>
import { watch, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  value: {
    type: [String, Number]
  },
  type: {
    type: [String, Number],
    default: '1'
  },
  size: {
    type: String,
    default: 'fs_3xl'
  },
  color: {
    type: String,
    default: '#181818'
  },
  prefix: {
    type: String,
    default: '$'
  },
  suffix: {
    type: String,
    default: ''
  },
  precision: {
    type: Number,
    default: 2
  }
});
</script>
<style lang="less" scoped></style>
