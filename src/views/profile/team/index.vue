<template>
  <profile-layout active-tab="team">
    <template #content>
      <layout :uuid="userDetailStore.userDetail.uuid" :edit="true"></layout>
    </template>
  </profile-layout>
</template>

<script setup>
import profileLayout from '../components/ProfileLayout.vue';
import layout from './components/layout.vue';
import { useUserDetailStore } from '@/store';
const userDetailStore = useUserDetailStore();
</script>

<style scoped lang="less"></style>
