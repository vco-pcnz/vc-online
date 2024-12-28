<template>
  <a-row :gutter="24">
    <a-col :span="24">
      <a-form-item :label="t('地址1')" name="addr">
        <a-input v-model:value="form.addr" :placeholder="t('请输入')" />
      </a-form-item>
    </a-col>
    <a-col :span="24">
      <a-form-item :label="t('地址2')">
        <a-input v-model:value="form.address" :placeholder="t('请输入')" />
      </a-form-item>
    </a-col>
    <a-col :span="16">
      <a-form-item :label="t('区域')">
        <vco-address-select v-model:value="region"></vco-address-select>
      </a-form-item>
    </a-col>
    <a-col :span="8">
      <a-form-item :label="t('邮编')">
        <a-input v-model:value="form.postal" :placeholder="t('请输入')" />
      </a-form-item>
    </a-col>
  </a-row>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { pick, trim, cloneDeep } from 'lodash';
const { t } = useI18n();

const emits = defineEmits(['change']);
const props = defineProps({
  data: {
    type: Object
  }
});

const region = ref();
const form = ref({
  addr: '',
  address: '',
  postal: '',
  province_code: '',
  city_code: '',
  district_code: ''
});

watch(
  () => props.data,
  (val) => {
    if (trim(val)) {
      let keys = ['addr', 'address', 'postal', 'province_code', 'city_code', 'district_code'];
      form.value = pick(val, keys);
      region.value = [form.value.province_code, form.value.city_code, form.value.district_code].filter((item) => item).join(',');
    }
  },
  { deep: true, immediate: true }
);

// 监听地址选择组件赋值
watch(
  () => region.value,
  (val) => {
    let arr = region.value.split(',');
    form.value.province_code = arr[0] || '';
    form.value.city_code = arr[1] || '';
    form.value.district_code = arr[2] || '';
  }
);

watch(
  () => form.value,
  (val) => {
    emits('change', form.value);
  },
  { deep: true }
);
</script>
