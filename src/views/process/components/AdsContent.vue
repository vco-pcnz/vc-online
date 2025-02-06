<template>
  <div>
    <div v-if="isNormalUser" class="block-item ads-content">
      <img src="./../../../assets/images/img1.jpg" alt="">
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { useUserStore } from '@/store';

  const userStore = useUserStore();

  const isNormalUser = computed(() => userStore.isNormalUser)
</script>