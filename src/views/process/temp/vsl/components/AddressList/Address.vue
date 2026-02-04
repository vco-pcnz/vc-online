<template>
  <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
    <vco-address :config="config" ref="vcoAddressRef" @change="setAddressInfo" @validate="validateHandle"></vco-address>
  </a-form>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';

const { t } = useI18n();
const emits = defineEmits(['update:value', 'change']);

const props = defineProps({
  config: {
    type: Object
  },
  data: {
    type: Object,
    default: () => {
      return {};
    }
  }
});

const formState = ref({
  project_region: '',
  project_address_short: '',
  project_address: '',
  project_postcode: '',
  region_one_id: '',
  region_two_id: '',
  region_three_id: '',
  region_one_name: '',
  project_suburb: '',
  project_con_id: ''
});

const vcoAddressRef = ref();
const formRules = {
  project_region: [{ required: true, message: t('请选择') + t('项目地址'), trigger: 'change' }],
  project_address_short: [{ required: true, message: t('请输入') + t('地址1'), trigger: 'blur' }],
  region_one_name: [{ required: true, message: t('请输入') + t('城市/州'), trigger: 'blur' }],
  project_postcode: [
    { required: true, message: t('请输入') + t('邮编'), trigger: 'blur' },
    {
      pattern: /^[A-Za-z0-9\s\-]+$/,
      message: t('邮编') + t('格式不正确'),
      trigger: 'blur'
    }
  ]
};
const formRef = ref(null);
const validate = () => {
  return formRef.value.validate();
};
const setAddressInfo = (e) => {
  for (const key in e) {
    formState.value[key] = e[key] || '';
  }
  emits('update:value', formState.value);
  emits('change', formState.value);
};

const validateHandle = () => {
  formRef.value.validateFields(['region_one_name']);
};

onMounted(() => {
  for (const key in formState.value) {
    formState.value[key] = props.data[key] || formState.value[key] || '';
  }
  vcoAddressRef.value.init(formState.value);
});

watch(
  () => props.data,
  (val) => {
    nextTick(() => {
      if (!formState.value.project_postcode && props.data.project_postcode) {
        for (const key in formState.value) {
          formState.value[key] = props.data[key] || formState.value[key] || '';
        }
        vcoAddressRef.value.init(formState.value);
      }
    });
  },
  { deep: true, immediate: true }
);

// 暴露方法给父组件
defineExpose({
  validate
});
</script>

<style lang="less" scoped>
.myMode {
  :deep(.ant-modal-content) {
    .ant-modal-header {
      border-radius: 24px;
      .ant-modal-title {
        font-size: 20px;
        font-weight: 500;
      }
    }
  }
}
</style>
