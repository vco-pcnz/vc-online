<template>
  <profile-layout active-tab="notice">
    <template #content> notice </template>
  </profile-layout>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useI18n } from "vue-i18n";
import profileLayout from "../components/profile-layout.vue";

const { t } = useI18n();
</script>

<style scoped lang="less"></style>
