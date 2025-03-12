<template>
  <detail-layout active-tab="documents" @getProjectDetail="getProjectDetail">
    <template #content>
      <Documents v-if="uuid" :project_id="uuid" :edit="!projectDetail?.base?.is_close"></Documents>
    </template>
  </detail-layout>
</template>

<script setup>
  import { ref } from 'vue'
  import DetailLayout from '../components/DetailLayout.vue';
  import Documents from '@/components/documents/index.vue';
  import { useRoute } from 'vue-router';

  const route = useRoute();

  const uuid = ref(route.query.uuid)

  const projectDetail = ref();
  const getProjectDetail = (val) => {
    projectDetail.value = val;
  };
</script>

<style lang="less" scoped></style>
