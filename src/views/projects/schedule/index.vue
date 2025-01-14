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
  project_id.value = route.query.uuid || '9ff3cda9-a04c-48a0-b49a-05642a2e461b';
});

</script>

<style scoped lang="less">
@import '@/styles/variables.less';

</style>
