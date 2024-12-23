<template>
  <div class=" color_grey fs_2xs text-center py-3 text-uppercase uppercase" style="letter-spacing: 1px;">Details</div>
  <div class="detail">
    <div>Drawdown confirm</div>
    <div class="flex items-center"><i class="iconfont mr-2">&#xe774;</i><span class="weight_demiBold">Documents & photos</span></div>
    <p class="color_grey mt-1 mb-3">1 file had been provided: drawdown notice</p>
    <a-button type="brown" shape="round" size="small">{{ t('查看文件') }}</a-button>
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
.detail {
  border: 1px solid #e2e5e2;
  box-shadow: 2px 2px 4px 0 hsla(120, 5%, 89%, 0.15), 5px 5px 7px 0 hsla(0, 0%, 53%, 0.1);
  border-radius: 12px;
  padding: 30px;
}
</style>
