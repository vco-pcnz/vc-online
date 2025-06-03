<template>
  <applyBrokerDetail ref="applyBrokerDetailRef" :detailData="applyBrokerDetail?.apply_info" :apply_user="applyBrokerDetail?.apply_user" :process="applyBrokerDetail" :has_permission="true" @update="update"></applyBrokerDetail>
</template>

<script setup>
import { ref } from 'vue';
import ApplyBrokerDetail from '@/views/profile/apply-broker/detail.vue';
const emits = defineEmits(['update']);

const todoHandle = (val) => {
  if (val) {
    showApplyBrokerDetail(val);
  }
};
const applyBrokerDetailRef = ref();
const applyBrokerDetail = ref({});
const showApplyBrokerDetail = (val) => {
  applyBrokerDetail.value = val;
  applyBrokerDetailRef.value.updateVisible(true);
};

const update = () => {
  emits('update');
};

defineExpose({
  todoHandle
});
</script>
