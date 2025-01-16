<template>
  <detail-layout :title="baseInfo.name" active-tab="forecast">
    <template #content>
      <tableHook :currentId="'ec58c625-3df7-465d-8316-1db220fdb0c2' ||'a0f7382c-ae5b-422c-94f5-6c0a87d0351b'"></tableHook>
    </template>
  </detail-layout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { size, template } from 'lodash';
import detailLayout from '../components/detailLayout.vue';
import tableHook from './components/tableHook.vue';

const { t } = useI18n();

const baseInfo = ref({
  id: 1614,
  name: 'test1212',
  purpose: ['Construction'],
  background: 'xxx'
});

onMounted(() => {});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
</style>
