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
            <a-input
              v-model:value="form.email"
              :placeholder="t('邮箱')"
              :disabled="!!userInfo?.email_ok"
            />
          </a-form-item>
        </a-col>
        <a-col :span="4" v-if="!verifyEmail.showCountdown">
          <a-form-item label=" ">
            <a-button
              v-if="!userInfo?.email_ok"
              @click="handleVerify(VERIFY_KEY[0])"
              block
              class="verify-btn"
            >
              {{ t("验证") }}
            </a-button>
            <a-button
              v-else
              @click="handleChange(VERIFY_KEY[0])"
              block
              class="verify-btn"
            >
              {{ t("变更") }}
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
              :disabled="!!userInfo?.mobile_ok"
            />
          </a-form-item-rest>
        </a-col>
        <a-col :span="16">
          <a-input
            v-model:value="form.mobile"
            :placeholder="t('手机号')"
            :disabled="!!userInfo?.mobile_ok"
          />
        </a-col>
        <a-col :span="4" v-if="!verifyMobile.showCountdown">
          <a-form-item-rest>
            <a-button
              v-if="!userInfo?.mobile_ok"
              @click="handleVerify(VERIFY_KEY[1])"
              block
              class="verify-btn"
            >
              {{ t("验证") }}
            </a-button>
            <a-button
              v-else
              @click="handleChange(VERIFY_KEY[1])"
              block
              class="verify-btn"
            >
              {{ t("变更") }}
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
      <a-input v-model:value="form.mobileCode" :placeholder="t('验证码V')" />
    </a-form-item>
    <a-form-item name="about" :label="t('关于')">
      <a-textarea v-model:value="form.about" :placeholder="t('关于')" />
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
          {{ t("提交") }}
        </a-button>
      </a-col>
    </a-row>
  </a-form>
</template>

<script setup>
import { ref, reactive, watch, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import { preMobileOpts, EMAIL_RULE } from "@/constant";
import useFormData from "@/utils/use-form-data";
import countdown from "../components/countdown.vue";

const { t } = useI18n();
const formRef = ref();
const loading = ref(false);
const props = defineProps(["userInfo"]);
const VERIFY_KEY = ["email", "mobile"];
const verifyEmail = reactive({
  showCode: false,
  showCountdown: false,
});
const verifyMobile = reactive({
  showCode: false,
  showCountdown: false,
});

// 表单数据
const { form, resetFields, assignFields } = useFormData({
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  emailCode: "",
  pre: "64",
  mobile: "",
  about: "",
  mobileCode: "",
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
      pattern: EMAIL_RULE,
      message: t("邮箱格式不正确"),
    },
  ],
});

const handleVerify = (key) => {
  if (key === VERIFY_KEY[0]) {
    verifyEmail.showCode = true;
    verifyEmail.showCountdown = true;
  } else if (key === VERIFY_KEY[1]) {
    verifyMobile.showCode = true;
    verifyMobile.showCountdown = true;
  }
};

const handleChange = (key) => {
  if (key === VERIFY_KEY[0]) {
    verifyEmail.showCode = true;
  } else if (key === VERIFY_KEY[1]) {
    verifyMobile.showCode = true;
  }
};

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

watch(
  () => props.userInfo,
  (val) => {
    if (val) {
      const { firstName, middleName, lastName, email, pre, mobile, intro } =
        val;
      assignFields({
        firstName,
        middleName,
        lastName,
        email,
        pre,
        mobile,
        about: intro,
      });
    }
  },
  {
    immediate: true,
  }
);

</script>

<style scoped lang="less">
@import "@/styles/variables.less";
.verify-btn {
  background-color: @clr_charcoal;
  color: @clr_white;
}
</style>
