<template>
  <a-popconfirm class="inline" :title="tip" @confirm="confirm()">
    <slot>
      <a-button type="dark" class="big shadow bold uppercase mb-5 mt-5">{{ btn_text }}</a-button>
    </slot>
  </a-popconfirm>
</template>

<script scoped setup>
import { ref } from 'vue';
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
  }
});

const loading = ref(false);

const confirm = () => {
  loading.value = true;
  const paramsInfo = {
    url: props.url,
    method: 'post',
    data: props.formParams
  };
  request(paramsInfo)
    .then((res) => {
      emits('update');
      message.success(t('操作成功'));
    })
    .finally((_) => {
      loading.value = false;
    });
};
</script>
