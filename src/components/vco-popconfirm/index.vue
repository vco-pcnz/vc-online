<template>
  <a-popconfirm
    class="inline"
    :title="tip"
    :overlayStyle="overlayStyle"
    @confirm="confirm()"
    @click.stop
  >
    <slot>
      <a-button type="dark" class="big shadow bold uppercase mb-5 mt-5">{{ btn_text }}</a-button>
    </slot>
  </a-popconfirm>
</template>

<script scoped setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import { request } from '@/utils/request';

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  url: {
    type: String
  },
  formParams: {
    type: Object,
    default: {}
  },
  tip: {
    type: String
  },
  btn_text: {
    type: String
  },
  method: {
    type: String,
    default: 'post'
  },
  width: {
    type: [String, Number],
    default: undefined
  }
});

const loading = ref(false);
const overlayStyle = computed(() => {
  if (!props.width && props.width !== 0) return {};
  const widthValue = typeof props.width === 'number' ? `${props.width}px` : props.width;
  return { width: widthValue };
});

const confirm = () => {
  loading.value = true;
  if(props.method === 'get'){
    const paramsInfo = {
      url: props.url,
      method: props.method,
      params: props.formParams
    };
    request(paramsInfo)
      .then((res) => {
        emits('update',res);
        message.success(t('操作成功'));
      })
      .finally((_) => {
        loading.value = false;
      });
  } else {
    const paramsInfo = {
      url: props.url,
      method: props.method,
      data: props.formParams
    };
    request(paramsInfo)
      .then((res) => {
        emits('update',res);
        message.success(t('操作成功'));
      })
      .finally((_) => {
        loading.value = false;
      });
  }
};
</script>
