<template>
  <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
    <a-row :gutter="8">
      <a-col :span="8">
        <a-form-item name="firstName" :label="t('名')">
          <a-input v-model:value="form.firstName" :placeholder="t('名')" />
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item name="middleName" :label="t('中间名')">
          <a-input v-model:value="form.middleName" :placeholder="t('中间名')" />
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
            <a-input v-model:value="form.email" :placeholder="t('邮箱')" />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item label=" ">
            <a-button @click="sendVerify" block class="validate_btn">
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
    <a-form-item name="about" :label="t('关于')">
      <a-textarea v-model:value="form.about" :placeholder="t('关于')" />
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

<script setup>
import { ref, reactive } from "vue";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/store";
import { preMobileOpts, EMAIL_RULE } from "@/constant";

const { t } = useI18n();
const userStore = useUserStore();
const formRef = ref();
const loading = ref(false);

// 表单数据
const form = reactive({
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  pre: "64",
  mobile: "",
  about: "",
  code: "",
});

// 表单验证规则
const rules = reactive({
  firstName: [
    {
      required: true,
      message: t("请输入") + t("名"),
      type: "string",
      trigger: "blur",
    },
  ],
  middleName: [
    {
      required: true,
      message: t("请输入") + t("中间名"),
      type: "string",
      trigger: "blur",
    },
  ],
  lastName: [
    {
      required: true,
      message: t("请输入") + t("姓"),
      type: "string",
      trigger: "blur",
    },
  ],
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
});

const submit = () => {
  formRef.value.validate().then(() => {
    loading.value = true;
    // roleApply({
    //   ...form,
    //   email: JSON.parse(JSON.stringify(query.email)),
    //   type: termsType.broker,
    // })
    //   .then(() => {
    //     loading.value = false;
    //     replace("/login");
    //   })
    //   .catch(() => {
    //     loading.value = false;
    //   });
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
