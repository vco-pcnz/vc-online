<template>
  <div>
    <vco-page-nav sup-path="/projects"></vco-page-nav>
    <ProjectsTable />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import ProjectsTable from './ProjectsTable.vue';

const { t } = useI18n();

</script>

<style scoped lang="less"></style>
