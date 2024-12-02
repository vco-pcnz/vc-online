<template>
  <layout>
    <template #content>transition</template>
  </layout>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import layout from './components/layout.vue';

const { t } = useI18n();
</script>

<style scoped lang="less"></style>
