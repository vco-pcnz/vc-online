<template>
  <detail-layout active-tab="schedule" @getProjectDetail="getProjectDetail">
    <template #content>
      <schedule
        v-if="uuid && id && currentProduct"
        :currentId="uuid"
        :item-id="id"
        :late-table="lateTable"
        :variation-info="variationInfo"
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
  const lateTable = ref(false)

  const currentProduct = ref('')

  const variationInfo = ref({})
const getProjectDetail = (res) => {
    if (res.product.code !== 'vsl') {
      lateTable.value = Number(res.variationInfo.is_late) === 1
    }
    currentProduct.value = res.product.code
    variationInfo.value = res.variationInfo
  }
</script>

<style lang="less" scoped></style>
