<template>
  <a-modal
    :width="1200"
    :open="visible"
    :title="t('变更抵押物')"
    :maskClosable="false"
    :footer="false"
    getContainer="body"
    @cancel="updateVisible(false)"
  >
    <security-batche-add
      ref="securityBatcheAddRef"
      :is-open="true"
      :is-variation="true"
      :variation-id="variationId"
      :security-data="securityData"
      @refresh="refreshHandle"
    ></security-batche-add>
  </a-modal>
</template>

<script scoped setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import securityBatcheAdd from '@/components/security-batche-add/index.vue';

const { t } = useI18n();
const emits = defineEmits(['refresh']);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  currentId: {
    type: [String, Number],
    default: ''
  },
  variationId: {
    type: [String, Number],
    default: ''
  },
  securityData: {
    type: Array,
    default: () => []
  }
});

/* 更新visible */
const updateVisible = (value) => {
  emits('update:visible', value);
};

const securityBatcheAddRef = ref();

const refreshHandle = (id) => {
  emits('refresh', id);
  updateVisible(false);
};

watch(() => props.visible, (val) => {
  if (val) {
    securityBatcheAddRef.value && securityBatcheAddRef.value.dataInit();
  }
})
</script>