<template>
  <div class="footer-container">
    <div class="Copyright">Copyright © 2022-present Vincent Capital</div>
    <router-link :to="!isNormalUser && pageRole !== 'Investor' ? '/version' : ''" class="version">{{ version }}</router-link>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
const version = ref();
import { useUserStore } from '@/store';

const isNormalUser = computed(() => useUserStore().isNormalUser);
const pageRole = computed(() => useUserStore().pageRole);

const getVersion = async () => {
  try {
    // 添加时间戳防止缓存
    const response = await fetch(`/version.json?t=${Date.now()}`);
    if (!response.ok) throw new Error('Failed to fetch version');
    const data = await response.json();
    version.value = data.version;
  } catch (error) {
    console.error('检查版本更新失败:', error);
  }
};

onMounted(() => {
  getVersion();
});
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
