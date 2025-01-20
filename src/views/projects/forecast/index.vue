<template>
  <detail-layout :title="baseInfo.name" active-tab="forecast">
    <template #content>
      <tableHook v-if="uuid" :currentId="uuid"></tableHook>
    </template>
  </detail-layout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { size, template } from 'lodash';
import detailLayout from '../components/detailLayout.vue';
import tableHook from './components/tableHook.vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const { t } = useI18n();

const baseInfo = ref({
  id: 1614,
  name: 'test1212',
  purpose: ['Construction'],
  background: 'xxx'
});

const uuid = ref('');

onMounted(() => {
  uuid.value = route.query.uuid;
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
</style>
