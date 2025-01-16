<template>
  <detail-layout :title="baseInfo.name" active-tab="documents">
    <template #content>
      <Documents v-if="project_id" :project_id="project_id"></Documents>
    </template>
  </detail-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import detailLayout from '../components/detailLayout.vue';
import Documents from '@/components/documents/index.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const { t } = useI18n();

const project_id = ref();

const baseInfo = ref({
  id: 1614,
  name: 'test1212',
  purpose: ['Construction'],
  background: 'xxx'
});

onMounted(() => {
  project_id.value = route.query.uuid || 'a0f7382c-ae5b-422c-94f5-6c0a87d0351b' || '9ff3cda9-a04c-48a0-b49a-05642a2e461b';
});

</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.content {
  gap: 24px;
  border: 1px solid #e2e5e2;
  box-shadow: 2px 2px 4px 0 hsla(120, 5%, 89%, 0.15), 5px 5px 7px 0 hsla(0, 0%, 53%, 0.1);
  border-radius: 12px;
  padding: 10px;
  min-height: 550px;
  &.grid {
    display: grid;
    grid-template-columns: 1.2fr 3fr;
  }
}
</style>
