<template>
  <detail-layout active-tab="forecast" @getProjectDetail="getProjectDetail">
    <template #content>
      <a-spin :spinning="loading" size="large">
        <table-hook v-if="uuid" :uuid="uuid" :item-id="id" :projectDetail="projectDetail" :data="data" @update="loadData"></table-hook>
      </a-spin>
    </template>
  </detail-layout>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import DetailLayout from '../components/DetailLayout.vue';
  import TableHook from '@/views/projects/forecast/components/tableHook.vue';
  import { projectVariationDarwdownLog } from '@/api/project/variation'

  const route = useRoute();
  const { t } = useI18n();

  const uuid = ref(route.query.uuid)
  const id = ref(route.query.id)

  const projectDetail = ref();
  const getProjectDetail = (val) => {
    projectDetail.value = val;
  };

  const data = ref();
  const loading = ref(false);

  const loadData = () => {
    loading.value = true;
    projectVariationDarwdownLog({ uuid: uuid.value, id: id.value })
      .then((res) => {
        data.value = res;
      })
      .finally(() => {
        loading.value = false;
      });
  };

  onMounted(() => {
    loadData();
  })
</script>

<style lang="less" scoped></style>
