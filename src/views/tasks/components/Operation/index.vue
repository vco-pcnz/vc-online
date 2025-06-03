<template>
  <Project v-if="data.module === 'project'" :data="data" @update="update"></Project>
  <Loan v-if="data.module === 'request'" :data="data" :vcTeamData="vcTeamData" :vcTeamObj="vcTeamObj" @update="update"></Loan>
  <Other v-if="data.module === 'other'" :data="data" @update="update"></Other>
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
  },
  vcTeamData: {
    type: Array
  },
  vcTeamObj: {
    type: Object
  }
});

const userStore = useUserStore();

const update = () => {
  userStore.getTaskNumInfo();
  emits('update');
};
</script>
