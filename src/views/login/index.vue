<template>
  <auth-template>
    <template #header>
      <img :src="logoImg" alt="VC Online" />
      <router-link to="/register">
        <a-button variant="cyan"> {{ t("注册") }} </a-button>
      </router-link>
    </template>
    <template #content>
      <div class="login_content">
        <div class="login_form_title">
          <h1>
            <span class="vc_text">VC </span>
            <span class="online_text">Online</span>
          </h1>
        </div>
        <a-form class="login_form_container" @onFinish="handleFinish" :rules="rules">
          <a-form-item name="email">
            <a-input
              class="login_input_content"
              :placeholder="t('请输入') + t('邮箱')"
              autoComplete="on"
            />
          </a-form-item>
          <a-form-item name="password">
            <a-input
              type="password"
              class="login_input_content"
              :placeholder="t('请输入') + t('密码')"
              autoComplete="on"
            />
          </a-form-item>
          <p class="forgot">
            <router-link class="forgot_link" to="/password-reset">
              {{ t("忘记密码") }}
            </router-link>
          </p>
          <div class="login_btn">
            <a-button variant="white" size="large" htmlType="submit">
              {{ t("登录") }}
            </a-button>
          </div>
        </a-form>
      </div>
    </template>
  </auth-template>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useI18n } from "vue-i18n";
import logoImg from "@/assets/images/auth_logo.svg";
import { login } from "@/api/auth";

const { t } = useI18n();

// 表单验证规则
const rules = reactive({
  email: [
    {
      required: true,
      message: t("请输入") + t("邮箱"),
      type: "string",
      trigger: "blur",
    },
  ],
  password: [
    {
      required: true,
      message: t("请输入") + t("密码"),
      type: "string",
      trigger: "blur",
    },
  ],
});

const handleFinish = (values) => {
  login(values);
};
</script>

<style scoped lang="less">
@import "@/styles/variables.less";

.login_content {
  padding: 72px 84px;

  @media (max-width: 560px) {
    padding: 48px 24px;
  }

  .login_form_title {
    width: 360px;

    h1 {
      font-size: 64px;
      font-weight: 500;
      margin-bottom: 32px;

      .vc_text {
        color: #fbfbfb;
      }

      .online_text {
        color: #b4f1db;
      }
    }

    .login_form_container {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      width: 100%;

      .login_input_content {
        box-sizing: border-box;
        width: 100%;
        padding: 24px;
        border: 1px solid #fbfbfb;
        border-radius: 10px;
        background-color: transparent;
        background: transparent;
        color: #fbfbfb;
        font-weight: 400;
      }

      .ant-input-status-error:not(.ant-input-disabled):not(
          .ant-input-borderless
        ).ant-input,
      .ant-input-status-error:not(.ant-input-disabled):not(
          .ant-input-borderless
        ).ant-input:hover {
        background: transparent;
        border-color: #fbfbfb;
      }

      .login_btn {
        display: flex;
        justify-content: center;
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
}
</style>
