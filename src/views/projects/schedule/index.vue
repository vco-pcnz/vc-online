<template>
  <detail-layout :title="baseInfo.name" active-tab="schedule">
    <template #content>
      <schedule v-if="project_id" :currentId="project_id"></schedule>
    </template>
  </detail-layout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { size, template } from 'lodash';
import detailLayout from '../components/detailLayout.vue';
import schedule from '@/components/schedule/index.vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const { t } = useI18n();


const baseInfo = ref({
  id: 1614,
  name: 'test1212',
  purpose: ['Construction'],
  background: 'xxx'
});
const project_id = ref()

onMounted(() => {
  project_id.value = route.query.uuid ||'ec58c625-3df7-465d-8316-1db220fdb0c2' || 'a0f7382c-ae5b-422c-94f5-6c0a87d0351b' || '795e168e-51eb-48dd-aa39-a14792ed8f1c';
});

</script>

<style scoped lang="less">
@import '@/styles/variables.less';

</style>
