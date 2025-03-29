<template>
  <detail-layout active-tab="schedule" @getProjectDetail="getProjectDetail">
    <template #content>
      <schedule
        v-if="uuid && id"
        :currentId="uuid"
        :item-id="id"
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
  const id = ref(route.query.id)

  const currentProduct = ref('')

  const getProjectDetail = (res) => {
    currentProduct.value = res.product.code
  }
</script>

<style lang="less" scoped></style>
