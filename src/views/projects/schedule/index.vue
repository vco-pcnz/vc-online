<template>
  <detail-layout active-tab="schedule" @getProjectDetail="getProjectDetail">
    <template #content>
      <schedule
        v-if="project_id"
        :isDetails="true"
        :current-product="currentProduct"
        :isClose="Boolean(projectDetail?.base?.is_close)"
        :isAbout="true"
        :currentId="project_id"
        :ptRole="!!projectDetail?.base?.ptRole"
        :is-old="isOld"
        :is-reset="true"
        :closeDate="projectDetail?.base?.close_date"
        :vs_is_import="projectDetail?.vslInfo?.vs_is_import"
      ></schedule>
    </template>
  </detail-layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import detailLayout from '../components/detailLayout.vue';
import schedule from '@/components/schedule/index.vue';
import { useRoute } from 'vue-router';
import { hasPermission } from '@/directives/permission/index';

const { t } = useI18n();
const route = useRoute();
const project_id = ref();
const currentProduct = ref('');
const isOld = ref(false);

const projectDetail = ref();
const getProjectDetail = (val) => {
  isOld.value = Boolean(val.base.old);
  currentProduct.value = val.product.code;
  projectDetail.value = val;
};

onMounted(() => {
  project_id.value = route.query.uuid;
});
</script>
