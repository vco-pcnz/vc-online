<template>
  <detail-layout :title="baseInfo.name" active-tab="schedule">
    <template #content>
      <schedule v-if="project_id" :isDetails="true" :isAbout="true" :currentId="project_id"></schedule>
    </template>
  </detail-layout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { size, template } from 'lodash';
import detailLayout from '../components/detailLayout.vue';
import schedule from '@/components/schedule/index.vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const { t } = useI18n();

const baseInfo = ref({
  id: 1614,
  name: 'test1212',
  purpose: ['Construction'],
  background: 'xxx'
});
const project_id = ref();

onMounted(() => {
  project_id.value = route.query.uuid;
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
</style>
