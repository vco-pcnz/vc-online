<template>
  <auth-template>
    <template #header>
      <router-link to="/register">
        <a-button style="background-color: #b4f1db"> {{ t("注册") }} </a-button>
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
        <a-form
          ref="formRef"
          :model="form"
          :rules="rules"
          class="login_form_container"
        >
          <a-form-item name="email">
            <a-input
              class="login_input_content"
              v-model:value="form.email"
              :placeholder="t('邮箱')"
              autoComplete="on"
              bordered
            />
          </a-form-item>
          <a-form-item name="password">
            <a-input
              type="password"
              v-model:value="form.password"
              class="login_input_content"
              :placeholder="t('密码')"
              autoComplete="on"
              @pressEnter="submit"
            />
          </a-form-item>
          <p class="forgot">
            <router-link class="forgot_link" to="/password-reset">
              {{ t("忘记密码") }}
            </router-link>
          </p>
          <a-form-item class="login_submit">
            <a-button size="large" :loading="loading" @click="submit">
              {{ t("登录") }}
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </template>
  </auth-template>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue/es";
import { useRoute } from "vue-router"
import router from "@/router";
import { useUserStore } from '@/store';

const { t } = useI18n();
const route = useRoute()

const formRef = ref();
const userStore = useUserStore()

// 加载状态
const loading = ref(false);

// 表单数据
const form = reactive({
  email: "",
  password: "",
});

// 表单验证规则
const rules = reactive({
  email: [
    {
      required: true,
      message: t("请输入") + t("邮箱"),
      type: "string",
      trigger: "blur",
    },
    {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: t("邮箱格式不正确"),
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

function goHomeRoute() {
  const redirect = route.query.redirect || '/';
  console.log('redirect', redirect)
  router.replace(redirect);
}

const submit = () => {
  if (!formRef.value) {
    return;
  }
  formRef.value
    .validate()
    .then(() => {
      loading.value = true;
      userStore.login(form)
        .then(() => {
          goHomeRoute();
          message.success(t("登录成功"));
        })
        .catch(() => {
          loading.value = false;
        });
    })
    .catch(() => {});
};
</script>

<style scoped lang="less">
@import "@/styles/variables.less";

.login_content {
  padding: 72px 84px;
  color: @clr_white;

  @media (max-width: 560px) {
    padding: 48px 24px;
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

    .login_input_content {
      box-sizing: border-box;
      width: 100%;
      padding: 24px;
      border-radius: 10px;
      background-color: transparent;
      background: transparent;
      color: @clr_white;
      font-weight: 400;
    }

    // placeholder color
    .login_input_content::-webkit-input-placeholder {
      color: @clr_white;
    }

    .ant-input-status-error:not(.ant-input-disabled):not(
        .ant-input-borderless
      ).ant-input,
    .ant-input-status-error:not(.ant-input-disabled):not(
        .ant-input-borderless
      ).ant-input:hover {
      background: transparent;
      border-color: @clr_white;
    }

    :v-deep .ant-input:-webkit-input-placeholder {
      color: @color_white_50;
    }

    //  hover到input框上的样式
    .ant-input:hover {
      border-color: @clr_white;
      border-inline-end-width: 1px;
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
</style>
