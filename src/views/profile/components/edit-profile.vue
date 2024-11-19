<template>
  <div class="edit-profile-container">
    <div class="profile-info">
      <div class="profile-info-header">
        <div class="avatar">
          <vco-avatar :size="124" style="margin: auto" />
        </div>
        <div class="info-detail">
          <p v-for="info in userInfo">
            <span class="label">
              <i
                class="iconfont text-2xl"
                v-html="info.icon"
                v-if="info.icon"
              />
              {{ info.label }}:
            </span>
            <span class="value">{{ info.value }}</span>
          </p>
        </div>
      </div>
      <div class="profile-info-detail">
        <p v-for="info in extraInfo">
          <span class="label">
            <i class="iconfont text-2xl" v-html="info.icon" v-if="info.icon" />
          </span>
          <span class="detail">{{ info.value }}</span>
        </p>
      </div>
    </div>
    <div class="profile-form">
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
            <a-form-item>
              <a-button
                size="large"
                :loading="loading"
                @click="submit"
                block
                class="submit-btn"
              >
                {{ t("提交") }}
              </a-button>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/store";
import { preMobileOpts, EMAIL_RULE, PASSWORD_RULE } from "@/constant";

const { t } = useI18n();
const userStore = useUserStore();
const formRef = ref();
const loading = ref(false);

const userInfo = reactive([
  {
    label: "ID",
    value: "123456789",
  },
  {
    icon: "&#xe73b;",
    label: t("名字"),
    value: "John",
  },
  {
    icon: "&#xe66f;",
    label: t("邮箱"),
    value: "hanmeimei@vco.com",
  },
  {
    icon: "&#xe61d;",
    label: t("手机号"),
    value: "+64 17002877777",
  },
]);

const extraInfo = reactive([
  {
    icon: "&#xe8db;",
    value: ["vip", "broker"],
  },
]);

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
.edit-profile-container {
  display: grid;
  grid-template-columns: 315px 1fr;
  gap: 24px;
  align-items: flex-start;

  .profile-info {
    overflow: hidden;
    border: 1px solid @color_mist;
    background-color: @clr_card_bg;
    border-radius: 12px;

    &-header {
      padding: 30px;
      border-bottom: 1px solid @color_mist;

      .avatar {
        width: 100%;
      }

      .info-detail {
        margin-top: 16px;
      }
    }

    &-detail {
      padding: 30px;
    }

    .label {
      color: @color_grey;
      font-weight: 500;
    }

    .value {
      font-weight: 500;
    }
  }

  .profile-form {
    border: 1px solid @color_mist;
    background-color: @clr_card_bg;
    border-radius: 12px;
    padding: 30px;

    .ant-btn {
      background-color: @clr_charcoal;
      color: @clr_white;
    }

    .submit-btn {
      background-color: @clr_cyan;
      color: @clr_charcoal;
    }
  }
}
</style>
