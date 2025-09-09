<template>
  <div class="vco-excess-process">
    <div v-if="showPercent > 100" class="flex items-center w-full">
      <a-progress
        :stroke-color="getPrecentColor"
        :size="6"
        :showInfo="false"
        :percent="showPercent"
      />
      <span class="excess-number exceed">{{ showPercent }}%</span>
    </div>

    <a-progress
      v-else
      :stroke-color="{
        '0%': '#64ec22',
        '100%': '#31bd65'
      }"
      :size="size"
      :percent="showPercent"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  percent: {
    type: [Number, String],
    default: 0
  },
  size: {
    type: [Number, String],
    default: 6
  }
})

const showPercent = computed(() => {
  return Number(props.percent || 0)
})

const getPrecentColor = computed(() => {
  const percent = showPercent.value
  if (percent > 100) {
    return {
      '0%': '#ff7190',
      '100%': '#eb4b6d'
    }
  } else {
    return {
      '0%': '#64ec22',
      '100%': '#31bd65'
    }
  }
})
</script>

<style lang="less" scoped>
.vco-excess-process {
  width: 100%;
  :deep(.ant-progress-line) {
    margin: 0 !important;
    margin-bottom: 2px !important;
  }
  > .items-center {
    gap: 8px;
  }
  .excess-number {
    font-size: 12px;
    &.exceed {
      color: #eb4b6d;
    }
  }
}

</style>