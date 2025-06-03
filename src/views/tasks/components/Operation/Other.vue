<template>
  <applyBrokerDetail ref="applyBrokerDetailRef" :detailData="applyBrokerDetail?.apply_info" :apply_user="applyBrokerDetail?.apply_user" :process="applyBrokerDetail" :has_permission="true" @update="update"></applyBrokerDetail>

  <a-button type="primary" size="small" shape="round" class="uppercase" @click="todoHandle()">{{ t('点击处理') }}</a-button>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ApplyBrokerDetail from '@/views/profile/apply-broker/detail.vue';
const emits = defineEmits(['update']);
const { t } = useI18n();
const props = defineProps({
  data: {
    type: Object
  }
});

const todoHandle = () => {
    showApplyBrokerDetail();
};
const applyBrokerDetailRef = ref();
const applyBrokerDetail = ref({});
const showApplyBrokerDetail = () => {
  applyBrokerDetail.value = props.data;
  applyBrokerDetailRef.value.updateVisible(true);
};

const update = () => {
  emits('update');
};
</script>
