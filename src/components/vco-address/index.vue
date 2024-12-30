<template>
  <Mode :config="config" :data="data" @change="change" v-if="appStore.config && appStore.config.address_mode == 2"></Mode>
  <Mode1 :config="config" :data="data" @change="change" v-if="appStore.config && appStore.config.address_mode == 1"></Mode1>
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
  },
  config: {
    type: Object,
    default: () => {
      return {
        addr: 'addr',
        address: 'address',
        suburb: 'suburb',
        postal: 'postal',
        con_id: 'con_id',
        region: 'region',
        province_code_name: 'province_code_name',
        province_code: 'province_code',
        city_code: 'city_code',
        district_code: 'district_code'
      };
    }
  }
});

const data = ref();

const init = (val) => {
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
