<template>
  <profile-layout active-tab="safe">
    <template #content>
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
        <a-form-item no-style>
          <a-row :gutter="8">
            <a-col :span="20">
              <a-form-item name="email" :label="t('邮箱')">
                <a-input v-model:value="form.email" :placeholder="t('邮箱')" />
              </a-form-item>
            </a-col>
            <a-col :span="4">
              <a-form-item label=" ">
                <a-button @click="handleChange" block class="validate_btn">
                  {{ t("变更") }}
                </a-button>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item :label="t('手机号')" name="mobile">
          <a-row :gutter="8">
            <a-col :span="4">
              <a-form-item-rest>
                <a-select
                  v-model:value="form.pre"
                  :options="preMobileOpts"
                  class="pre_mobile"
                />
              </a-form-item-rest>
            </a-col>
            <a-col :span="16">
              <a-input v-model:value="form.mobile" :placeholder="t('手机号')" />
            </a-col>
            <a-col :span="4">
              <a-form-item-rest>
                <a-button @click="sendVerify" block>
                  {{ t("验证") }}
                </a-button>
              </a-form-item-rest>
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item name="code" :label="t('验证码V')">
          <a-input v-model:value="form.code" :placeholder="t('验证码V')" />
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
        <a-row>
          <a-col :span="6" :offset="9">
            <a-button
              size="large"
              :loading="loading"
              @click="submit"
              block
              class="submit-btn"
            >
              {{ t("提交") }}
            </a-button>
          </a-col>
        </a-row>
      </a-form>
    </template>
  </profile-layout>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/store";
import { preMobileOpts, EMAIL_RULE, PASSWORD_RULE } from "@/constant";
import profileLayout from "../components/profile-layout.vue";

const { t } = useI18n();
const userStore = useUserStore();
const formRef = ref();
const loading = ref(false);

// 表单数据
const form = reactive({
  email: "",
  pre: "64",
  mobile: "",
  code: "",
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
      pattern: EMAIL_RULE,
      message: t("邮箱格式不正确"),
    },
  ],
  code: [
    {
      required: true,
      message: t("请输入") + t("验证码V"),
      type: "string",
      trigger: "blur",
    },
  ],
  mobile: [
    {
      required: true,
      message: t("请输入") + t("手机号"),
      type: "string",
      trigger: "blur",
    },
  ],
  password: [
    {
      required: true,
      pattern: PASSWORD_RULE,
      type: "string",
      trigger: "blur",
    },
  ],
});

const handleChange = () => {};

const sendVerify = () => {};

const submit = () => {
  formRef.value.validate().then(() => {
    loading.value = true;
  });
};
</script>

<style scoped lang="less">
@import "@/styles/variables.less";
.ant-btn {
  background-color: @clr_charcoal;
  color: @clr_white;
}

.submit-btn {
  background-color: @clr_cyan;
  color: @clr_charcoal;
}
</style>
