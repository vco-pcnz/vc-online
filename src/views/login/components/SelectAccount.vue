<template>
  <a-modal
    :width="480"
    :open="open"
    :title="t('选择登录账号')"
    @cancel="closeModal"
  >
    <div class="sys-form-content mt-5">
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
        <a-form-item name="account" :label="t('账号')">
          <a-select
            v-model:value="form.account"
            :options="accountOptions"
            :placeholder="t('请选择') + t('账号')"
          >
            <template #option="{ label, avatar }">
              <a-space>
                <vco-avatar :src="avatar" :size="24" />
                {{ label }}
              </a-space>
            </template>
          </a-select>
        </a-form-item>
      </a-form>
    </div>
    <template #footer>
      <div class="modal-footer">
        <a-button
          size="large"
          type="cyan"
          :loading="loading"
          class="register-btn big shadow bold"
          @click="save"
        >
          OK
        </a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import useFormData from '@/utils/use-form-data';
import { useUserStore } from '@/store';

const { t } = useI18n();
const userStore = useUserStore();

const loading = ref(false);
const formRef = ref(null);
const accountOptions = ref([]);

const props = defineProps(['open', 'accountList']);
const emit = defineEmits(['update:open', 'loginSuccessCb']);
// 表单数据
const { form, resetFields } = useFormData({
  account: '',
});

// 表单验证规则
const rules = reactive({
  account: [
    {
      required: true,
      message: t('请选择') + t('账号'),
      type: 'string',
      trigger: 'blur',
    },
  ],
});

const closeModal = () => {
  emit('update:open', false);
  resetFields();
  formRef.value.clearValidate();
};

const save = () => {
  formRef.value.validate().then(() => {
    loading.value = true;
    const { uuid, code } = accountOptions.value.find(
      (option) => option.value === form.account
    );
    userStore
      .loginBySelectUser({
        uuid,
        code,
      })
      .then(() => {
        loading.value = false;
        emit('loginSuccessCb');
        closeModal();
      })
      .catch(() => {
        loading.value = false;
      });
  });
};

onMounted(() => {
  accountOptions.value = props.accountList.map((item) => ({
    ...item,
    label: item.email,
    value: item.uuid,
  }));
});
</script>

<style scoped lang="less">
.modal-footer {
  display: flex;
  justify-content: center;
  padding: 10px 0;
}
</style>
