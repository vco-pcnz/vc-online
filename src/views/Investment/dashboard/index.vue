<template>
  <DetailLayout :title="t('投资人首页')" active-tab="home"></DetailLayout>
  <Home :isDetail="true"></Home>
</template>

<script setup name="Projects">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import DetailLayout from '../components/detailLayout.vue';
import Home from '@/views/investor/home/index.vue';

const { t } = useI18n();
</script>
