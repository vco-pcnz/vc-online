<template>
  <profile-layout active-tab="safe">
    <template #content>
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
        <a-form-item name="type">
          <a-radio-group v-model:value="form.type">
            <a-radio
              v-for="item in radioOptions"
              :key="item.value"
              :disabled="item.disabled"
              :value="item.value"
              >{{ item.label }}</a-radio
            >
          </a-radio-group>
        </a-form-item>
        <template v-if="form.type === 1">
          <a-form-item no-style>
            <a-row :gutter="8">
              <a-col :span="20">
                <a-form-item name="email" :label="t('邮箱')">
                  <a-input
                    v-model:value="form.email"
                    :placeholder="t('邮箱')"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="4">
                <a-form-item label=" ">
                  <a-button
                    @click="handleVerify(VERIFY_KEY.EMAIL)"
                    block
                    class="validate_btn"
                  >
                    {{ t("验证") }}
                  </a-button>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form-item>
        </template>
        <template v-if="form.type === 2">
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
                <a-input
                  v-model:value="form.mobile"
                  :placeholder="t('手机号')"
                />
              </a-col>
              <a-col :span="4" v-if="!showCountdown">
                <a-form-item-rest>
                  <a-button @click="handleVerify(VERIFY_KEY.MOBILE)" block>
                    {{ t("验证") }}
                  </a-button>
                </a-form-item-rest>
              </a-col>
              <a-col :span="4" v-else>
                <a-form-item-rest>
                  <countdown v-model:show="showCountdown" />
                </a-form-item-rest>
              </a-col>
            </a-row>
          </a-form-item>
        </template>
        <a-form-item name="code" :label="t('验证码V')" v-if="showCode">
          <a-input v-model:value="form.code" :placeholder="t('验证码V')" />
        </a-form-item>
        <a-form-item name="password" :label="t('新密码')">
          <a-input-password
            type="password"
            v-model:value="form.password"
            :placeholder="t('新密码')"
          />
        </a-form-item>
        <a-form-item name="confirmPassword" :label="t('确认密码')">
          <a-input-password
            type="password"
            v-model:value="form.confirmPassword"
            :placeholder="t('确认密码')"
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
import { ref, reactive, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useUserDetailStore } from "@/store";
import {
  preMobileOpts,
  EMAIL_RULE,
  PASSWORD_RULE,
  VERIFY_KEY,
} from "@/constant";
import profileLayout from "../components/profile-layout.vue";
import countdown from "../components/countdown.vue";
import { modifyUserPwd, sendCodeOldE, sendCodeOldM } from "@/api/users";
import { message } from "ant-design-vue";
import { trim } from "lodash";
import useFormData from "@/utils/use-form-data";

const { t } = useI18n();
const userDetailStore = useUserDetailStore();
const formRef = ref();
const loading = ref(false);
const showCode = ref(false);
const showCountdown = ref(false);
const radioOptions = ref([]);

// 表单数据
const { form, assignFields } = useFormData({
  type: 1,
  email: "",
  pre: "64",
  mobile: "",
  code: "",
  password: "",
  confirmPassword: "",
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
      message: t("最少8个字符,1个大写字母,字母和数字"),
      type: "string",
      trigger: "blur",
    },
  ],
  confirmPassword: [
    {
      required: true,
      validator: (rule, value) => {
        if (value !== form.password) {
          return Promise.reject(t("两次输入的密码不一致"));
        }
        return Promise.resolve();
      },
      trigger: "blur",
    },
  ],
});

const handleVerify = (key) => {
  if (key === VERIFY_KEY.EMAIL) {
    formRef.value.validate(["email"]).then(() => {
      sendCodeOldE().then(() => {
        showCode.value = true;
        showCountdown.value = true;
      });
    });
  } else if (key === VERIFY_KEY.MOBILE) {
    formRef.value.validate(["mobile"]).then(() => {
      sendCodeOldM().then(() => {
        showCode.value = true;
        showCountdown.value = true;
      });
    });
  }
};

const submit = () => {
  formRef.value.validate().then(() => {
    if (!trim(form.code)) {
      const msg = form.type === 1 ? t("请先做邮箱验证") : t("请先做手机号验证");
      message.warning(msg);
      return;
    }
    modifyUserPwd({
      type: form.type,
      code: form.code,
      password: form.password,
    })
      .then(() => {
        loading.value = false;
        message.success(t("修改成功"));
      })
      .catch(() => {
        loading.value = false;
      });
  });
};

const getRadioOptions = (email_ok, mobile_ok) => {
  const emailOpt = {
    label: t("邮箱"),
    value: 1,
  };
  const mobileOpt = {
    label: t("手机号"),
    value: 2,
  };
  if (email_ok && mobile_ok) {
    radioOptions.value = [emailOpt, mobileOpt];
  } else if (mobile_ok) {
    radioOptions.value = [
      {
        ...mobileOpt,
        disabled: true,
      },
    ];
  } else {
    radioOptions.value = [
      {
        ...emailOpt,
        disabled: true,
      },
    ];
  }
};

watch(
  () => userDetailStore.userDetail,
  (val) => {
    if (val) {
      const { email, mobile, email_ok, mobile_ok } = val;
      getRadioOptions(email_ok, mobile_ok);
      assignFields({
        ...form,
        email,
        mobile,
        type: email_ok || (!email_ok && !mobile_ok) ? 1 : 2,
      });
    }
  }
);
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
