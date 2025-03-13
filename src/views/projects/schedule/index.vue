<template>
  <detail-layout active-tab="schedule" @getProjectDetail="getProjectDetail">
    <template #content>
      <schedule v-if="project_id" :isDetails="true" :isClose="Boolean(projectDetail?.base?.is_close)" :isAbout="true" :currentId="project_id" :ptRole="!!projectDetail?.base?.ptRole"></schedule>
    </template>
  </detail-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import detailLayout from '../components/detailLayout.vue';
import schedule from '@/components/schedule/index.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const project_id = ref();

const projectDetail = ref();
const getProjectDetail = (val) => {
  projectDetail.value = val;
};

onMounted(() => {
  project_id.value = route.query.uuid;
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
</style>
