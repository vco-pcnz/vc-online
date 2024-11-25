<template>
  <div class="block-container">
    <div class="left-content">
      <div class="block-item">
        <div class="flex justify-end gap-5">
          <a-button type="primary-line" shape="round" size="small">{{ t('从利益相关者导入') }}</a-button>
          <a-button type="primary-line" shape="round" size="small">{{ t('添加临时数据') }}</a-button>
        </div>
      </div>
    </div>
    <div class="right-content">
      2
    </div>
  </div>
</template>

<script setup>
  import { useI18n } from "vue-i18n";

  const { t } = useI18n();
</script>

<style lang="less" scoped>
  @import '././styles/common.less';
</style>