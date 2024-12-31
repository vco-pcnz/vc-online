<template>
  <div class="flex items-end justify-between mb-10">
    <div class="flex title flex-1 mr-4">
      <span class="fs_2xl">Forecast performance</span>
    </div>
    <a-button type="cyan" size="small" shape="round">Create report</a-button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps([]);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
</style>
