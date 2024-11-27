<template>
  <profile-layout active-tab="about">
    <template #content>
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
        <a-row :gutter="8">
          <a-col :span="8">
            <a-form-item name="firstName" :label="t('名')">
              <a-input v-model:value="form.firstName" :placeholder="t('名')" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="middleName" :label="t('中间名')">
              <a-input
                v-model:value="form.middleName"
                :placeholder="t('中间名')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="lastName" :label="t('姓')">
              <a-input v-model:value="form.lastName" :placeholder="t('姓')" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item no-style>
          <a-row :gutter="8">
            <a-col :span="20">
              <a-form-item name="email" :label="t('邮箱')">
                <a-input
                  v-model:value="form.email"
                  :placeholder="t('邮箱')"
                  :disabled="!!userDetailStore.userDetail?.email_ok"
                />
              </a-form-item>
            </a-col>
            <a-col :span="4" v-if="!verifyEmail.showCountdown">
              <a-form-item label=" ">
                <a-button
                  v-if="!userDetailStore.userDetail?.email_ok"
                  @click="handleVerify(VERIFY_KEY.EMAIL)"
                  block
                  class="verify-btn"
                >
                  {{ t('验证') }}
                </a-button>
                <a-button
                  v-else
                  @click="handleChange(VERIFY_KEY.EMAIL)"
                  block
                  class="verify-btn"
                >
                  {{ t('变更') }}
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
          name="emailCode"
          :label="t('验证码V')"
          v-if="verifyEmail.showCode"
        >
          <a-input v-model:value="form.emailCode" :placeholder="t('验证码V')" />
        </a-form-item>
        <a-form-item :label="t('手机号')" name="mobile">
          <a-row :gutter="8">
            <a-col :span="4">
              <a-form-item-rest>
                <a-select
                  v-model:value="form.pre"
                  :options="preMobileOpts"
                  class="pre_mobile"
                  :disabled="!!userDetailStore.userDetail?.mobile_ok"
                />
              </a-form-item-rest>
            </a-col>
            <a-col :span="16">
              <a-input
                v-model:value="form.mobile"
                :placeholder="t('手机号')"
                :disabled="!!userDetailStore.userDetail?.mobile_ok"
              />
            </a-col>
            <a-col :span="4" v-if="!verifyMobile.showCountdown">
              <a-form-item-rest>
                <a-button
                  v-if="!userDetailStore.userDetail?.mobile_ok"
                  @click="handleVerify(VERIFY_KEY.MOBILE)"
                  block
                  class="verify-btn"
                >
                  {{ t('验证') }}
                </a-button>
                <a-button
                  v-else
                  @click="handleChange(VERIFY_KEY.MOBILE)"
                  block
                  class="verify-btn"
                >
                  {{ t('变更') }}
                </a-button>
              </a-form-item-rest>
            </a-col>
            <a-col :span="4" v-else>
              <a-form-item-rest>
                <countdown v-model:show="verifyMobile.showCountdown" />
              </a-form-item-rest>
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item
          name="mobileCode"
          :label="t('验证码V')"
          v-if="verifyMobile.showCode"
        >
          <a-input
            v-model:value="form.mobileCode"
            :placeholder="t('验证码V')"
          />
        </a-form-item>
        <a-form-item name="intro" :label="t('关于')">
          <a-textarea v-model:value="form.intro" :placeholder="t('关于')" />
        </a-form-item>
        <a-row>
          <a-col :span="6" :offset="9">
            <a-button
              type="primary"
              size="large"
              :loading="loading"
              @click="submit"
              block
            >
              {{ t('提交') }}
            </a-button>
          </a-col>
        </a-row>
      </a-form>
      <change-email
        v-model:open="verifyEmail.open"
        :title="t('编辑邮箱')"
        :email="userDetailStore.userDetail?.email"
      />
      <change-mobile
        v-model:open="verifyMobile.open"
        :title="t('编辑手机号')"
      />
    </template>
  </profile-layout>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { preMobileOpts, EMAIL_RULE, VERIFY_KEY } from '@/constant';
import useFormData from '@/utils/use-form-data';
import countdown from '../components/Countdown.vue';
import { sendUnauthECode, sendUnauthCodeM, modifyUserInfo } from '@/api/profile';
import changeEmail from './change-email.vue';
import changeMobile from './change-mobile.vue';
import { useUserDetailStore } from '@/store';
import profileLayout from '../components/ProfileLayout.vue';
import { message } from 'ant-design-vue';

const { t } = useI18n();
const formRef = ref();
const loading = ref(false);

const userDetailStore = useUserDetailStore();

const verifyEmail = reactive({
  showCode: false,
  showCountdown: false,
  open: false,
});
const verifyMobile = reactive({
  showCode: false,
  showCountdown: false,
  open: false,
});

// 表单数据
const { form, assignFields } = useFormData({
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  emailCode: '',
  pre: '64',
  mobile: '',
  intro: '',
  mobileCode: '',
});

// 表单验证规则
const rules = reactive({
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
      pattern: EMAIL_RULE,
      message: t('邮箱格式不正确'),
    },
  ],
});

const handleVerify = (key) => {
  if (key === VERIFY_KEY.EMAIL) {
    sendUnauthECode({ email: form.email });
    verifyEmail.showCode = true;
    verifyEmail.showCountdown = true;
  } else if (key === VERIFY_KEY.MOBILE) {
    sendUnauthCodeM({
      pre: form.pre,
      mobile: form.mobile,
    });
    verifyMobile.showCode = true;
    verifyMobile.showCountdown = true;
  }
};

const handleChange = (key) => {
  if (key === VERIFY_KEY.EMAIL) {
    verifyEmail.open = true;
  } else if (key === VERIFY_KEY.MOBILE) {
    verifyMobile.open = true;
  }
};

const reset = () => {
  Object.keys(verifyEmail).forEach((key) => {
    verifyEmail[key] = false;
  });
  Object.keys(verifyMobile).forEach((key) => {
    verifyMobile[key] = false;
  });
};

const submit = () => {
  formRef.value.validate().then(() => {
    loading.value = true;
    const newData = {
      ...form,
      now_email: form.email,
      now_pre: form.pre,
      now_mobile: form.mobile,
      email: undefined,
      pre: undefined,
      mobile: undefined,
    };
    modifyUserInfo(newData)
      .then(() => {
        loading.value = false;
        message.success(t('修改成功'));
        userDetailStore.getUserInfo();
        reset();
      })
      .catch(() => {
        loading.value = false;
      });
  });
};

watch(
  () => userDetailStore.userDetail,
  (val) => {
    if (Object.keys(val).length) {
      const { firstName, middleName, lastName, email, pre, mobile, intro } =
        val;
      assignFields({
        firstName,
        middleName,
        lastName,
        email,
        pre,
        mobile,
        intro,
      });
    }
  }
);
</script>

<style lang="less">
@import '@/styles/variables.less';
.verify-btn {
  background-color: @clr_charcoal;
  color: @clr_white;
}
</style>
