<template>
  <Layout></Layout>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import Layout from '../components/Layout.vue';

const { t } = useI18n();
</script>

<style scoped lang="less"></style>
