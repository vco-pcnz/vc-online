<template>
  <div class="block-main-content">
    <div class="change-item">
      <p class="title">{{ t('变更前') }}</p>
    </div>
    <div class="change-item">
      <p class="title">{{ t('变更值') }}</p>
    </div>
    <div class="change-item">
      <p class="title">{{ t('变更后') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';

const { t } = useI18n();
</script>

<style lang="less" scoped>
.block-main-content {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  > .change-item {
    padding: 32px 30px 36px;
    background-color: #f0f0f0;
    border: 1px solid #f0f0f0;
    border-radius: 10px;
  }
}
</style>
