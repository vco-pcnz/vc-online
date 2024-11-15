<template>
  <div>
    <language-select></language-select>
    <a-button @click="handleLogOut">退出</a-button>
  </div>
</template>

<script setup>
  import LanguageSelect from '@/components/language-select/index.vue'
  import { useUserStore } from '@/store';

  const userStore = useUserStore();

  const handleLogOut = () => {
    userStore.logout();
  }
</script>
