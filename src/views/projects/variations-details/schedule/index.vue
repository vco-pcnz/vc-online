<template>
  <detail-layout active-tab="schedule">
    <template #content>
      <schedule
        v-if="uuid && id"
        :currentId="uuid"
        :item-id="id"
      ></schedule>
    </template>
  </detail-layout>
</template>

<script setup>
  import { ref } from 'vue'
  import DetailLayout from '../components/DetailLayout.vue';
  import schedule from '@/components/schedule/index.vue';
  import { useRoute } from 'vue-router';

  const route = useRoute();

  const uuid = ref(route.query.uuid)
  const id = ref(route.query.id)
</script>

<style lang="less" scoped></style>
