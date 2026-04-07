<template>
  <vco-page-tab
    v-if="showTab"
    :tabData="typeData"
    v-model:current="currentModel"
    style="margin-bottom: 15px;"
  />
</template>

<script setup>
import { computed, ref } from 'vue';
import { hasPermission } from '@/directives/permission/index';
import useProductStore from '@/store/modules/product';

const productStore = useProductStore();

const props = defineProps({
  current: {
    type: [String, Number],
    default: ''
  }
});

const emit = defineEmits(['update:current']);

const isVslProduct = computed(() => {
  const product = productStore.productData.find((p) => p.uuid === productStore.currentProduct);
  return product?.code === 'vsl';
});

const showTab = computed(() => {
  return (
    isVslProduct.value &&
    (hasPermission('projects:schedule:vs_schedule') || hasPermission('projects:schedule:boc_schedule'))
  );
});

const typeData = ref([
  { label: 'All', value: '' },
  { label: 'VS', value: 'VS', hide: !hasPermission('projects:schedule:vs_schedule') },
  { label: 'BOC', value: 'BOC', hide: !hasPermission('projects:schedule:boc_schedule') }
]);

const currentModel = computed({
  get: () => props.current,
  set: (val) => emit('update:current', val)
});
</script>
