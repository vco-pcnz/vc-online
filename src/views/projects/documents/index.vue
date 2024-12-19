<template>
  <detail-layout :title="baseInfo.name" active-tab="documents">
    <template #content>
    </template>
  </detail-layout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { size, template } from 'lodash';
import detailLayout from '../components/detailLayout.vue';

const { t } = useI18n();


const baseInfo = ref({
  id: 1614,
  name: 'test1212',
  purpose: ['Construction'],
  background: 'xxx'
});

onMounted(() => {

});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

</style>
