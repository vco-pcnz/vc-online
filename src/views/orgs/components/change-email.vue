<template>
  <a-modal
    class="sys-form-content"
    :width="480"
    :open="open"
    :title="title"
    @cancel="closeModal"
  >
    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <a-form-item no-style>
        <a-row :gutter="8">
          <a-col :span="20">
            <a-form-item name="email" :label="t('验证邮箱')">
              <a-input
                v-model:value="form.email"
                :placeholder="t('验证邮箱')"
                disabled
              />
            </a-form-item>
          </a-col>
          <a-col :span="4" v-if="!verifyEmail.showCountdown">
            <a-form-item label=" ">
              <a-button
                @click="handleVerify(false)"
                block
                type="dark"
                class="verify-btn big"
              >
                {{ t('验证') }}
              </a-button>
            </a-form-item>
          </a-col>
          <a-col :span="4" v-else>
            <a-form-item label=" ">
              <countdown v-model:show="verifyEmail.showCountdown" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item
        name="code"
        :label="t('验证码V')"
        v-show="verifyEmail.showCode"
      >
        <a-input v-model:value="form.code" :placeholder="t('验证码V')" />
      </a-form-item>
      <a-form-item no-style>
        <a-row :gutter="8">
          <a-col :span="20">
            <a-form-item name="newEmail" :label="t('新邮箱')">
              <a-input
                v-model:value="form.newEmail"
                :placeholder="t('新邮箱')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="4" v-if="!verifyEmail.showCountdownNew">
            <a-form-item label=" ">
              <a-button
                @click="handleVerify(true)"
                block
                type="dark"
                class="verify-btn big"
              >
                {{ t('验证') }}
              </a-button>
            </a-form-item>
          </a-col>
          <a-col :span="4" v-else>
            <a-form-item label=" ">
              <countdown v-model:show="verifyEmail.showCountdownNew" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item
        name="newCode"
        :label="t('验证码V')"
        v-show="verifyEmail.showCodeNew"
      >
        <a-input v-model:value="form.newCode" :placeholder="t('验证码V')" />
      </a-form-item>
    </a-form>
    <template #footer>
      <div class="modal-footer">
        <a-button
          @click="save"
          size="large"
          type="primary"
          style="width: 40%"
          class="big"
          :loading="loading"
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
import { sendCodeOldE, sendCodeNewE, changeEmail } from '@/api/orgs/form/index';
import { EMAIL_RULE } from '@/constant';
import countdown from '../components/countdown.vue';
import useFormData from '@/utils/use-form-data';
import { message } from 'ant-design-vue';
import { trim } from 'lodash';
import { useOrgsDetailStore } from '@/store';
import { useRoute } from 'vue-router';

const { t } = useI18n();
const loading = ref(false);
const formRef = ref(null);
const orgsDetailStore = useOrgsDetailStore();

const props = defineProps(['open', 'title','email']);
const emit = defineEmits(['update:open']);

const verifyEmail = reactive({
  showCode: false,
  showCountdown: false,
  showCodeNew: false,
  showCountdownNew: false,
  open: false,
});

// 表单数据
const { form, assignFields } = useFormData({
  email: '',
  code: '',
  newEmail: '',
  newCode: '',
  uuid: '',
});

// 表单验证规则
const rules = reactive({
  newEmail: [
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
  code: [
    {
      required: true,
      message: t('请输入') + t('验证码V'),
    },
  ],
  newCode: [
    {
      required: true,
      message: t('请输入') + t('验证码V'),
    },
  ],
});
const closeModal = () => {
  emit('update:open', false);
  Object.keys(verifyEmail).forEach((key) => {
    verifyEmail[key] = false;
  });
};

const handleVerify = (isNew) => {
  if (isNew) {
    formRef.value.validate(['newEmail']).then(() => {
      sendCodeNewE({ email: form.newEmail }).then(() => {
        verifyEmail.showCountdownNew = true;
        verifyEmail.showCodeNew = true;
      });
    });
  } else {
    sendCodeOldE({ email: form.email, uuid: form.uuid }).then(() => {
      verifyEmail.showCountdown = true;
      verifyEmail.showCode = true;
    });
  }
};

const save = () => {
  formRef.value.validate(['newEmail']).then(() => {
    if (!trim(form.code) || !trim(form.newCode)) {
      message.warning(t('请先做邮箱验证'));
      return;
    }
    changeEmail({
      ...form,
      type: 1, // 邮箱
      email: form.newEmail,
      newEmail: undefined,
    })
      .then(() => {
        loading.value = false;
        message.success(t('修改成功'));
        orgsDetailStore.setDetail(useRoute().query.id);
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
      assignFields({
        email: props.email,
        uuid: props.uuid,
      });
    }
  }
);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.submit-btn:hover {
  color: @clr_white;
}
.verify-btn {
  min-width: auto;
  padding: 0;
}

.modal-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0;
}

.modal-content {
  height: 70vh;
  overflow-y: auto;
}
</style>
