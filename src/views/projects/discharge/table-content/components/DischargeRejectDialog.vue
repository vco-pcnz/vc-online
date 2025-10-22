<template>
  <a-modal :width="486" :open="visible" :title="t('拒绝请求')" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <a-form
          ref="formRef"
          layout="vertical"
          :model="formState"
          :rules="formRules"
        >
          <a-form-item :label="t('拒绝原因')" name="decline_reason">
            <a-textarea v-model:value="formState.decline_reason" :rows="6" />
          </a-form-item>
        </a-form>

        <div class="flex justify-center">
          <a-button type="dark" class="save big uppercase" :loading="subLoading" @click="submitHandle">
            {{ t('提交') }}
          </a-button>
        </div>
      </div>
    </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { dischargeNdecline } from '@/api/project/loan';

const { t } = useI18n();

const emits = defineEmits(['update:visible', 'done']);
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  p_uuid: {
    type: String,
    default: ''
  },
  id: {
    type: [String, Number],
    default: ''
  },
});

/* 更新visible */
const updateVisible = (value) => {
  emits('update:visible', value);
};

const subLoading = ref(false);

const formRef = ref();
const formState = ref({
  decline_reason: ''
});

const formRules = ref({
  decline_reason: [
    { required: true, message: t('请输入') + t('拒绝原因'), trigger: 'blur' }
  ]
});

const submitHandle = () => {
  formRef.value.validate().then(() => {
    const params = {
      ...formState.value,
      uuid: props.p_uuid,
      id: props.id
    }

    subLoading.value = true
    dischargeNdecline(params).then(() => {
      subLoading.value = false
      updateVisible(false)
      emits('done')
    }).catch(() => {
      subLoading.value = false
    })
  });
};

watch(
    () => props.visible,
    (val) => {
      if (!val) {
        formState.value.decline_reason = '';
        subLoading.value = false;
        formRef.value?.clearValidate();
      }
    }
  )
</script>