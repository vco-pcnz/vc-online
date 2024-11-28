<template>
  <users-layout />
</template>

<script setup>
import { onMounted } from 'vue';
import { useUsersStore } from '@/store';
import UsersLayout from '../components/UsersLayout.vue';

const usersStore = useUsersStore();

onMounted(() => {
  usersStore.setSearchParams({ sta: 2 });
});
</script>

<style scoped lang="less"></style>
