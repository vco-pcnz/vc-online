<template>
  <Project v-if="data.module === 'project'" :data="data"></Project>
  <Loan v-if="data.module === 'request'" :data="data" @update="update"></Loan>
  <Other v-if="data.module === 'other'" :data="data"></Other>
</template>

<script setup>
import Project from './Project.vue';
import Loan from './Loan.vue';
import Other from './Other.vue';
import { useUserStore } from '@/store';
const emits = defineEmits(['update']);
const props = defineProps({
  data: {
    type: Object
  }
});

const userStore = useUserStore();

const update = () => {
  userStore.getTaskNumInfo();
  emits('update');
};
</script>
