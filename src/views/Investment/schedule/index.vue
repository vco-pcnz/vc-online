<template>
  <DetailLayout :title="t('明细表')" active-tab="schedule"></DetailLayout>
  <Schedule :isDetail="true"></Schedule>
</template>

<script setup name="Projects">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import DetailLayout from '../components/detailLayout.vue';
import Schedule from '@/views/investor/schedule/index.vue';

const { t } = useI18n();
</script>
