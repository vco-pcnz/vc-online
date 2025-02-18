<template>
  <profile-layout active-tab="parentTeam">
    <template #content>
      <layout :uuid="userDetailStore.userDetail.uuid"></layout>
    </template>
  </profile-layout>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import profileLayout from '../components/ProfileLayout.vue';
import layout from './components/layout.vue';
import { useUserDetailStore } from '@/store';
import { message } from 'ant-design-vue';
const userDetailStore = useUserDetailStore();
const { t } = useI18n();

</script>

<style scoped lang="less"></style>
