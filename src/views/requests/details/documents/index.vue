<template>
  <detail-layout active-tab="documents" @getProjectDetail="getProjectDetail">
    <template #content>
      <a-spin :spinning="pageLoading" size="large">
        <div class="container-box">
          <Documents v-if="showDoc && !pageLoading" :project_id="uuid" :annex_id="annex_id" :edit="false"></Documents>
          <a-empty v-if="!showDoc && !pageLoading" />
        </div>
      </a-spin>
    </template>
  </detail-layout>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import DetailLayout from '../components/DetailLayout.vue';
  import Documents from '@/components/documents/index.vue';
  import { useRoute } from 'vue-router';

  const route = useRoute();

  const uuid = ref(route.query.uuid)
  const annex_id = ref(route.query.annex_id || 0)

  const pageLoading = ref(true)

  const projectDetail = ref();
  const getProjectDetail = async (val) => {
    projectDetail.value = val;
    pageLoading.value = false
  };

  const showDoc = computed(() => {
    let res = false
    if (projectDetail.value?.loan) {
      res = Number(projectDetail.value.loan.loan_money) && uuid.value
    }

    return res
  })
</script>

<style lang="less" scoped>
  .container-box {
    min-height: 300px;
  }
</style>
