<template>
  <detail-layout active-tab="schedule" @getProjectDetail="getProjectDetail">
    <template #content>
      <schedule
        v-if="uuid && currentProduct"
        :currentId="uuid"
        :isDetails="true"
        :is_buyout="true"
        :current-product="currentProduct"
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

  const currentProduct = ref('')

  const getProjectDetail = (res) => {
    currentProduct.value = res.product.code
  }
</script>

<style lang="less" scoped></style>
