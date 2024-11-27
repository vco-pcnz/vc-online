<template>
  <a-modal
    :width="480"
    :open="open"
    :title="isEdit ? t('编辑用户') : t('新增用户')"
    @cancel="closeModal"
  >
    <div class="sys-form-content mt-5">
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
        <a-form-item name="avatar" class="avatar">
          <vco-upload-image v-model:value="form.avatar" :text="t('头像')" :isAvatar="true"></vco-upload-image>
        </a-form-item>
        <a-form-item name="firstName" :label="t('名')">
          <a-input v-model:value="form.firstName" :placeholder="t('名')" />
        </a-form-item>
        <a-form-item name="middleName" :label="t('中间名')">
          <a-input v-model:value="form.middleName" :placeholder="t('中间名')" />
        </a-form-item>
        <a-form-item name="lastName" :label="t('姓')">
          <a-input v-model:value="form.lastName" :placeholder="t('姓')" />
        </a-form-item>
        <a-form-item name="email" :label="t('邮箱')">
          <a-input
            v-model:value="form.email"
            :placeholder="t('邮箱')"
            :disabled="isEdit && !!email_ok"
          />
        </a-form-item>
        <a-form-item :label="t('手机号')" name="mobile">
          <vco-mobile-input
            v-model:value="form.mobile"
            v-model:areaCode="form.pre"
            :disabled="isEdit && !!mobile_ok"
          ></vco-mobile-input>
        </a-form-item>
        <a-form-item name="verifyMode" v-if="!isEdit">
          <a-row>
            <a-col :span="12">
              <a-form-item-rest>
                <a-checkbox v-model:checked="form.sendEmail">
                  {{ t('发送邀请邮件') }}
                </a-checkbox>
              </a-form-item-rest>
            </a-col>
            <a-col :span="12">
              <a-form-item-rest>
                <a-checkbox v-model:checked="form.sendSms">
                  {{ t('发送邀请短信') }}
                </a-checkbox>
              </a-form-item-rest>
            </a-col>
          </a-row>
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
          {{ t('提交') }}
        </a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, watch, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { addUser, editUser } from '@/api/users';
import useFormData from '@/utils/use-form-data';
import { message } from 'ant-design-vue';
import { useUsersStore } from '@/store';
import { EMAIL_RULE } from '@/constant';

const { t } = useI18n();
const loading = ref(false);
const formRef = ref(null);
const usersStore = useUsersStore();
const isEdit = ref(false);

const props = defineProps(['open', 'userData']);
const emit = defineEmits(['update:open']);

const { form, resetFields, assignFields } = useFormData({
  avatar: '',
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  pre: '64',
  mobile: '',
  sendEmail: false,
  sendSms: false,
});

const email_ok = ref(0);
const mobile_ok = ref(0);

// 表单验证规则
const rules = reactive({
  avatar: [
    {
      required: true,
      message: t('请上传') + t('头像'),
      type: 'string',
      trigger: 'blur',
    },
  ],
  firstName: [
    {
      required: true,
      message: t('请输入') + t('名'),
      type: 'string',
      trigger: 'blur',
    },
  ],
  middleName: [
    {
      required: true,
      message: t('请输入') + t('中间名'),
      type: 'string',
      trigger: 'blur',
    },
  ],
  lastName: [
    {
      required: true,
      message: t('请输入') + t('姓'),
      type: 'string',
      trigger: 'blur',
    },
  ],
  email: [
    {
      required: true,
      message: t('请输入') + t('邮箱'),
      type: 'string',
      trigger: 'blur',
    },
    {
      pattern: EMAIL_RULE,
      message: t('邮箱格式不正确'),
    },
  ],
  verifyMode: [
    {
      validator: () => {
        if (!form.sendEmail && !form.sendSms) {
          return Promise.reject(t('必须选其中一项做验证'));
        }
        return Promise.resolve();
      },
      trigger: 'blur',
    },
  ],
  mobile: [
    {
      required: true,
      message: t('请输入') + t('手机号'),
      type: 'string',
      trigger: 'blur',
    },
  ],
});

const closeModal = () => {
  emit('update:open', false);
};

const edit = () => {
  editUser({
    ...form,
    sendEmail: undefined,
    sendSms: undefined,
    email: !!email_ok ? undefined : form.email,
    pre: !!mobile_ok ? undefined : form.pre,
    mobile: !!mobile_ok ? undefined : form.mobile,
  })
    .then(() => {
      loading.value = false;
      usersStore.getUserList();
      message.success(t('修改成功'));
      closeModal();
    })
    .catch(() => {
      loading.value = false;
    });
};

const save = () => {
  formRef.value.validate().then(() => {
    loading.value = true;
    if (isEdit.value) {
      edit();
      return;
    }
    addUser({
      ...form,
      sendEmail: form.sendEmail ? 1 : 0,
      sendSms: form.sendSms ? 1 : 0,
    })
      .then(() => {
        loading.value = false;
        usersStore.getUserList();
        message.success(t('新增成功'));
        closeModal();
      })
      .catch(() => {
        loading.value = false;
      });
  });
};

watch(
  () => props.open,
  (val) => {
    if (val) {
      const userInfo = props.userData;
      if (Object.keys(userInfo).length) {
        isEdit.value = true;
        assignFields({
          ...form,
          ...userInfo,
        });
        form.uuid = userInfo.uuid;
        email_ok.value = userInfo.email_ok;
        mobile_ok.value = userInfo.mobile_ok;
      }
    } else {
      isEdit.value = false;
      resetFields();
      formRef.value.clearValidate();
    }
  }
);
</script>

<style scoped lang="less">
.avatar {
  display: flex;
  justify-content: center;
}

.modal-footer {
  display: flex;
  justify-content: center;
}

.checkbox-group {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
</style>
