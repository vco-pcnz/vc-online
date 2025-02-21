<template>
  <auth-template>
    <template #header>
      <router-link to="/login">
        <a-button type="cyan" shape="round">{{ t('登录') }}</a-button>
      </router-link>
    </template>
    <template #content>
      <section class="register-content">
        <router-link to="/login" class="back-link" tabindex="-1">
          <div class="back-link-icon">
            <i class="iconfont">&#xe794;</i>
          </div>
        </router-link>
        <h1 class="title">
          {{ t('注册') }}
        </h1>
        <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
          <a-form-item name="firstName" :label="t('名')">
            <a-input
              v-model:value="form.firstName"
              class="input_content"
              :placeholder="t('名')"
            />
          </a-form-item>
          <a-form-item name="middleName" :label="t('中间名')">
            <a-input
              v-model:value="form.middleName"
              class="input_content"
              :placeholder="t('中间名')"
            />
          </a-form-item>
          <a-form-item name="lastName" :label="t('姓')">
            <a-input
              v-model:value="form.lastName"
              class="input_content"
              :placeholder="t('姓')"
            />
          </a-form-item>
          <a-form-item no-style>
            <a-row>
              <a-col :span="17">
                <a-form-item name="email" :label="t('邮箱')">
                  <a-input
                    v-model:value="form.email"
                    class="input_content"
                    :placeholder="t('邮箱')"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="1" />
              <a-col :span="6">
                <a-form-item label=" " v-if="!sentAuthCode">
                  <a-button @click="sendVerify" block class="inline_btn">
                    {{ t('验证') }}
                  </a-button>
                </a-form-item>
                <a-form-item label=" " v-else>
                  <vco-countdown class="inline_btn" v-model:show="sentAuthCode" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
            name="code"
            :label="t('验证码')"
            class="verifyCode_input_container"
            v-if="sentAuthCode || showCode"
          >
            <a-input
              v-model:value="form.code"
              class="input_content"
              v-focus="true"
              :placeholder="t('验证码')"
            />
          </a-form-item>
          <a-form-item :label="t('手机号')" name="mobile">
            <div class="mobile-content">
              <vco-mobile-input
                v-model:value="form.mobile"
                v-model:areaCode="form.pre"
              ></vco-mobile-input>
            </div>
          </a-form-item>
          <a-form-item
            name="password"
            :label="t('密码')"
            :help="t('最少8个字符,1个大写字母,字母和数字')"
            class="psw_input_content"
          >
            <a-input-password
              type="password"
              v-model:value="form.password"
              class="input_content"
              :placeholder="t('密码')"
            />
          </a-form-item>
          <a-form-item no-style>
            <a-checkbox v-model:checked="isBroker">
              {{ t('成为中介') }}
            </a-checkbox>
          </a-form-item>
          <a-form-item>
            <a-form-item name="acceptTerm" no-style>
              <a-checkbox v-model:checked="acceptTerm">
                {{ t('我接受') }}
              </a-checkbox>
              <a @click="termModalOpen = true" class="link">
                {{ t('条款与条件') }}
              </a>
            </a-form-item>
          </a-form-item>
          <a-form-item>
            <a-button
              type="dark"
              shape="round"
              :loading="loading"
              class="register-btn big shadow bold"
              @click="submit"
            >
              {{ t('注册') }}
            </a-button>
          </a-form-item>
        </a-form>
      </section>
    </template>
  </auth-template>
  <term-modal v-model:open="termModalOpen" :type="termsType.register" />
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { register, sendAuthCode } from '@/api/auth';
import { message } from 'ant-design-vue/es';
import TermModal from './components/term-modal.vue';
import { trim } from 'lodash';
import { termsType, EMAIL_RULE, PASSWORD_RULE } from '@/constant';

const { t } = useI18n();
const { replace } = useRouter();

const loading = ref(false);
const formRef = ref();
const acceptTerm = ref(false);
const termModalOpen = ref(false);
const isBroker = ref(false);
const sentAuthCode = ref(false);
const showCode = ref(false);

// 表单数据
const form = reactive({
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  pre: '64',
  mobile: '',
  password: '',
  code: '',
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
  code: [
    {
      required: true,
      message: t('请输入') + t('验证码'),
      type: 'string',
      trigger: 'blur',
    },
  ],
  mobile: [
    {
      // required: true,
      message: t('请输入') + t('手机号'),
      type: 'string',
      trigger: 'blur',
    },
  ],
  password: [
    {
      required: true,
      pattern: PASSWORD_RULE,
      type: 'string',
      trigger: 'blur',
    },
  ],
});

const sendVerify = () => {
  formRef.value.validateFields('email').then(() => {
    sendAuthCode({
      email: form.email,
    }).then(() => {
      sentAuthCode.value = true;
      showCode.value = true;
    });
  });
};

const submit = () => {
  formRef.value
    .validate()
    .then(() => {
      if (!trim(form.code)) {
        message.warning(t('请先做邮箱验证'));
        return;
      }
      if (!acceptTerm.value) {
        message.warning(t('请先查阅并接受条款'));
        return;
      }
      loading.value = true;
      register(form)
        .then(() => {
          loading.value = false;
          message.success(t('注册成功'));
          if (isBroker.value) {
            replace({
              name: 'register-broker',
              query: {
                email: form.email,
              },
            });
          } else {
            replace('/login');
          }
        })
        .catch(() => {
          loading.value = false;
        });
    })
    .catch(() => {});
};
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.go_login_btn {
  background-color: @clr_cyan;
}

.go_login_btn:hover {
  color: @clr_charcoal;
}
.back-link {
    position: absolute;
    top: 24px;
    left: 24px;
    color: @color_brown;
    &-icon {
      transform: rotate(-135deg);
      font-size: 14px;
    }
  }
.register-content {
  border-radius: 24px;
  background-color: @color_white;
  padding: 72px 84px;
  overflow-x: auto;
  position: relative;

  .input_content {
    box-sizing: border-box;
    width: 100%;
    padding: 14px 12px;
    border-radius: 10px;
    background-color: transparent;
    background: transparent;
  }

  .mobile-content {
    :deep(.area-code-btn) {
      height: 52px;
      border-radius: 10px;
    }
    :deep(.ant-input) {
      padding: 14px 12px;
      border-radius: 10px;
    }
  }

  .title {
    font-size: @fs_2xl;
    font-weight: 500;
    line-height: 1.1;
    margin-bottom: 40px;
    text-align: center;
  }

  .inline_btn {
    padding: 14px;
    height: auto;
  }

  .pre_mobile {
    :deep(.ant-select-selector) {
      padding: 6px;
      height: auto;
    }
  }

  .register-btn {
    width: 100%;
  }

  .psw_input_content {
    :deep(.ant-form-margin-offset) {
      margin-bottom: 0 !important;
    }
  }
}
</style>
