<template>
  <auth-template>
    <template #content>
      <section class="reset-content">
        <router-link to="/login" class="back-link" tabindex="-1">
          <div class="back-link-icon">
            <i class="iconfont">&#xe794;</i>
          </div>
        </router-link>
        <h1 class="title">
          {{ t('忘记密码') }}
        </h1>
        <div class="sys-form-content mt-5">
          <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
            <a-form-item name="email" :label="t('邮箱')">
              <a-input
                v-model:value="form.email"
                autoComplete="on"
                :disabled="isResetPwd"
              />
            </a-form-item>
            <a-form-item name="code" :label="t('验证码')" v-show="isResetPwd">
              <a-input v-model:value="form.code" :placeholder="t('验证码')" />
            </a-form-item>
            <a-form-item
              v-show="isResetPwd"
              name="password"
              :label="t('密码')"
              :help="t('最少8个字符,1个大写字母,字母和数字')"
            >
              <a-input
                type="password"
                v-model:value="form.password"
                :placeholder="t('密码')"
                autoComplete="on"
              />
            </a-form-item>
            <a-form-item>
              <a-button
                type="dark"
                shape="round"
                :loading="loading"
                v-if="isResetPwd"
                class="reset_btn big shadow bold"
                @click="submit"
              >
                {{ t('密码重置') }}
              </a-button>
              <a-button
                type="dark"
                shape="round"
                :loading="loading"
                class="reset_btn big shadow bold"
                @click="sendAuthCode"
              >
                {{ isResetPwd ? t('重新发送验证码') : t('发送验证码') }}
              </a-button>
            </a-form-item>
          </a-form>
        </div>
      </section>
    </template>
  </auth-template>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { resetPwd, saveNewPwd } from '@/api/auth';
import { PASSWORD_RULE } from '@/constant';
import { message } from 'ant-design-vue';

const { t } = useI18n();
const { push } = useRouter();

const loading = ref(false);
const formRef = ref();
const isResetPwd = ref(false);

// 表单数据
const form = reactive({
  email: '',
});

// 表单验证规则
const rules = reactive({
  email: [
    {
      required: true,
      message: t('请输入') + t('邮箱'),
      type: 'string',
      trigger: 'blur',
    },
    {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
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
  password: [
    {
      required: true,
      pattern: PASSWORD_RULE,
      type: 'string',
      trigger: 'blur',
    },
  ],
});

const sendAuthCode = () => {
  formRef.value.validate(['email']).then(() => {
    loading.value = true;
    resetPwd(form)
      .then(() => {
        loading.value = false;
        isResetPwd.value = true;
      })
      .catch(() => {
        loading.value = false;
      });
  });
};

const submit = () => {
  formRef.value.validate().then(() => {
    loading.value = true;
    saveNewPwd(form)
      .then(() => {
        push('/login');
        message.success(t('修改成功'));
        loading.value = false;
      })
      .catch(() => {
        loading.value = false;
      });
  });
};
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.reset-content {
  border-radius: 24px;
  background-color: @color_white;
  padding: 72px 84px;
  overflow-x: auto;
  position: relative;

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

  .back-link:hover {
    color: @color_brown-light;
  }

  .title {
    font-size: @fs_2xl;
    font-weight: 500;
    line-height: 1.1;
    margin-bottom: 40px;
    text-align: center;
  }

  .reset_btn {
    width: 100%;
    margin-top: 20px;
  }
}
</style>
