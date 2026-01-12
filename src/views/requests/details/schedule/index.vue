<template>
  <detail-layout active-tab="schedule" @getProjectDetail="getProjectDetail">
    <template #content>
      <a-spin :spinning="pageLoading" size="large">
        <div class="container-box">
          <schedule v-if="showSch && !pageLoading" :currentId="uuid" :is-details="true" :is-process="true" :current-product="currentProduct"></schedule>
          <a-empty v-if="!showSch && !pageLoading" />
        </div>
      </a-spin>
    </template>
  </detail-layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import DetailLayout from '../components/DetailLayout.vue';
import schedule from '@/components/schedule/index.vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const uuid = ref(route.query.uuid);

const currentProduct = ref('');
const pageLoading = ref(true);

const projectDetail = ref();
const getProjectDetail = async (val) => {
  currentProduct.value = val.product.code;

  projectDetail.value = val;
  pageLoading.value = false;
};

const showSch = computed(() => {
  let res = false;
  if (projectDetail.value?.lending) {
    res = (Number(projectDetail.value.lending.build_amount) || Number(projectDetail.value.lending.land_amount) || Number(projectDetail.value.lending.loan_money)) && uuid.value;
  }

  return res;
});
</script>

<style lang="less" scoped>
.container-box {
  min-height: 300px;
}
</style>
