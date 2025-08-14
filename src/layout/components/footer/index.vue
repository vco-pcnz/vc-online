<template>
  <div class="footer-container">
    <div class="Copyright">Copyright © 2022-present Vincent Capital</div>
    <router-link :to="!isNormalUser && pageRole !== 'Investor' ? '/version' : ''" class="version">{{ version }}</router-link>
  </div>
</template>

<script setup>
import { computed } from 'vue';
const version = __APP_VERSION__;
import { useUserStore } from '@/store';

const isNormalUser = computed(() => useUserStore().isNormalUser);
const pageRole = computed(() => useUserStore().pageRole);
</script>

<style lang="less" scoped>
.footer-container {
  padding-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  > .Copyright {
    text-align: center;
    line-height: 24px;
    font-size: 14px;
    color: #999;
  }
  > .version {
    margin-left: 10px;
    color: #d8b480;
    font-weight: normal;
    font-weight: bold;
  }
}
</style>
