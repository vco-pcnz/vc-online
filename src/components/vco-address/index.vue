<template>
  <Mode :data="data" @change="change" v-if="appStore.config && appStore.config.address_mode == 2"></Mode>
  <Mode1 :data="data" @change="change" v-if="appStore.config &&appStore.config.address_mode == 1"></Mode1>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { cloneDeep } from 'lodash';
import Mode from './components/mode.vue';
import Mode1 from './components/mode1.vue';
import { useAppStore } from '@/store';

const appStore = useAppStore();
const emits = defineEmits(['update:value', 'change']);

const props = defineProps({
  value: {
    type: Object
  }
});

const data = ref();

const init = (val) => {
  console.log(1111111, val);
  data.value = cloneDeep(val);
};

const change = (val) => {
  emits('update:value', val);
  emits('change', val);
};

onMounted(() => {
  appStore.requestAppInfo();
});

// 暴露方法给父组件
defineExpose({
  init
});
</script>
