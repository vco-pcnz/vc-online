<template>
  <auth-template>
    <template #header>
      <router-link v-if="showRegisterBtn" to="/register">
        <a-button type="cyan" shape="round">{{ t('注册') }}</a-button>
      </router-link>
    </template>
    <template #content>
      <div class="login_content">
        <div class="login_form_title">
          <h1>
            <span class="vc_text">VC&nbsp;</span>
            <span class="online_text">Online</span>
          </h1>
        </div>
        <a-form ref="formRef" :model="form" :rules="rules" class="login_form_container">
          <a-form-item name="type">
            <a-radio-group v-model:value="form.type" class="login_mode_radio">
              <a-radio v-for="item in loginModeOptions" :key="item.value" :disabled="item.disabled" :value="item.value">
                {{ item.label }}
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item name="email" v-if="form.type === 1">
            <a-input v-model:value="form.email" :placeholder="t('邮箱')" autoComplete="on" bordered />
          </a-form-item>
          <a-form-item name="mobile" v-if="form.type === 2">
            <vco-mobile-input v-model:value="form.mobile" v-model:areaCode="form.pre" :disabled="false" class="login_form_button"></vco-mobile-input>
          </a-form-item>
          <a-form-item name="password" v-if="form.mode === 1">
            <a-input type="password" v-model:value="form.password" :placeholder="t('密码')" autoComplete="on" @keyup.enter="submit" />
          </a-form-item>
          <a-form-item no-style v-if="form.mode === 2">
            <a-row :gutter="8">
              <a-col :span="18">
                <a-form-item name="code">
                  <a-input v-model:value="form.code" :placeholder="t('验证码V')" />
                </a-form-item>
              </a-col>
              <a-col :span="6" v-if="!showCountdown">
                <a-form-item class="login_form_button">
                  <a-button block @click="handleVerify()" :disabled="(form.type == 1 && !form.email) || (form.type == 2 && !form.mobile)">
                    {{ t('验证') }}
                  </a-button>
                </a-form-item>
              </a-col>
              <a-col :span="6" v-else>
                <a-form-item class="login_form_button">
                  <vco-countdown v-model:show="showCountdown" class="login_countdown_button" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form-item>
          <div class="flex justify-between">
            <p class="forgot">
              <router-link class="forgot_link" to="/forgot-reset">
                {{ t('忘记密码') }}
              </router-link>
            </p>
            <p class="type-text" @click="form.mode = form.mode === 1 ? 2 : 1">
              {{ form.mode == 2 ? t('密码') : t('验证码') }} <span class="lowercase">{{ t('登录') }}</span>
            </p>
          </div>
          <a-form-item class="login_submit mt-4">
            <a-button size="large" class="big bold" shape="round" :loading="loading" @click="submit">
              {{ t('登录') }}
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </template>
  </auth-template>
  <select-account v-if="open" v-model:open="open" :accountList="accountList" @loginSuccessCb="loginSuccessCb" />
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import { useRoute } from 'vue-router';
import router from '@/router';
import { useUserStore } from '@/store';
import SelectAccount from './components/SelectAccount.vue';
import { getMobileCode, getEmailCode } from '@/api/auth';
import { EMAIL_RULE } from '@/constant';
import { pub } from '@/api/system';

const { t } = useI18n();
const route = useRoute();

const formRef = ref();
const userStore = useUserStore();
const open = ref(false);
const accountList = ref(false);
const showCountdown = ref(false);
const showRegisterBtn = ref(false);

const loginModeOptions = [
  {
    value: 1,
    label: t('邮箱')
  },
  {
    value: 2,
    label: t('手机')
  }
];

// 加载状态
const loading = ref(false);

// 表单数据
const form = reactive({
  type: 1,
  mode: 1,
  email: '',
  password: '',
  pre: '64',
  mobile: ''
});

// 表单验证规则
const rules = reactive({
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
  password: [
    {
      required: true,
      message: t('请输入') + t('密码'),
      type: 'string',
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
  ],
  code: [
    {
      required: true,
      message: t('请输入') + t('验证码V'),
      type: 'string',
      trigger: 'blur'
    }
  ]
});

function goHomeRoute() {
  const redirect = route.query.redirect || '/';
  router.replace(redirect);
}

const handleVerify = () => {
  let ajax = null;
  let params = {};
  if (form.type === 1) {
    params = {
      email: form.email
    };
    ajax = getEmailCode;
  } else {
    params = {
      pre: form.pre,
      mobile: form.mobile
    };
    ajax = getMobileCode;
  }

  ajax(params).then(() => {
    showCountdown.value = true;
  });
};

const loginSuccessCb = (res) => {
  if (res.smsVerify) {
    router.push('/verify');
    return;
  }
  loading.value = false;
  goHomeRoute();
  message.success(t('登录成功'));
};

const loginParams = () => {
  const { email, password, mobile, pre, code } = form;
  if (form.type === 1 && form.mode == 1) {
    return {
      email,
      password
    };
  } else if (form.type === 2 && form.mode == 1) {
    return {
      pre,
      mobile,
      password
    };
  } else if (form.type === 1 && form.mode == 2) {
    return {
      email,
      code
    };
  } else if (form.type === 2 && form.mode == 2) {
    return {
      pre,
      mobile,
      code
    };
  }
};

const submit = () => {
  if (!formRef.value) {
    return;
  }
  if (loading.value) return;
  formRef.value
    .validate()
    .then(() => {
      loading.value = true;
      userStore
        .login(loginParams())
        .then((res) => {
          if (res.user) {
            open.value = true;
            accountList.value = res.user;
          } else {
            loginSuccessCb(res);
          }
        })
        .catch(() => {
          loading.value = false;
        });
    })
    .catch(() => {});
};

const requestRegisterSwitch = () => {
  pub()
    .then((res) => {
      if (!res) return;
      showRegisterBtn.value = res.register_open == 1;
    })
    .catch(() => {});
};

watch(open, (newVal, oldVal) => {
  if (!newVal && oldVal) {
    showCountdown.value = false;
    loading.value = false;
  }
});

onMounted(() => {
  localStorage.clear('smsVerify');
  requestRegisterSwitch();
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.login_content {
  padding: 72px 84px;
  color: @clr_white;

  @media (max-width: 560px) {
    padding: 48px 18px;
  }

  .login_form_title {
    width: 360px;

    h1 {
      font-size: 64px;
      font-weight: 500;
      margin-bottom: 32px;
      text-align: center;

      .vc_text {
        color: #fbfbfb;
      }

      .online_text {
        color: #b4f1db;
      }
    }
  }

  .login_form_container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;

    // ----------------------input-----------------
    :deep(.ant-input) {
      width: 100%;
      padding: 18px;
      border-radius: 10px;
      background-color: transparent;
      background: transparent;
      color: @clr_white;
      font-weight: 400;
    }

    // placeholder color
    :deep(.ant-input::-webkit-input-placeholder) {
      color: @color_grayer;
    }

    :deep(.ant-input:hover) {
      border-color: @clr_white;
      border-inline-end-width: 1px;
    }

    :deep(.ant-input-status-error:not(.ant-input-disabled):not(.ant-input-borderless).ant-input),
    :deep(.ant-input-status-error:not(.ant-input-disabled):not(.ant-input-borderless).ant-input:hover) {
      background: transparent;
      border-color: @clr_white;
    }

    // -----------------button----------------------
    .login_form_button {
      :deep(.ant-btn) {
        padding: 18px;
        height: auto;
        border-radius: 10px;
      }
      :deep(.ant-btn:hover) {
        border-color: @clr_white;
        border-inline-end-width: 1px;
      }
    }

    .login_countdown_button {
      background-color: @clr_white;
      color: @clr_charcoal;
    }

    // -----------------dropdown select-------------
    :deep(.ant-dropdown-trigger) {
      background: transparent;
      color: @clr_white;
    }

    // --------------radio-----------------
    :deep(.ant-radio) {
      color: @clr_white;
    }

    :deep(.ant-radio-wrapper .ant-radio-checked .ant-radio-inner) {
      border: @clr_cyan;
      background-color: @clr_cyan;
    }

    :deep(.ant-radio-wrapper:hover .ant-radio-inner) {
      border-color: @clr_cyan;
    }

    :deep(.ant-radio-wrapper) {
      color: @clr_white;
    }

    .login_mode_radio {
      display: flex;
      // justify-content: space-between;
    }

    .login_submit {
      text-align: center;

      button {
        width: 30%;
      }
    }
  }

  .forgot {
    text-align: right;
    margin-bottom: 1rem;

    .forgot_link {
      font-size: @fs_xs;
      font-weight: 600;
      padding-top: 6px;
      padding-bottom: 6px;
      color: @clr_white;
    }
  }
}

// hover到button上的样式
.ant-btn-default:not(:disabled):hover {
  color: @clr_charcoal;
  border-color: transparent;
}

:deep(.ant-btn-default:disabled) {
  background: #fff;
}

:deep(.ant-tabs) {
  .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
    color: #fff;
  }
  .ant-tabs-ink-bar {
    background: #fff;
  }
  .ant-tabs-tab:hover {
    color: #fff;
  }
}
.type-text {
  color: #fff;
  cursor: pointer;
}
</style>
