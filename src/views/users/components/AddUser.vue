<template>
  <a-modal :width="550" :open="open" :title="isEdit ? t('编辑用户') : t('新增用户')" @cancel="closeModal">
    <div class="sys-form-content mt-5">
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
        <a-form-item name="avatar" class="avatar" v-if="!isComponent">
          <vco-upload-image v-model:value="form.avatar" text="头像" :isAvatar="true"></vco-upload-image>
        </a-form-item>
        <a-form-item :label="t('类型')" name="type">
          <a-select v-model:value="form.type" :placeholder="t('类型')">
            <a-select-option :value="0">
              {{ t('个人') }}
            </a-select-option>
            <a-select-option :value="1">
              {{ t('公司') }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <template v-if="form.type">
          <a-form-item name="user_name" :label="t('名称')">
            <a-input v-model:value="form.user_name" :placeholder="t('名称')" />
          </a-form-item>
        </template>
        <template v-else>
          <a-form-item name="firstName" :label="t('名')">
            <a-input v-model:value="form.firstName" :placeholder="t('名')" />
          </a-form-item>
          <a-form-item name="middleName" :label="t('中间名')">
            <a-input v-model:value="form.middleName" :placeholder="t('中间名')" />
          </a-form-item>
          <a-form-item name="lastName" :label="t('姓')">
            <a-input v-model:value="form.lastName" :placeholder="t('姓')" />
          </a-form-item>
        </template>

        <a-form-item name="email" :label="t('邮箱')">
          <a-input v-model:value="form.email" :placeholder="t('邮箱')" :disabled="isEdit && !!email_ok" />
        </a-form-item>
        <a-form-item :label="t('手机号')" :name="isComponent ? '' : 'mobile'">
          <vco-mobile-input v-model:value="form.mobile" v-model:areaCode="form.pre" :disabled="isEdit && !!mobile_ok"></vco-mobile-input>
        </a-form-item>
        <a-form-item :name="isComponent ? '' : 'verifyMode'" v-if="!isEdit">
          <a-row>
            <a-col :span="12">
              <a-form-item-rest>
                <a-checkbox v-model:checked="form.sendEmail" :disabled="!form.email">
                  {{ t('发送邀请邮件') }}
                </a-checkbox>
              </a-form-item-rest>
            </a-col>
            <template v-if="useAppStore().openSms">
              <a-col :span="12">
                <a-form-item-rest>
                  <a-checkbox v-model:checked="form.sendSms" :disabled="!form.mobile">
                    {{ t('发送邀请短信') }}
                  </a-checkbox>
                </a-form-item-rest>
              </a-col>
            </template>
          </a-row>
        </a-form-item>
      </a-form>
    </div>
    <template #footer>
      <div class="mt-5 flex justify-end gap-5">
        <a-button type="grey" class="big shadow bold uppercase mb-5 mt-5" @click="closeModal()">{{ t('取消') }}</a-button>

        <a-button type="dark" class="big shadow bold uppercase mb-5 mt-5" :loading="loading" @click="save">{{ t('提交') }}</a-button>
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
import { useAppStore } from '@/store';

const { t } = useI18n();
const loading = ref(false);
const formRef = ref(null);
const usersStore = useUsersStore();
const isEdit = ref(false);

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  userData: {
    type: Object
  },
  isComponent: {
    type: Boolean,
    default: false
  },
  p__uuid: {
    type: String
  }
});
const emit = defineEmits(['update:open', 'submit']);

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
  type: 0,
  company: '',
  user_name: ''
});

const email_ok = ref(0);
const mobile_ok = ref(0);

// 表单验证规则
const rules = reactive({
  user_name: [
    {
      required: true,
      message: t('请输入') + t('名称'),
      type: 'string',
      trigger: 'blur'
    }
  ],
  firstName: [
    {
      required: true,
      message: t('请输入') + t('名'),
      type: 'string',
      trigger: 'blur'
    }
  ],
  lastName: [
    {
      required: true,
      message: t('请输入') + t('姓'),
      type: 'string',
      trigger: 'blur'
    }
  ],
  email: [
    {
      required: true,
      message: t('请输入') + t('邮箱'),
      type: 'string',
      trigger: 'blur'
    },
    {
      pattern: EMAIL_RULE,
      message: t('邮箱格式不正确')
    }
  ],
  verifyMode: [
    {
      validator: () => {
        if (!form.sendEmail && !form.sendSms) {
          return Promise.reject(t('必须选其中一项做验证'));
        }
        return Promise.resolve();
      },
      trigger: 'blur'
    }
  ],
  mobile: [
    {
      required: true,
      message: t('请输入') + t('手机号'),
      type: 'string',
      trigger: 'blur'
    }
  ]
});

const closeModal = () => {
  emit('update:open', false);
};

const edit = () => {
  editUser({
    ...form,
    company: form.type ? form.user_name : '',
    user_name: form.type ? form.user_name : '',
    sendEmail: undefined,
    sendSms: undefined,
    email: !!email_ok ? undefined : form.email,
    pre: !!mobile_ok ? undefined : form.pre,
    mobile: !!mobile_ok ? undefined : form.mobile
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
    const params = {
      ...form,

      sendEmail: form.email ? (form.sendEmail ? 1 : 0) : 0,
      sendSms: form.mobile ? (form.sendSms ? 1 : 0) : 0
    };
    if (props.isComponent) {
      params['do__add'] = 1;
      params['p__uuid'] = props.p__uuid;
    }
    addUser(params)
      .then((res) => {
        loading.value = false;
        usersStore.getUserList();
        message.success(t('新增成功'));

        if (props.isComponent) {
          emit('submit', [res]);
        }
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
      if (userInfo && Object.keys(userInfo).length) {
        isEdit.value = true;
        assignFields({
          ...form,
          ...userInfo
        });
        form.uuid = userInfo.uuid;
        email_ok.value = userInfo.email_ok;
        mobile_ok.value = userInfo.mobile_ok;
      }
    } else {
      isEdit.value = false;
      loading.value = false;
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
