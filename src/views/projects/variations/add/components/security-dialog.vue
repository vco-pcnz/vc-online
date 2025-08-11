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
    <security-list-view
      v-if="isView"
      type="open"
      :is-variation="true"
      :is-view="true"
      :security-data="securityData"
      class="mt-5"
    />
    <security-batche-add
      v-else
      ref="securityBatcheAddRef"
      :is-open="true"
      :is-variation="true"
      :variation-id="variationId"
      :security-data="securityData"
      :has-build="hasBuild"
      @refresh="refreshHandle"
    ></security-batche-add>
  </a-modal>
</template>

<script scoped setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import securityBatcheAdd from '@/components/security-batche-add/index.vue';
import SecurityListView from "@/components/security-list-view/index.vue"

const { t } = useI18n();
const emits = defineEmits(['refresh', 'update:visible']);

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
  },
  hasBuild: {
    type: Boolean,
    default: false
  },
  isView: {
    type: Boolean,
    default: false
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